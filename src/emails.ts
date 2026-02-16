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
