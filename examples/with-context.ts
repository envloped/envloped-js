/**
 * Advanced examples with cancellation, custom configuration, and more
 */

import { EnvlopedClient, getVersion } from '../src/index';

// Example 1: Custom base URL
async function customBaseUrl() {
  const client = new EnvlopedClient({
    apiKey: 'ev_test_api_key',
    baseURL: 'https://custom-api.example.com',
  });

  try {
    const response = await client.ping();
    console.log('Pinged custom base URL:', response);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 2: Custom timeout
async function customTimeout() {
  const client = new EnvlopedClient({
    apiKey: 'ev_test_api_key',
    timeout: 30000, // 30 seconds
  });

  try {
    await client.emails.send({
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Test with custom timeout',
      html: '<p>Test</p>',
    });
    console.log('Email sent with extended timeout');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 3: Builder pattern
async function builderPattern() {
  const client = new EnvlopedClient({ apiKey: 'ev_test_api_key' })
    .withBaseURL('https://api.example.com')
    .withTimeout(15000)
    .withUserAgent('MyApp/1.0.0');

  console.log('Client configured with builder pattern');
  console.log('Base URL:', client.baseURL);
  console.log('Timeout:', client.timeout);
  console.log('User Agent:', client.userAgent);
}

// Example 4: Request cancellation with AbortController
async function requestCancellation() {
  const client = new EnvlopedClient({ apiKey: 'ev_test_api_key' });

  const controller = new AbortController();

  // Cancel after 100ms (simulating user cancellation)
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
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message.includes('abort')) {
      console.log('Request was cancelled by user');
    } else {
      console.error('Error:', error);
    }
  }
}

// Example 5: Per-request timeout
async function perRequestTimeout() {
  const client = new EnvlopedClient({
    apiKey: 'ev_test_api_key',
    timeout: 10000, // Default timeout
  });

  try {
    // Override timeout for this specific request
    await client.emails.send(
      {
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test with per-request timeout',
        html: '<p>Test</p>',
      },
      {
        timeout: 5000, // 5 seconds for this request only
      }
    );
    console.log('Email sent with custom timeout');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 6: Custom fetch implementation (useful for testing)
async function customFetch() {
  const customFetch = async (url: RequestInfo | URL, init?: RequestInit) => {
    console.log('Custom fetch called with:', url);
    // Add custom logging, retry logic, etc.
    return fetch(url, init);
  };

  const client = new EnvlopedClient({
    apiKey: 'ev_test_api_key',
    fetch: customFetch,
  });

  try {
    await client.ping();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 7: Get SDK version
async function sdkVersion() {
  console.log('SDK version:', getVersion());
  console.log('SDK version via getVersion():', getVersion());
}

// Example 8: Email validation utility
async function emailValidation() {
  const client = new EnvlopedClient({ apiKey: 'ev_test_api_key' });

  const emails = [
    'valid@example.com',
    'invalid-email',
    '',
    'test@test',
    'user@domain.co.uk',
  ];

  console.log('Validating emails:');
  for (const email of emails) {
    const result = client.emails.validateEmailAddress(email);
    console.log(`  ${email || '(empty)'}:`, result.valid ? '✓' : '✗', result.error || '');
  }
}

// Example 9: Normalize email addresses
async function normalizeEmails() {
  const client = new EnvlopedClient({ apiKey: 'ev_test_api_key' });

  const addresses = [
    'plain@example.com',
    { email: 'object@example.com', name: 'John Doe' },
  ];

  console.log('Normalized email addresses:');
  for (const address of addresses) {
    const normalized = client.emails.normalizeEmailAddress(address);
    console.log(`  ${JSON.stringify(address)} -> ${JSON.stringify(normalized)}`);
  }
}

// Example 10: Advanced error handling with retry
async function sendWithRetry(maxRetries = 3) {
  const client = new EnvlopedClient({ apiKey: 'ev_test_api_key' });

  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.emails.send({
        from: 'sender@example.com',
        to: ['recipient@example.com'],
        subject: 'Test with retry',
        html: '<p>Test</p>',
      });
      console.log(`Email sent successfully on attempt ${attempt}`);
      return response;
    } catch (error: any) {
      lastError = error;
      console.log(`Attempt ${attempt} failed:`, error.message);

      // Don't retry on validation or auth errors
      if (
        error.name === 'ValidationError' ||
        error.name === 'UnauthorizedError' ||
        error.name === 'ForbiddenError'
      ) {
        break;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error('Failed after', maxRetries, 'attempts');
  throw lastError;
}

// Run examples
async function main() {
  console.log('=== Advanced Examples ===\n');

  console.log('1. Custom base URL...');
  await customBaseUrl();

  console.log('\n2. Custom timeout...');
  await customTimeout();

  console.log('\n3. Builder pattern...');
  await builderPattern();

  console.log('\n4. Request cancellation...');
  await requestCancellation();

  console.log('\n5. Per-request timeout...');
  await perRequestTimeout();

  console.log('\n6. Custom fetch implementation...');
  await customFetch();

  console.log('\n7. SDK version...');
  await sdkVersion();

  console.log('\n8. Email validation...');
  await emailValidation();

  console.log('\n9. Normalize email addresses...');
  await normalizeEmails();

  console.log('\n10. Send with retry...');
  await sendWithRetry();
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
