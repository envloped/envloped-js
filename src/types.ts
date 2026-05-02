/**
 * TypeScript types and interfaces for Envlobed SDK
 */

/**
 * Request configuration options
 */
export interface RequestConfig {
  /** AbortSignal for request cancellation */
  signal?: AbortSignal;
  /** Request timeout in milliseconds (overrides client default) */
  timeout?: number;
}

/**
 * Email recipient with optional name
 */
export interface EmailAddress {
  /** Email address */
  email: string;
  /** Optional recipient name */
  name?: string;
}

/**
 * File attachment for outbound email (base64 body matches POST /v1/emails)
 */
export interface Attachment {
  /** File name shown to the recipient (e.g. invoice.pdf) */
  filename: string;
  /** Base64-encoded file bytes */
  content: string;
  /** MIME type (e.g. application/pdf, text/calendar) */
  contentType?: string;
}

/**
 * Send email request parameters
 */
export interface SendEmailRequest {
  /** Sender email address (must be verified or from your domain) */
  from: string;
  /** Recipient email addresses */
  to: string[] | EmailAddress[];
  /** Email subject */
  subject: string;
  /** HTML content of the email */
  html?: string;
  /** Plain text content of the email */
  text?: string;
  /** Optional attachments (max 10, combined decoded size ≤ 40 MB; API enforces the same) */
  attachments?: Attachment[];
  /** Optional CC recipients */
  cc?: string[] | EmailAddress[];
  /** Optional BCC recipients */
  bcc?: string[] | EmailAddress[];
  /** Optional reply-to address */
  replyTo?: string;
  /** Optional headers */
  headers?: Record<string, string>;
}

/**
 * Send email response
 */
export interface SendEmailResponse {
  /** Indicates if the email was accepted for sending */
  success: boolean;
  /** Unique message ID for tracking */
  messageId: string;
}

/**
 * Ping response for health checks
 */
export interface PingResponse {
  /** Response message */
  message: string;
  /** Company ID */
  companyId: string;
}

/**
 * Email usage statistics
 */
export interface EmailUsage {
  /** Daily email count */
  dailyCount: number;
  /** Monthly email count */
  monthlyCount: number;
  /** Daily email limit */
  dailyLimit: number;
  /** Monthly email limit */
  monthlyLimit: number;
}

/**
 * Rate limit error details
 */
export interface RateLimitDetails {
  /** Current usage statistics */
  usage: EmailUsage;
  /** When the rate limit resets (ISO 8601 timestamp) */
  resetsAt?: string;
}

/**
 * Client configuration options
 */
export interface ClientConfig {
  /** Your Envloped API key */
  apiKey: string;
  /** Base URL for API requests (default: https://api.envloped.com) */
  baseURL?: string;
  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number;
  /** Custom fetch implementation (for testing or non-standard environments) */
  fetch?: typeof fetch;
  /** Custom user agent string */
  userAgent?: string;
}

/**
 * Email address validation result
 */
export interface EmailValidationResult {
  /** Whether the email is valid */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
}
