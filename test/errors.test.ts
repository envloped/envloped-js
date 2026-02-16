/**
 * Tests for error handling
 */

import { describe, it, expect } from 'vitest';
import {
  EnvlopedError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  RateLimitError,
  APIError,
  EnvlopedNetworkError,
  isValidationError,
  isUnauthorizedError,
  isForbiddenError,
  isRateLimitError,
  isAPIError,
  isNetworkError,
  isEnvlopedError,
} from '../src/errors';

describe('Error Classes', () => {
  describe('EnvlopedError', () => {
    it('should create base error', () => {
      const error = new EnvlopedError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(EnvlopedError);
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('EnvlopedError');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input');
      expect(error).toBeInstanceOf(EnvlopedError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create unauthorized error with default message', () => {
      const error = new UnauthorizedError();
      expect(error).toBeInstanceOf(EnvlopedError);
      expect(error).toBeInstanceOf(UnauthorizedError);
      expect(error.message).toContain('Unauthorized');
      expect(error.name).toBe('UnauthorizedError');
    });

    it('should create unauthorized error with custom message', () => {
      const error = new UnauthorizedError('Custom message');
      expect(error.message).toBe('Custom message');
    });
  });

  describe('ForbiddenError', () => {
    it('should create forbidden error with default message', () => {
      const error = new ForbiddenError();
      expect(error).toBeInstanceOf(EnvlopedError);
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.message).toContain('Forbidden');
      expect(error.name).toBe('ForbiddenError');
    });

    it('should create forbidden error with custom message', () => {
      const error = new ForbiddenError('Custom message');
      expect(error.message).toBe('Custom message');
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error without details', () => {
      const error = new RateLimitError('Rate limit exceeded');
      expect(error).toBeInstanceOf(EnvlopedError);
      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.name).toBe('RateLimitError');
      expect(error.usage).toEqual({
        dailyCount: 0,
        monthlyCount: 0,
        dailyLimit: 0,
        monthlyLimit: 0,
      });
      expect(error.resetsAt).toBeUndefined();
    });

    it('should create rate limit error with details', () => {
      const details = {
        usage: {
          dailyCount: 100,
          monthlyCount: 1000,
          dailyLimit: 200,
          monthlyLimit: 5000,
        },
        resetsAt: '2024-02-16T12:00:00Z',
      };
      const error = new RateLimitError('Rate limit exceeded', details);
      expect(error.usage).toEqual(details.usage);
      expect(error.resetsAt).toBe(details.resetsAt);
    });
  });

  describe('APIError', () => {
    it('should create API error', () => {
      const error = new APIError('Internal server error', 500, 'Server error details');
      expect(error).toBeInstanceOf(EnvlopedError);
      expect(error).toBeInstanceOf(APIError);
      expect(error.message).toBe('Internal server error');
      expect(error.statusCode).toBe(500);
      expect(error.body).toBe('Server error details');
      expect(error.name).toBe('APIError');
    });
  });

  describe('EnvlopedNetworkError', () => {
    it('should create network error without cause', () => {
      const error = new EnvlopedNetworkError('Network error');
      expect(error).toBeInstanceOf(EnvlopedError);
      expect(error).toBeInstanceOf(EnvlopedNetworkError);
      expect(error.message).toBe('Network error');
      expect(error.cause).toBeUndefined();
      expect(error.name).toBe('EnvlopedNetworkError');
    });

    it('should create network error with cause', () => {
      const cause = new Error('Underlying error');
      const error = new EnvlopedNetworkError('Network error', cause);
      expect(error.cause).toBe(cause);
    });
  });
});

describe('Type Guards', () => {
  it('should identify ValidationError', () => {
    const error = new ValidationError('Test');
    expect(isValidationError(error)).toBe(true);
    expect(isUnauthorizedError(error)).toBe(false);
    expect(isEnvlopedError(error)).toBe(true);
  });

  it('should identify UnauthorizedError', () => {
    const error = new UnauthorizedError();
    expect(isUnauthorizedError(error)).toBe(true);
    expect(isValidationError(error)).toBe(false);
    expect(isEnvlopedError(error)).toBe(true);
  });

  it('should identify ForbiddenError', () => {
    const error = new ForbiddenError();
    expect(isForbiddenError(error)).toBe(true);
    expect(isUnauthorizedError(error)).toBe(false);
    expect(isEnvlopedError(error)).toBe(true);
  });

  it('should identify RateLimitError', () => {
    const error = new RateLimitError('Test');
    expect(isRateLimitError(error)).toBe(true);
    expect(isForbiddenError(error)).toBe(false);
    expect(isEnvlopedError(error)).toBe(true);
  });

  it('should identify APIError', () => {
    const error = new APIError('Test', 500);
    expect(isAPIError(error)).toBe(true);
    expect(isRateLimitError(error)).toBe(false);
    expect(isEnvlopedError(error)).toBe(true);
  });

  it('should identify NetworkError', () => {
    const error = new EnvlopedNetworkError('Test');
    expect(isNetworkError(error)).toBe(true);
    expect(isAPIError(error)).toBe(false);
    expect(isEnvlopedError(error)).toBe(true);
  });

  it('should reject non-Envloped errors', () => {
    const error = new Error('Plain error');
    expect(isEnvlopedError(error)).toBe(false);
    expect(isValidationError(error)).toBe(false);
    expect(isAPIError(error)).toBe(false);
  });

  it('should reject null and undefined', () => {
    expect(isEnvlopedError(null)).toBe(false);
    expect(isEnvlopedError(undefined)).toBe(false);
    expect(isValidationError('string')).toBe(false);
    expect(isAPIError(123)).toBe(false);
  });
});
