/**
 * Test helpers for mocking fetch and testing the SDK
 */

import type { FetchMock } from 'vitest';
import { vi } from 'vitest';

/**
 * Mock response builder
 */
export interface MockResponseOptions {
  status: number;
  body?: unknown;
  headers?: HeadersInit;
}

/**
 * Create a mock fetch response
 */
export function createMockResponse(options: MockResponseOptions): Response {
  const { status, body, headers } = options;

  const mockHeaders = new Headers(headers);
  mockHeaders.append('content-type', 'application/json');

  const response = {
    ok: status >= 200 && status < 300,
    status,
    headers: mockHeaders,
    async text() {
      return typeof body === 'string' ? body : JSON.stringify(body);
    },
    async json() {
      return body;
    },
  } as unknown as Response;

  return response;
}

/**
 * Create a successful response
 */
export function createSuccessResponse(body: unknown): Response {
  return createMockResponse({ status: 200, body });
}

/**
 * Create an error response
 */
export function createErrorResponse(status: number, message: string): Response {
  return createMockResponse({ status, body: { message } });
}

/**
 * Mock fetch implementation
 */
export function createMockFetch(response: Response) {
  return vi.fn(() => Promise.resolve(response));
}

/**
 * Mock fetch that throws an error
 */
export function createThrowingFetch(error: Error) {
  return vi.fn(() => Promise.reject(error));
}

/**
 * Test API key
 */
export const TEST_API_KEY = 'ev_test_api_key';

/**
 * Test base URL
 */
export const TEST_BASE_URL = 'https://api.test.com';

/**
 * Test email parameters
 */
export const TEST_EMAIL_PARAMS = {
  from: 'test@example.com',
  to: ['recipient@example.com'],
  subject: 'Test Email',
  html: '<h1>Hello World</h1>',
};

/**
 * Test send email response
 */
export const TEST_SEND_RESPONSE = {
  success: true,
  messageId: 'msg_123456789',
};

/**
 * Test ping response
 */
export const TEST_PING_RESPONSE = {
  message: 'pong',
  companyId: 'comp_123',
};
