/**
 * Environment validation utility
 * Runs on startup to ensure required environment variables are present and valid
 */

import { validateEnvironment } from "./security";

// Run validation when this module is imported
console.log("🔍 Validating environment variables...");
const { success, errors, warnings } = validateEnvironment();

if (warnings.length > 0) {
  console.warn("⚠️  Environment warnings:");
  warnings.forEach((warning) => console.warn(`  - ${warning}`));
}

if (!success) {
  console.error("❌ Environment validation failed:");
  errors.forEach((error) => console.error(`  - ${error}`));
  console.error("\n🛑 Application cannot start due to missing or invalid environment variables.");
  // In a production environment, you might want to exit the process here
  // process.exit(1);
} else {
  console.log("✅ All environment variables are valid.");
}

// Export the validation result for potential use elsewhere
export { success, errors, warnings };