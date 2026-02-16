/**
 * Envloped TypeScript/JavaScript SDK
 *
 * A TypeScript/JavaScript SDK for Envloped email platform
 */

// Export main client
export { EnvlopedClient } from "./client";

// Export services
export { EmailsService, type IEmailsService } from "./emails";

// Export all errors
export {
  EnvlopedError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  RateLimitError,
  APIError,
  EnvlopedNetworkError,
  // Type guards
  isValidationError,
  isUnauthorizedError,
  isForbiddenError,
  isRateLimitError,
  isAPIError,
  isNetworkError,
  isEnvlopedError,
} from "./errors";

// Export all types
export type {
  RequestConfig,
  EmailAddress,
  SendEmailRequest,
  SendEmailResponse,
  PingResponse,
  EmailUsage,
  RateLimitDetails,
  ClientConfig,
  EmailValidationResult,
} from "./types";

// Export version
export { getVersion, VERSION } from "./version";
