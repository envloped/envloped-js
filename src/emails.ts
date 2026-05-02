/**
 * Email service implementation
 */

import type {
  SendEmailRequest,
  SendEmailResponse,
  EmailAddress,
  EmailValidationResult,
} from "./types";
import { ValidationError } from "./errors";
import type { EnvlopedClient } from "./client";

/** Mirrors POST /api/v1/emails attachment limits */
const MAX_ATTACHMENTS = 10;
const MAX_ATTACHMENTS_TOTAL_BYTES = 40 * 1024 * 1024;

function attachmentDecodedByteLength(content: string): number {
  const normalized = content.replace(/\s/g, "");
  if (normalized.length === 0) {
    throw new ValidationError("Invalid base64 attachment content");
  }
  if (normalized.length % 4 !== 0) {
    throw new ValidationError("Invalid base64 attachment content");
  }
  if (/[^A-Za-z0-9+/=]/.test(normalized)) {
    throw new ValidationError("Invalid base64 attachment content");
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.byteLength(normalized, "base64");
  }
  if (typeof atob !== "function") {
    throw new ValidationError(
      "Cannot validate attachment size in this environment",
    );
  }
  try {
    return atob(normalized).length;
  } catch {
    throw new ValidationError("Invalid base64 attachment content");
  }
}

/**
 * Interface for email service
 */
export interface IEmailsService {
  send(
    params: SendEmailRequest,
    config?: { signal?: AbortSignal; timeout?: number },
  ): Promise<SendEmailResponse>;
}

/**
 * Email service for sending emails
 */
export class EmailsService implements IEmailsService {
  constructor(private client: EnvlopedClient) {}

  /**
   * Send an email
   */
  async send(
    params: SendEmailRequest,
    config?: { signal?: AbortSignal; timeout?: number },
  ): Promise<SendEmailResponse> {
    // Validate before making API call
    this.validateParams(params);

    return this.client.request<SendEmailResponse>("/v1/emails", {
      method: "POST",
      body: params,
      config,
    });
  }

  /**
   * Validate email parameters
   */
  private validateParams(params: SendEmailRequest): void {
    if (!params.from) {
      throw new ValidationError("From address is required");
    }

    if (!this.isValidEmail(params.from)) {
      throw new ValidationError("Invalid from address");
    }

    if (!params.to || params.to.length === 0) {
      throw new ValidationError("At least one recipient is required");
    }

    const to = params.to;
    for (let i = 0; i < to.length; i++) {
      const recipient = to[i];
      const email = typeof recipient === "string" ? recipient : recipient.email;
      if (!this.isValidEmail(email)) {
        throw new ValidationError(`Invalid recipient address at index ${i}`);
      }
    }

    if (params.cc) {
      for (let i = 0; i < params.cc.length; i++) {
        const recipient = params.cc[i];
        const email =
          typeof recipient === "string" ? recipient : recipient.email;
        if (!this.isValidEmail(email)) {
          throw new ValidationError(`Invalid CC address at index ${i}`);
        }
      }
    }

    if (params.bcc) {
      for (let i = 0; i < params.bcc.length; i++) {
        const recipient = params.bcc[i];
        const email =
          typeof recipient === "string" ? recipient : recipient.email;
        if (!this.isValidEmail(email)) {
          throw new ValidationError(`Invalid BCC address at index ${i}`);
        }
      }
    }

    if (!params.subject || params.subject.trim() === "") {
      throw new ValidationError("Subject is required");
    }

    if (!params.html && !params.text) {
      throw new ValidationError("Either HTML or text content is required");
    }

    if (params.replyTo && !this.isValidEmail(params.replyTo)) {
      throw new ValidationError("Invalid reply-to address");
    }

    this.validateAttachments(params.attachments);
  }

  /**
   * Validate attachment array shape and size limits (matches API)
   */
  private validateAttachments(
    attachments: SendEmailRequest["attachments"],
  ): void {
    if (attachments === undefined || attachments === null) {
      return;
    }

    if (!Array.isArray(attachments)) {
      throw new ValidationError("attachments must be an array");
    }

    if (attachments.length > MAX_ATTACHMENTS) {
      throw new ValidationError(
        `Maximum ${MAX_ATTACHMENTS} attachments allowed`,
      );
    }

    let totalDecoded = 0;

    for (let i = 0; i < attachments.length; i++) {
      const att = attachments[i];
      if (!att || typeof att !== "object") {
        throw new ValidationError(`Invalid attachment at index ${i}`);
      }

      if (!att.filename || typeof att.filename !== "string") {
        throw new ValidationError(
          `Each attachment must have a filename (index ${i})`,
        );
      }

      if (att.filename.trim() === "") {
        throw new ValidationError(`Attachment filename cannot be empty (index ${i})`);
      }

      if (!att.content || typeof att.content !== "string") {
        throw new ValidationError(
          `Each attachment must have base64-encoded content (index ${i})`,
        );
      }

      const decodedLen = attachmentDecodedByteLength(att.content);
      totalDecoded += decodedLen;

      if (totalDecoded > MAX_ATTACHMENTS_TOTAL_BYTES) {
        throw new ValidationError(
          "Total attachment size must not exceed 40MB (decoded)",
        );
      }

      if (
        att.contentType !== undefined &&
        typeof att.contentType !== "string"
      ) {
        throw new ValidationError(
          `attachment contentType must be a string when set (index ${i})`,
        );
      }
    }
  }

  /**
   * Validate email address format
   */
  private isValidEmail(email: string): boolean {
    if (!email || typeof email !== "string") {
      return false;
    }

    // Basic email validation regex
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    return emailRegex.test(email);
  }

  /**
   * Validate an email address (utility method)
   */
  validateEmailAddress(email: string): EmailValidationResult {
    if (!email) {
      return { valid: false, error: "Email address is required" };
    }

    if (!this.isValidEmail(email)) {
      return { valid: false, error: "Invalid email address format" };
    }

    return { valid: true };
  }

  /**
   * Normalize email address to EmailAddress object
   */
  normalizeEmailAddress(address: string | EmailAddress): EmailAddress {
    if (typeof address === "string") {
      return { email: address };
    }
    return address;
  }
}
