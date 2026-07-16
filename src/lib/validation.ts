// Input validation and sanitization utilities
// These functions help prevent common web vulnerabilities like XSS, SQL injection, etc.

/**
 * Sanitize string input to prevent XSS attacks
 * @param input The string to sanitize
 * @returns Sanitized string safe for HTML context
 */
export function sanitizeHtml(input: string): string {
  if (!input) return "";

  // Create a div element to use its textContent property for escaping
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Sanitize string input for use in attributes
 * @param input The string to sanitize
 * @returns Sanitized string safe for HTML attributes
 */
export function sanitizeAttribute(input: string): string {
  if (!input) return "";

  // Escape quotes and other dangerous characters for attributes
  return input
    .replace(/"/g, """)
    .replace(/'/g, "'")
    .replace(/`/g, "&#x60;");
}

/**
 * Validate email format
 * @param input The email to validate
 * @returns True if valid email format
 */
export function validateEmail(input: string): boolean {
  if (!input) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input.trim());
}

/**
 * Validate that input contains only alphanumeric characters and allowed special chars
 * @param input The string to validate
 * @param allowedChars Additional characters to allow (regex escaped)
 * @returns True if valid
 */
export function validateAlphanumeric(input: string, allowedChars: string = ""): boolean {
  if (!input) return false;

  const escapedChars = allowedChars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^[a-zA-Z0-9${escapedChars}]+$`);
  return pattern.test(input);
}

/**
 * Sanitize input for safe use in SQL-like contexts (basic protection)
 * NOTE: Prefer parameterized queries/prepared statements for database queries
 * @param input The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeSql(input: string): string {
  if (!input) return "";

  // Basic SQL injection prevention - NOT a replacement for parameterized queries
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/--/g, "")   // Remove SQL comments
    .replace(/;/g, "");   // Remove statement terminators
}

/**
 * Validate URL format
 * @param input The URL to validate
 * @param protocols Allowed protocols (default: http, https)
 * @returns True if valid URL format
 */
export function validateUrl(input: string, protocols: string[] = ["http", "https"]): boolean {
  if (!input) return false;

  try {
    const url = new URL(input);
    return protocols.includes(url.protocol.replace(":", ""));
  } catch {
    return false;
  }
}

/**
 * Sanitize filename to prevent path traversal attacks
 * @param input The filename to sanitize
 * @returns Sanitized filename safe for filesystem usage
 */
export function sanitizeFilename(input: string): string {
  if (!input) return "";

  // Remove path traversal sequences
  let sanitized = input
    .replace(/\.\./g, "")      // Remove directory traversal
    .replace(/\\/g, "")        // Remove backslashes
    .replace(/\//g, "")        // Remove forward slashes
    .replace(/:/g, "")         // Remove colons
    .replace(/\*/g, "")        // Remove asterisks
    .replace(/\?/g, "")        // Remove question marks
    .replace(/"/g, "")         // Remove quotes
    .replace(/</g, "")         // Remove less than
    .replace(/>/g, "")         // Remove greater than
    .replace(/\|/g, "");       // Remove pipe

  // Limit length and remove control characters
  sanitized = sanitized
    .replace(/[\x00-\x1f\x80-\x9f]/g, "") // Remove control characters
    .substring(0, 255); // Limit to reasonable length

  return sanitized || "unnamed";
}

/**
 * Validate that input strength meets requirements
 * @param input The input to validate (typically password)
 * @param options Validation options
 * @returns Object with validation result and any errors
 */
export function validateStrength(
  input: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  } = {}
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input) {
    errors.push("Input is required");
    return { valid: false, errors };
  }

  const {
    minLength = 8,
    requireUppercase = false,
    requireLowercase = false,
    requireNumbers = false,
    requireSpecialChars = false
  } = options;

  if (input.length < minLength) {
    errors.push(`Input must be at least ${minLength} characters long`);
  }

  if (requireUppercase && !/[A-Z]/.test(input)) {
    errors.push("Input must contain at least one uppercase letter");
  }

  if (requireLowercase && !/[a-z]/.test(input)) {
    errors.push("Input must contain at least one lowercase letter");
  }

  if (requireNumbers && !/[0-9]/.test(input)) {
    errors.push("Input must contain at least one number");
  }

  if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(input)) {
    errors.push("Input must contain at least one special character");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Export all functions for easy importing
export {
  sanitizeHtml,
  sanitizeAttribute,
  validateEmail,
  validateAlphanumeric,
  sanitizeSql,
  validateUrl,
  sanitizeFilename,
  validateStrength,
};