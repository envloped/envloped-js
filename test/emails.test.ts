/**
 * Tests for email service
 */

import { describe, it, expect, vi } from 'vitest';
import { EnvlopedClient } from '../src/client';
import { ValidationError } from '../src/errors';
import {
  createMockFetch,
  createSuccessResponse,
  createErrorResponse,
  TEST_API_KEY,
  TEST_EMAIL_PARAMS,
  TEST_SEND_RESPONSE,
} from './helpers';

describe('EmailsService', () => {
  describe('send', () => {
    it('should send email successfully', async () => {
      const mockFetch = createMockFetch(createSuccessResponse(TEST_SEND_RESPONSE));
      const client = new EnvlopedClient({
        apiKey: TEST_API_KEY,
        fetch: mockFetch,
      });

      const response = await client.emails.send(TEST_EMAIL_PARAMS);

      expect(response).toEqual(TEST_SEND_RESPONSE);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should validate missing from address', async () => {
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });

      await expect(
        client.emails.send({ ...TEST_EMAIL_PARAMS, from: '' as string })
      ).rejects.toThrow(ValidationError);
    });

    it('should validate invalid from address', async () => {
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });

      await expect(
        client.emails.send({ ...TEST_EMAIL_PARAMS, from: 'invalid-email' })
      ).rejects.toThrow(ValidationError);
    });

    it('should validate missing to recipients', async () => {
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });

      await expect(
        client.emails.send({ ...TEST_EMAIL_PARAMS, to: [] })
      ).rejects.toThrow(ValidationError);
    });

    it('should validate invalid to recipient', async () => {
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });

      await expect(
        client.emails.send({ ...TEST_EMAIL_PARAMS, to: ['invalid-email'] })
      ).rejects.toThrow(ValidationError);
    });

    it('should validate invalid CC recipient', async () => {
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });

      await expect(
        client.emails.send({
          ...TEST_EMAIL_PARAMS,
          cc: ['invalid-email'],
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should validate invalid BCC recipient', async () => {
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });

      await expect(
        client.emails.send({
          ...TEST_EMAIL_PARAMS,
          bcc: ['invalid-email'],
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should validate missing subject', async () => {
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });

      await expect(
        client.emails.send({
          ...TEST_EMAIL_PARAMS,
          subject: '',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should validate missing HTML and text content', async () => {
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });

      await expect(
        client.emails.send({
          from: 'test@example.com',
          to: ['recipient@example.com'],
          subject: 'Test',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should validate invalid reply-to address', async () => {
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });

      await expect(
        client.emails.send({
          ...TEST_EMAIL_PARAMS,
          replyTo: 'invalid-email',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should accept email addresses with names', async () => {
      const mockFetch = createMockFetch(createSuccessResponse(TEST_SEND_RESPONSE));
      const client = new EnvlopedClient({
        apiKey: TEST_API_KEY,
        fetch: mockFetch,
      });

      const response = await client.emails.send({
        from: 'test@example.com',
        to: [
          { email: 'recipient1@example.com', name: 'Recipient One' },
          { email: 'recipient2@example.com', name: 'Recipient Two' },
        ],
        subject: 'Test',
        html: '<p>Test</p>',
      });

      expect(response).toEqual(TEST_SEND_RESPONSE);
    });

    it('should accept text content instead of HTML', async () => {
      const mockFetch = createMockFetch(createSuccessResponse(TEST_SEND_RESPONSE));
      const client = new EnvlopedClient({
        apiKey: TEST_API_KEY,
        fetch: mockFetch,
      });

      const response = await client.emails.send({
        ...TEST_EMAIL_PARAMS,
        html: undefined,
        text: 'Plain text email',
      });

      expect(response).toEqual(TEST_SEND_RESPONSE);
    });

    it('should handle API error', async () => {
      const mockFetch = createMockFetch(createErrorResponse(400, 'Invalid email'));
      const client = new EnvlopedClient({
        apiKey: TEST_API_KEY,
        fetch: mockFetch,
      });

      await expect(client.emails.send(TEST_EMAIL_PARAMS)).rejects.toThrow(ValidationError);
    });

    it('should support request cancellation', async () => {
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });

      const controller = new AbortController();
      controller.abort();

      await expect(
        client.emails.send(TEST_EMAIL_PARAMS, { signal: controller.signal })
      ).rejects.toThrow();
    });
  });

  describe('validateEmailAddress', () => {
    it('should validate correct email', () => {
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });
      const result = client.emails.validateEmailAddress('test@example.com');

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty email', () => {
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });
      const result = client.emails.validateEmailAddress('');

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject invalid email format', () => {
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });
      const result = client.emails.validateEmailAddress('invalid-email');

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('normalizeEmailAddress', () => {
    it('should normalize string address', () => {
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });
      const result = client.emails.normalizeEmailAddress('test@example.com');

      expect(result).toEqual({ email: 'test@example.com' });
    });

    it('should return EmailAddress object as-is', () => {
      const client = new EnvlopedClient({ apiKey: TEST_API_KEY });
      const address = { email: 'test@example.com', name: 'Test User' };
      const result = client.emails.normalizeEmailAddress(address);

      expect(result).toEqual(address);
    });
  });
});
