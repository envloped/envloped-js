/**
 * Custom error classes for Envloped SDK
 */

import type { RateLimitDetails } from "./types";

/**
 * Base error class for all Envloped errors
 */
export class EnvlopedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvlopedError";
    Object.setPrototypeOf(this, EnvlopedError.prototype);
  }
}

/**
 * Validation error (400)
 * Thrown when request parameters are invalid
 */
export class ValidationError extends EnvlopedError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Unauthorized error (401)
 * Thrown when API key is missing or invalid
 */
export class UnauthorizedError extends EnvlopedError {
  constructor(message: string = "Unauthorized: Invalid or missing API key") {
    super(message);
    this.name = "UnauthorizedError";
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Forbidden error (403)
 * Thrown when access is not permitted
 */
export class ForbiddenError extends EnvlopedError {
  constructor(message: string = "Forbidden: Access denied") {
    super(message);
    this.name = "ForbiddenError";
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Rate limit error (429)
 * Thrown when rate limit is exceeded
 */
export class RateLimitError extends EnvlopedError {
  /** Rate limit usage details */
  readonly usage: RateLimitDetails["usage"];
  /** When the rate limit resets */
  readonly resetsAt?: string;

  constructor(message: string, details?: RateLimitDetails) {
    super(message);
    this.name = "RateLimitError";
    this.usage = details?.usage || {
      dailyCount: 0,
      monthlyCount: 0,
      dailyLimit: 0,
      monthlyLimit: 0,
    };
    this.resetsAt = details?.resetsAt;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Generic API error
 * Thrown for other HTTP errors (500, 502, 503, etc.)
 */
export class APIError extends EnvlopedError {
  /** HTTP status code */
  readonly statusCode: number;
  /** Response body if available */
  readonly body?: string;

  constructor(message: string, statusCode: number, body?: string) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.body = body;
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Network error
 * Thrown when fetch request fails (network issues, timeout, etc.)
 */
export class EnvlopedNetworkError extends EnvlopedError {
  /** Original error if available */
  readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = "EnvlopedNetworkError";
    this.cause = cause;
    Object.setPrototypeOf(this, EnvlopedNetworkError.prototype);
  }
}

/**
 * Type guard for ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Type guard for UnauthorizedError
 */
export function isUnauthorizedError(
  error: unknown,
): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}

/**
 * Type guard for ForbiddenError
 */
export function isForbiddenError(error: unknown): error is ForbiddenError {
  return error instanceof ForbiddenError;
}

/**
 * Type guard for RateLimitError
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}

/**
 * Type guard for APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Type guard for NetworkError
 */
export function isNetworkError(error: unknown): error is EnvlopedNetworkError {
  return error instanceof EnvlopedNetworkError;
}

/**
 * Type guard for any Envloped error
 */
export function isEnvlopedError(error: unknown): error is EnvlopedError {
  return error instanceof EnvlopedError;
}
