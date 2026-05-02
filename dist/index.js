// src/errors.ts
var EnvlopedError = class _EnvlopedError extends Error {
  constructor(message) {
    super(message);
    this.name = "EnvlopedError";
    Object.setPrototypeOf(this, _EnvlopedError.prototype);
  }
};
var ValidationError = class _ValidationError extends EnvlopedError {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, _ValidationError.prototype);
  }
};
var UnauthorizedError = class _UnauthorizedError extends EnvlopedError {
  constructor(message = "Unauthorized: Invalid or missing API key") {
    super(message);
    this.name = "UnauthorizedError";
    Object.setPrototypeOf(this, _UnauthorizedError.prototype);
  }
};
var ForbiddenError = class _ForbiddenError extends EnvlopedError {
  constructor(message = "Forbidden: Access denied") {
    super(message);
    this.name = "ForbiddenError";
    Object.setPrototypeOf(this, _ForbiddenError.prototype);
  }
};
var RateLimitError = class _RateLimitError extends EnvlopedError {
  constructor(message, details) {
    super(message);
    this.name = "RateLimitError";
    this.usage = details?.usage || {
      dailyCount: 0,
      monthlyCount: 0,
      dailyLimit: 0,
      monthlyLimit: 0
    };
    this.resetsAt = details?.resetsAt;
    Object.setPrototypeOf(this, _RateLimitError.prototype);
  }
};
var APIError = class _APIError extends EnvlopedError {
  constructor(message, statusCode, body) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.body = body;
    Object.setPrototypeOf(this, _APIError.prototype);
  }
};
var EnvlopedNetworkError = class _EnvlopedNetworkError extends EnvlopedError {
  constructor(message, cause) {
    super(message);
    this.name = "EnvlopedNetworkError";
    this.cause = cause;
    Object.setPrototypeOf(this, _EnvlopedNetworkError.prototype);
  }
};
function isValidationError(error) {
  return error instanceof ValidationError;
}
function isUnauthorizedError(error) {
  return error instanceof UnauthorizedError;
}
function isForbiddenError(error) {
  return error instanceof ForbiddenError;
}
function isRateLimitError(error) {
  return error instanceof RateLimitError;
}
function isAPIError(error) {
  return error instanceof APIError;
}
function isNetworkError(error) {
  return error instanceof EnvlopedNetworkError;
}
function isEnvlopedError(error) {
  return error instanceof EnvlopedError;
}

// src/version.ts
var VERSION = "1.0.1";
function getVersion() {
  return VERSION;
}

// src/emails.ts
var EmailsService = class {
  constructor(client) {
    this.client = client;
  }
  /**
   * Send an email
   */
  async send(params, config) {
    this.validateParams(params);
    return this.client.request("/v1/emails", {
      method: "POST",
      body: params,
      config
    });
  }
  /**
   * Validate email parameters
   */
  validateParams(params) {
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
        const email = typeof recipient === "string" ? recipient : recipient.email;
        if (!this.isValidEmail(email)) {
          throw new ValidationError(`Invalid CC address at index ${i}`);
        }
      }
    }
    if (params.bcc) {
      for (let i = 0; i < params.bcc.length; i++) {
        const recipient = params.bcc[i];
        const email = typeof recipient === "string" ? recipient : recipient.email;
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
  isValidEmail(email) {
    if (!email || typeof email !== "string") {
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }
  /**
   * Validate an email address (utility method)
   */
  validateEmailAddress(email) {
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
  normalizeEmailAddress(address) {
    if (typeof address === "string") {
      return { email: address };
    }
    return address;
  }
};

// src/client.ts
var DEFAULT_BASE_URL = "https://api.envloped.com";
var DEFAULT_TIMEOUT = 1e4;
var EnvlopedClient = class {
  /**
   * Create a new Envloped client
   */
  constructor(config) {
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
  get apiKey() {
    return this._apiKey;
  }
  /**
   * Get the base URL
   */
  get baseURL() {
    return this._baseURL;
  }
  /**
   * Get the timeout
   */
  get timeout() {
    return this._timeout;
  }
  /**
   * Get the fetch implementation
   */
  get fetchImpl() {
    return this._fetch;
  }
  /**
   * Get the user agent string
   */
  get userAgent() {
    return this._userAgent;
  }
  /**
   * Set a custom base URL
   */
  withBaseURL(baseURL) {
    this._baseURL = baseURL;
    return this;
  }
  /**
   * Set a custom timeout
   */
  withTimeout(timeout) {
    this._timeout = timeout;
    return this;
  }
  /**
   * Set a custom fetch implementation
   */
  withFetch(fetchImpl) {
    this._fetch = fetchImpl;
    return this;
  }
  /**
   * Set a custom user agent
   */
  withUserAgent(userAgent) {
    this._userAgent = userAgent;
    return this;
  }
  /**
   * Ping the API to check connectivity
   */
  async ping(config) {
    return this.request("/v1/ping", {
      method: "GET",
      config
    });
  }
  /**
   * Make an API request
   */
  async request(path, options) {
    const { method, body, config } = options;
    const timeout = config?.timeout || this._timeout;
    const url = new URL(path, this._baseURL);
    const headers = {
      Authorization: `Bearer ${this._apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": this._userAgent
    };
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    if (config?.signal) {
      config.signal.addEventListener("abort", () => controller.abort());
    }
    try {
      const response = await this._fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : void 0,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return await this.handleResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ValidationError || error instanceof UnauthorizedError || error instanceof ForbiddenError || error instanceof RateLimitError || error instanceof APIError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new EnvlopedNetworkError(
            `Request timeout after ${timeout}ms`,
            error
          );
        }
        throw new EnvlopedNetworkError(
          `Network error: ${error.message}`,
          error
        );
      }
      throw new EnvlopedNetworkError("Unknown network error");
    }
  }
  /**
   * Handle API response
   */
  async handleResponse(response) {
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");
    let body;
    if (isJson) {
      body = await response.text();
    }
    if (!response.ok) {
      return this.handleError(response, body);
    }
    if (isJson && body) {
      return JSON.parse(body);
    }
    return void 0;
  }
  /**
   * Handle error response
   */
  handleError(response, body) {
    const status = response.status;
    let message = `HTTP ${status}`;
    let data;
    if (body) {
      try {
        data = JSON.parse(body);
        message = data?.message || message;
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
        const rateLimitData = data;
        if (rateLimitData?.usage) {
          throw new RateLimitError(message, {
            usage: rateLimitData.usage,
            resetsAt: rateLimitData.resetsAt
          });
        }
        throw new RateLimitError(message);
      }
      default:
        throw new APIError(message, status, body);
    }
  }
};
export {
  APIError,
  EmailsService,
  EnvlopedClient,
  EnvlopedError,
  EnvlopedNetworkError,
  ForbiddenError,
  RateLimitError,
  UnauthorizedError,
  VERSION,
  ValidationError,
  getVersion,
  isAPIError,
  isEnvlopedError,
  isForbiddenError,
  isNetworkError,
  isRateLimitError,
  isUnauthorizedError,
  isValidationError
};
//# sourceMappingURL=index.js.map