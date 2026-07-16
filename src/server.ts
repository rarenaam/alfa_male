import "./lib/error-capture";
import "./lib/env"; // Ensure environment validation runs on startup

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { SECURITY_CONFIG } from "./lib/security";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes

/**
 * Apply security headers to response
 */
function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  // Content Security Policy
  headers.set("Content-Security-Policy", SECURITY_CONFIG.contentSecurityPolicy);

  // Other security headers
  headers.set("X-Content-Type-Options", SECURITY_CONFIG.xContentTypeOptions);
  headers.set("X-Frame-Options", SECURITY_CONFIG.xFrameOptions);
  headers.set("Referrer-Policy", SECURITY_CONFIG.referrerPolicy);
  headers.set("Permissions-Policy", SECURITY_CONFIG.permissionsPolicy);

  // HSTS (only in production)
  if (process.env.NODE_ENV === "production") {
    headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  // Remove headers that might leak information
  headers.delete("X-Powered-By");
  headers.delete("Server");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Check rate limit for an IP address
 */
function checkRateLimit(ip: string): { allowed:boolean; retryAfter?:number } {
  const now = Date.now();
  const windowMs = SECURITY_CONFIG.rateLimit.windowMs;
  const maxRequests = SECURITY_CONFIG.rateLimit.maxRequests;

  const record = rateLimitStore.get(ip) || { count: 0, resetTime: now + windowMs };

  // Reset window if expired
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  // Check if limit exceeded
  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Increment counter
  record.count++;
  rateLimitStore.set(ip, record);

  return { allowed: true };
}

/**
 * Get client IP address from request
 */
function getClientIP(request: Request): string {
  // Check various headers that might contain the real IP
  const forwarded = request.headers.get("X-Forwarded-For");
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("X-Real-IP");
  if (realIP) return realIP;

  // Fallback to connection info (may not work in all environments)
  // @ts-ignore - properties might not exist in all environments
  if (request.headers.get("cf-connecting-ip")) {
    // Cloudflare
    // @ts-ignore
    return request.headers.get("cf-connecting-ip");
  }

  // Return placeholder if we can't determine
  return "unknown";
}

/**
 * Validate request size
 */
function checkRequestSize(request: Request): { valid:boolean; error?:string } {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (isNaN(size)) {
      return { valid: false, error: "Invalid Content-Length header" };
    }
    if (size > SECURITY_CONFIG.maxBodySize) {
      return {
        valid: false,
        error: `Request entity too large. Maximum size is ${SECURITY_CONFIG.maxBodySize} bytes`,
      };
    }
  }
  return { valid: true };
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  // Return generic error page - don't leak internal details
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      // 1. Basic request validation
      const ip = getClientIP(request);

      // 2. Check rate limit
      const rateLimitCheck = checkRateLimit(ip);
      if (!rateLimitCheck.allowed) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again later." }),
          {
            status: 429,
            headers: {
              "content-type": "application/json",
              "retry-after": String(rateLimitCheck.retryAfter),
            },
          }
        );
      }

      // 3. Check request size
      const sizeCheck = checkRequestSize(request);
      if (!sizeCheck.valid) {
        return new Response(
          JSON.stringify({ error: sizeCheck.error || "Request too large" }),
          {
            status: 413,
            headers: { "content-type": "application/json" },
          }
        );
      }

      // 4. Get handler and process request
      const handler = await getServerEntry();
      let response = await handler.fetch(request, env, ctx);

      // 5. Normalize catastrophic SSR responses
      response = await normalizeCatastrophicSsrResponse(response);

      // 6. Apply security headers
      response = applySecurityHeaders(response);

      return response;
    } catch (error) {
      // Log error for debugging but don't expose details to client
      console.error("Server error:", error);

      // Return generic error page
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
