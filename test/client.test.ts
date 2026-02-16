/**
 * Tests for client functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnvlopedClient } from '../src/client';
import {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  RateLimitError,
  APIError,
  EnvlopedNetworkError,
} from '../src/errors';
import {
  createMockResponse,
  createSuccessResponse,
  createErrorResponse,
  createMockFetch,
  createThrowingFetch,
  TEST_API_KEY,
  TEST_BASE_URL,
  TEST_PING_RESPONSE,
} from './helpers';

describe('EnvlopedClient', () => {
  describe('Constructor', () => {
    it('should create client with required config', () => {
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });
      expect(client.apiKey).toBe(TEST_API_KEY);
      expect(client.baseURL).toBe('https://api.envloped.com');
      expect(client.timeout).toBe(10000);
    });

    it('should create client with custom config', () => {
      const client = new EnvlopedClient({
        apiKey: TEST_API_KEY,
        baseURL: TEST_BASE_URL,
        timeout: 5000,
      });
      expect(client.baseURL).toBe(TEST_BASE_URL);
      expect(client.timeout).toBe(5000);
    });

    it('should throw ValidationError without API key', () => {
      expect(() => new EnvlopedClient({ apiKey: '' as string })).toThrow(ValidationError);
      expect(() => new EnvlopedClient({ apiKey: undefined as unknown as string })).toThrow(
        ValidationError
      );
    });

    it('should initialize emails service', () => {
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });
      expect(client.emails).toBeDefined();
    });
  });

  describe('Builder Methods', () => {
    it('should set custom base URL', () => {
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });
      const result = client.withBaseURL(TEST_BASE_URL);
      expect(client.baseURL).toBe(TEST_BASE_URL);
      expect(result).toBe(client);
    });

    it('should set custom timeout', () => {
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });
      const result = client.withTimeout(5000);
      expect(client.timeout).toBe(5000);
      expect(result).toBe(client);
    });

    it('should set custom fetch', () => {
      const customFetch = vi.fn();
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });
      const result = client.withFetch(customFetch);
      expect(client.fetchImpl).toBe(customFetch);
      expect(result).toBe(client);
    });

    it('should set custom user agent', () => {
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });
      const result = client.withUserAgent('CustomAgent/1.0');
      expect(client.userAgent).toBe('CustomAgent/1.0');
      expect(result).toBe(client);
    });
  });

  describe('ping', () => {
    it('should ping successfully', async () => {
      const mockFetch = createMockFetch(createSuccessResponse(TEST_PING_RESPONSE));
      const client = new EnvlopedClient({
        apiKey: TEST_API_KEY,
        fetch: mockFetch,
      });

      const response = await client.ping();

      expect(response).toEqual(TEST_PING_RESPONSE);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/ping'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: `Bearer ${TEST_API_KEY}`,
          }),
        })
      );
    });
  });

  describe('request', () => {
    it('should make successful GET request', async () => {
      const mockData = { message: 'test' };
      const mockFetch = createMockFetch(createSuccessResponse(mockData));
      const client = new EnvlopedClient({
        apiKey: TEST_API_KEY,
        fetch: mockFetch,
      });

      const response = await client.request('/v1/test', { method: 'GET' });

      expect(response).toEqual(mockData);
    });

    it('should make successful POST request', async () => {
      const mockData = { success: true };
      const mockFetch = createMockFetch(createSuccessResponse(mockData));
      const client = new EnvlopedClient({
        apiKey: TEST_API_KEY,
        fetch: mockFetch,
      });

      const response = await client.request('/v1/test', {
        method: 'POST',
        body: { test: 'data' },
      });

      expect(response).toEqual(mockData);
    });

    it('should handle 400 error', async () => {
      const mockFetch = createMockFetch(createErrorResponse(400, 'Invalid input'));
      const client = new EnvlopedClient({
        apiKey: TEST_API_KEY,
        fetch: mockFetch,
      });

      await expect(client.request('/v1/test', { method: 'POST' })).rejects.toThrow(
        ValidationError
      );
    });

    it('should handle 401 error', async () => {
      const mockFetch = createMockFetch(createErrorResponse(401, 'Unauthorized'));
      const client = new EnvlopedClient({
        apiKey: TEST_API_KEY,
        fetch: mockFetch,
      });

      await expect(client.request('/v1/test', { method: 'POST' })).rejects.toThrow(
        UnauthorizedError
      );
    });

    it('should handle 403 error', async () => {
      const mockFetch = createMockFetch(createErrorResponse(403, 'Forbidden'));
      const client = new EnvlopedClient({
        apiKey: TEST_API_KEY,
        fetch: mockFetch,
      });

      await expect(client.request('/v1/test', { method: 'POST' })).rejects.toThrow(
        ForbiddenError
      );
    });

    it('should handle 429 error', async () => {
      const rateLimitData = {
        message: 'Rate limit exceeded',
        usage: {
          dailyCount: 100,
          monthlyCount: 1000,
          dailyLimit: 200,
          monthlyLimit: 5000,
        },
      };
      const mockFetch = createMockFetch(
        createMockResponse({ status: 429, body: rateLimitData })
      );
      const client = new EnvlopedClient({
        apiKey: TEST_API_KEY,
        fetch: mockFetch,
      });

      await expect(client.request('/v1/test', { method: 'POST' })).rejects.toThrow(
        RateLimitError
      );
    });

    it('should handle 500 error', async () => {
      const mockFetch = createMockFetch(createErrorResponse(500, 'Internal server error'));
      const client = new EnvlopedClient({
        apiKey: TEST_API_KEY,
        fetch: mockFetch,
      });

      await expect(client.request('/v1/test', { method: 'POST' })).rejects.toThrow(APIError);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      const mockFetch = createThrowingFetch(networkError);
      const client = new EnvlopedClient({
        apiKey: TEST_API_KEY,
        fetch: mockFetch,
      });

      await expect(client.request('/v1/test', { method: 'POST' })).rejects.toThrow(
        EnvlopedNetworkError
      );
    });

    it('should handle timeout', async () => {
      const client = new EnvlopedClient({
        apiKey: TEST_API_KEY,
        timeout: 100,
      });

      // Create a fetch that never resolves
      const slowFetch = vi.fn(
        () =>
          new Promise(() => {
            // Never resolve
          }) as unknown as Response
      );

      await expect(
        client.request('/v1/test', { method: 'POST' })
      ).rejects.toThrow(EnvlopedNetworkError);
    });
  });
});
