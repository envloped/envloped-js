/**
 * TypeScript types and interfaces for Envlobed SDK
 */
/**
 * Request configuration options
 */
interface RequestConfig {
    /** AbortSignal for request cancellation */
    signal?: AbortSignal;
    /** Request timeout in milliseconds (overrides client default) */
    timeout?: number;
}
/**
 * Email recipient with optional name
 */
interface EmailAddress {
    /** Email address */
    email: string;
    /** Optional recipient name */
    name?: string;
}
/**
 * Send email request parameters
 */
interface SendEmailRequest {
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
interface SendEmailResponse {
    /** Indicates if the email was accepted for sending */
    success: boolean;
    /** Unique message ID for tracking */
    messageId: string;
}
/**
 * Ping response for health checks
 */
interface PingResponse {
    /** Response message */
    message: string;
    /** Company ID */
    companyId: string;
}
/**
 * Email usage statistics
 */
interface EmailUsage {
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
interface RateLimitDetails {
    /** Current usage statistics */
    usage: EmailUsage;
    /** When the rate limit resets (ISO 8601 timestamp) */
    resetsAt?: string;
}
/**
 * Client configuration options
 */
interface ClientConfig {
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
interface EmailValidationResult {
    /** Whether the email is valid */
    valid: boolean;
    /** Error message if invalid */
    error?: string;
}

/**
 * Email service implementation
 */

/**
 * Interface for email service
 */
interface IEmailsService {
    send(params: SendEmailRequest, config?: {
        signal?: AbortSignal;
        timeout?: number;
    }): Promise<SendEmailResponse>;
}
/**
 * Email service for sending emails
 */
declare class EmailsService implements IEmailsService {
    private client;
    constructor(client: EnvlopedClient);
    /**
     * Send an email
     */
    send(params: SendEmailRequest, config?: {
        signal?: AbortSignal;
        timeout?: number;
    }): Promise<SendEmailResponse>;
    /**
     * Validate email parameters
     */
    private validateParams;
    /**
     * Validate email address format
     */
    private isValidEmail;
    /**
     * Validate an email address (utility method)
     */
    validateEmailAddress(email: string): EmailValidationResult;
    /**
     * Normalize email address to EmailAddress object
     */
    normalizeEmailAddress(address: string | EmailAddress): EmailAddress;
}

/**
 * Main client for Envloped API
 */

/**
 * Main client for interacting with Envloped API
 */
declare class EnvlopedClient {
    private _apiKey;
    private _baseURL;
    private _timeout;
    private _fetch;
    private _userAgent;
    /** Email service */
    readonly emails: EmailsService;
    /**
     * Create a new Envloped client
     */
    constructor(config: ClientConfig);
    /**
     * Get the API key
     */
    get apiKey(): string;
    /**
     * Get the base URL
     */
    get baseURL(): string;
    /**
     * Get the timeout
     */
    get timeout(): number;
    /**
     * Get the fetch implementation
     */
    get fetchImpl(): typeof fetch;
    /**
     * Get the user agent string
     */
    get userAgent(): string;
    /**
     * Set a custom base URL
     */
    withBaseURL(baseURL: string): this;
    /**
     * Set a custom timeout
     */
    withTimeout(timeout: number): this;
    /**
     * Set a custom fetch implementation
     */
    withFetch(fetchImpl: typeof fetch): this;
    /**
     * Set a custom user agent
     */
    withUserAgent(userAgent: string): this;
    /**
     * Ping the API to check connectivity
     */
    ping(config?: RequestConfig): Promise<PingResponse>;
    /**
     * Make an API request
     */
    request<T>(path: string, options: {
        method: string;
        body?: unknown;
        config?: RequestConfig;
    }): Promise<T>;
    /**
     * Handle API response
     */
    private handleResponse;
    /**
     * Handle error response
     */
    private handleError;
}

/**
 * Custom error classes for Envloped SDK
 */

/**
 * Base error class for all Envloped errors
 */
declare class EnvlopedError extends Error {
    constructor(message: string);
}
/**
 * Validation error (400)
 * Thrown when request parameters are invalid
 */
declare class ValidationError extends EnvlopedError {
    constructor(message: string);
}
/**
 * Unauthorized error (401)
 * Thrown when API key is missing or invalid
 */
declare class UnauthorizedError extends EnvlopedError {
    constructor(message?: string);
}
/**
 * Forbidden error (403)
 * Thrown when access is not permitted
 */
declare class ForbiddenError extends EnvlopedError {
    constructor(message?: string);
}
/**
 * Rate limit error (429)
 * Thrown when rate limit is exceeded
 */
declare class RateLimitError extends EnvlopedError {
    /** Rate limit usage details */
    readonly usage: RateLimitDetails['usage'];
    /** When the rate limit resets */
    readonly resetsAt?: string;
    constructor(message: string, details?: RateLimitDetails);
}
/**
 * Generic API error
 * Thrown for other HTTP errors (500, 502, 503, etc.)
 */
declare class APIError extends EnvlopedError {
    /** HTTP status code */
    readonly statusCode: number;
    /** Response body if available */
    readonly body?: string;
    constructor(message: string, statusCode: number, body?: string);
}
/**
 * Network error
 * Thrown when fetch request fails (network issues, timeout, etc.)
 */
declare class EnvlopedNetworkError extends EnvlopedError {
    /** Original error if available */
    readonly cause?: Error;
    constructor(message: string, cause?: Error);
}
/**
 * Type guard for ValidationError
 */
declare function isValidationError(error: unknown): error is ValidationError;
/**
 * Type guard for UnauthorizedError
 */
declare function isUnauthorizedError(error: unknown): error is UnauthorizedError;
/**
 * Type guard for ForbiddenError
 */
declare function isForbiddenError(error: unknown): error is ForbiddenError;
/**
 * Type guard for RateLimitError
 */
declare function isRateLimitError(error: unknown): error is RateLimitError;
/**
 * Type guard for APIError
 */
declare function isAPIError(error: unknown): error is APIError;
/**
 * Type guard for NetworkError
 */
declare function isNetworkError(error: unknown): error is EnvlopedNetworkError;
/**
 * Type guard for any Envloped error
 */
declare function isEnvlopedError(error: unknown): error is EnvlopedError;

/**
 * SDK version
 */
declare const VERSION = "1.0.1";
/**
 * Get the current SDK version
 */
declare function getVersion(): string;

export { APIError, type ClientConfig, type EmailAddress, type EmailUsage, type EmailValidationResult, EmailsService, EnvlopedClient, EnvlopedError, EnvlopedNetworkError, ForbiddenError, type IEmailsService, type PingResponse, type RateLimitDetails, RateLimitError, type RequestConfig, type SendEmailRequest, type SendEmailResponse, UnauthorizedError, VERSION, ValidationError, getVersion, isAPIError, isEnvlopedError, isForbiddenError, isNetworkError, isRateLimitError, isUnauthorizedError, isValidationError };
