// Security configuration constants
// Centralize security-related settings for easy maintenance

export const SECURITY_CONFIG = {
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  },

  // Content Security Policy
  contentSecurityPolicy:
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' wss: ws:; " +
    "frame-ancestors 'self'; " +
    "base-uri 'self'; " +
    "form-action 'self';",

  // Security Headers
  xContentTypeOptions: "nosniff",
  xFrameOptions: "DENY",
  referrerPolicy: "strict-origin-when-cross-origin",
  permissionsPolicy: "geolocation=(), microphone=(), camera=()",

  // Request limits
  maxBodySize: 10 * 1024 * 1024, // 10MB
  maxParamCount: 100,
  maxHeaderCount: 50,

  // Cookie settings (for when you implement auth cookies)
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Password policies (if implementing auth)
  password: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAgeDays: 90,
  },

  // CORS settings
  cors: {
    origin: process.env.NODE_ENV === "production" ? "https://yourdomain.com" : "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    maxAge: 86400, // 24 hours
  },

  // Monitoring and logging
  logging: {
    level: process.env.NODE_ENV === "production" ? "warn" : "debug",
    // In production, avoid logging sensitive data
    sanitize: true,
  },
};

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * Validate that the required environment variables are set and have correct formats.
 * @returns An object containing the validation status, errors, and warnings.
 */
export function validateEnvironment(): {
  success: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Voeg hier eventuele kritieke omgevingsvariabelen toe die absoluut vereist zijn
  const requiredEnvs: string[] = []; 

  requiredEnvs.forEach((envVar) => {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  });

  // Optioneel: Waarschuwing als we in productie draaien zonder gedefinieerde NODE_ENV
  if (!process.env.NODE_ENV) {
    warnings.push("NODE_ENV is not set. Defaulting to development mode.");
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
  };
}
