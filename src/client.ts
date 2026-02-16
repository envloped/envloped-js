/**
 * Main client for Envloped API
 */

import type { ClientConfig, PingResponse, RequestConfig } from "./types";
import {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  RateLimitError,
  APIError,
  EnvlopedNetworkError,
} from "./errors";
import { getVersion } from "./version";
import { EmailsService } from "./emails";

/**
 * Default base URL for Envloped API
 */
const DEFAULT_BASE_URL = "https://api.envloped.com";

/**
 * Default timeout in milliseconds
 */
const DEFAULT_TIMEOUT = 10000;

/**
 * Main client for interacting with Envloped API
 */
export class EnvlopedClient {
  private _apiKey: string;
  private _baseURL: string;
  private _timeout: number;
  private _fetch: typeof fetch;
  private _userAgent: string;

  /** Email service */
  readonly emails: EmailsService;

  /**
   * Create a new Envloped client
   */
  constructor(config: ClientConfig) {
    if (!config.apiKey) {
      throw new ValidationError("API key is required");
    }

    this._apiKey = config.apiKey;
    this._baseURL = config.baseURL || DEFAULT_BASE_URL;
    this._timeout = config.timeout || DEFAULT_TIMEOUT;
    this._fetch = config.fetch || globalThis.fetch;
    this._userAgent = config.userAgent || `envloped-js/${getVersion()}`;

    this.emails = new EmailsService(this);
  }

  /**
   * Get the API key
   */
  get apiKey(): string {
    return this._apiKey;
  }

  /**
   * Get the base URL
   */
  get baseURL(): string {
    return this._baseURL;
  }

  /**
   * Get the timeout
   */
  get timeout(): number {
    return this._timeout;
  }

  /**
   * Get the fetch implementation
   */
  get fetchImpl(): typeof fetch {
    return this._fetch;
  }

  /**
   * Get the user agent string
   */
  get userAgent(): string {
    return this._userAgent;
  }

  /**
   * Set a custom base URL
   */
  withBaseURL(baseURL: string): this {
    this._baseURL = baseURL;
    return this;
  }

  /**
   * Set a custom timeout
   */
  withTimeout(timeout: number): this {
    this._timeout = timeout;
    return this;
  }

  /**
   * Set a custom fetch implementation
   */
  withFetch(fetchImpl: typeof fetch): this {
    this._fetch = fetchImpl;
    return this;
  }

  /**
   * Set a custom user agent
   */
  withUserAgent(userAgent: string): this {
    this._userAgent = userAgent;
    return this;
  }

  /**
   * Ping the API to check connectivity
   */
  async ping(config?: RequestConfig): Promise<PingResponse> {
    return this.request<PingResponse>("/v1/ping", {
      method: "GET",
      config,
    });
  }

  /**
   * Make an API request
   */
  async request<T>(
    path: string,
    options: {
      method: string;
      body?: unknown;
      config?: RequestConfig;
    },
  ): Promise<T> {
    const { method, body, config } = options;
    const timeout = config?.timeout || this._timeout;

    const url = new URL(path, this._baseURL);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this._apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": this._userAgent,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // If caller provides a signal, tie it to the controller
    if (config?.signal) {
      config.signal.addEventListener("abort", () => controller.abort());
    }

    try {
      const response = await this._fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      // Re-throw our custom errors directly
      if (
        error instanceof ValidationError ||
        error instanceof UnauthorizedError ||
        error instanceof ForbiddenError ||
        error instanceof RateLimitError ||
        error instanceof APIError
      ) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new EnvlopedNetworkError(
            `Request timeout after ${timeout}ms`,
            error,
          );
        }
        throw new EnvlopedNetworkError(
          `Network error: ${error.message}`,
          error,
        );
      }

      throw new EnvlopedNetworkError("Unknown network error");
    }
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    let body: string | undefined;
    if (isJson) {
      body = await response.text();
    }

    if (!response.ok) {
      return this.handleError(response, body);
    }

    if (isJson && body) {
      return JSON.parse(body) as T;
    }

    return undefined as T;
  }

  /**
   * Handle error response
   */
  private handleError(response: Response, body?: string): never {
    const status = response.status;
    let message = `HTTP ${status}`;
    let data: unknown;

    if (body) {
      try {
        data = JSON.parse(body);
        message = (data as { message?: string })?.message || message;
      } catch {
        message = body || message;
      }
    }

    switch (status) {
      case 400:
        throw new ValidationError(message);
      case 401:
        throw new UnauthorizedError(message);
      case 403:
        throw new ForbiddenError(message);
      case 429: {
        const rateLimitData = data as {
          usage?: {
            dailyCount: number;
            monthlyCount: number;
            dailyLimit: number;
            monthlyLimit: number;
          };
          resetsAt?: string;
        };
        if (rateLimitData?.usage) {
          throw new RateLimitError(message, {
            usage: rateLimitData.usage,
            resetsAt: rateLimitData.resetsAt,
          });
        }
        throw new RateLimitError(message);
      }
      default:
        throw new APIError(message, status, body);
    }
  }
}
