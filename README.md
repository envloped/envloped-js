# @envloped/envloped-js

[![npm version](https://badge.fury.io/js/%40envloped%2Fenvloped-js.svg)](https://badge.fury.io/js/%40envloped%2Fenvloped-js)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

TypeScript/JavaScript SDK for [Envloped](https://envloped.com) - The AI-powered email platform for developers.

## Features

- 🚀 Zero runtime dependencies - uses native Fetch API
- 📝 Full TypeScript support with comprehensive types
- 🎯 Client-side validation before API calls
- 🔄 Request cancellation with AbortController
- 🌐 Works in Node.js 18+ and all modern browsers
- 🛡️ Custom error classes with type guards
- ⚡ Builder pattern for fluent configuration
- 📦 ESM and CommonJS support

## Installation

```bash
npm install @envloped/envloped-js
```

```bash
yarn add @envloped/envloped-js
```

```bash
pnpm add @envloped/envloped-js
```

## Quick Start

```typescript
import { EnvlopedClient } from '@envloped/envloped-js';

const client = new EnvlopedClient({
  apiKey: 'ev_test_api_key',
});

// Send an email
const response = await client.emails.send({
  from: 'sender@example.com',
  to: ['recipient@example.com'],
  subject: 'Hello from Envloped',
  html: '<h1>Hello World!</h1>',
});

console.log('Email sent:', response.messageId);
```

## Usage

### Sending Emails

```typescript
// Simple email
await client.emails.send({
  from: 'sender@example.com',
  to: ['recipient@example.com'],
  subject: 'Test Email',
  html: '<p>This is a test email.</p>',
});

// Multiple recipients
await client.emails.send({
  from: 'sender@example.com',
  to: [
    'recipient1@example.com',
    { email: 'recipient2@example.com', name: 'Jane Doe' },
  ],
  cc: ['cc@example.com'],
  bcc: [{ email: 'bcc@example.com', name: 'Hidden Recipient' }],
  subject: 'Multiple Recipients',
  html: '<p>Email with multiple recipients.</p>',
});

// Plain text email
await client.emails.send({
  from: 'sender@example.com',
  to: ['recipient@example.com'],
  subject: 'Plain Text',
  text: 'This is a plain text email.',
});

// Email with custom headers
await client.emails.send({
  from: 'sender@example.com',
  to: ['recipient@example.com'],
  subject: 'Custom Headers',
  html: '<p>Email with custom headers.</p>',
  replyTo: 'replies@example.com',
  headers: {
    'X-Custom-Header': 'value',
    'X-Priority': '1',
  },
});
```

### Error Handling

```typescript
import {
  ValidationError,
  UnauthorizedError,
  RateLimitError,
  isRateLimitError,
} from '@envloped/envloped-js';

try {
  await client.emails.send({
    from: 'sender@example.com',
    to: ['recipient@example.com'],
    subject: 'Test',
    html: '<p>Test</p>',
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.message);
  } else if (error instanceof UnauthorizedError) {
    console.error('Invalid API key');
  } else if (isRateLimitError(error)) {
    console.error('Rate limit exceeded:', error.usage);
  }
}
```

### Configuration

```typescript
// Custom base URL and timeout
const client = new EnvlopedClient({
  apiKey: 'ev_test_api_key',
  baseURL: 'https://api.example.com',
  timeout: 30000, // 30 seconds
});

// Builder pattern for fluent configuration
const client = new EnvlopedClient({ apiKey: 'ev_test_api_key' })
  .withBaseURL('https://api.example.com')
  .withTimeout(15000)
  .withUserAgent('MyApp/1.0.0');
```

### Request Cancellation

```typescript
const controller = new AbortController();

// Cancel after 100ms
setTimeout(() => controller.abort(), 100);

try {
  await client.emails.send(
    {
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Test',
      html: '<p>Test</p>',
    },
    {
      signal: controller.signal,
    }
  );
} catch (error) {
  console.log('Request cancelled');
}
```

### Health Check

```typescript
const response = await client.ping();
console.log('API Status:', response.message);
console.log('Company ID:', response.companyId);
```

## API Reference

### EnvlopedClient

Main client for interacting with Envloped API.

#### Constructor

```typescript
new EnvlopedClient(config: ClientConfig)
```

**Parameters:**
- `apiKey` (string, required) - Your Envloped API key
- `baseURL` (string, optional) - Base URL for API requests (default: `https://api.envloped.com`)
- `timeout` (number, optional) - Request timeout in milliseconds (default: `10000`)
- `fetch` (function, optional) - Custom fetch implementation
- `userAgent` (string, optional) - Custom user agent string

#### Methods

##### `emails.send(params, config?)`

Send an email.

**Parameters:**
- `params.from` (string) - Sender email address
- `params.to` (array) - Recipient email addresses
- `params.subject` (string) - Email subject
- `params.html` (string, optional) - HTML content
- `params.text` (string, optional) - Plain text content
- `params.cc` (array, optional) - CC recipients
- `params.bcc` (array, optional) - BCC recipients
- `params.replyTo` (string, optional) - Reply-to address
- `params.headers` (object, optional) - Custom headers
- `config.signal` (AbortSignal, optional) - Abort signal for cancellation
- `config.timeout` (number, optional) - Per-request timeout

**Returns:** `Promise<SendEmailResponse>`

##### `ping(config?)`

Check API health.

**Returns:** `Promise<PingResponse>`

## Error Classes

- `EnvlopedError` - Base error class
- `ValidationError` (400) - Invalid request parameters
- `UnauthorizedError` (401) - Invalid or missing API key
- `ForbiddenError` (403) - Access denied
- `RateLimitError` (429) - Rate limit exceeded
- `APIError` - Generic API errors (500, 502, etc.)
- `EnvlopedNetworkError` - Network failures

## Type Guards

- `isValidationError(error)` - Check for ValidationError
- `isUnauthorizedError(error)` - Check for UnauthorizedError
- `isForbiddenError(error)` - Check for ForbiddenError
- `isRateLimitError(error)` - Check for RateLimitError
- `isAPIError(error)` - Check for APIError
- `isNetworkError(error)` - Check for NetworkError

## Browser Support

This SDK uses the native Fetch API, which is supported in:
- Chrome 42+
- Firefox 39+
- Safari 10.1+
- Edge 14+
- Node.js 18+

## License

MIT

## Support

- 📖 [Documentation](https://envloped.com/docs)
- 🐛 [Bug Reports](https://github.com/envloped/envloped-js/issues)
- 💬 [Discord Community](https://discord.gg/envloped)
