/**
 * Error handling examples for Envloped SDK
 */

import {
  EnvlopedClient,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  RateLimitError,
  APIError,
  EnvlopedNetworkError,
  isRateLimitError,
  isValidationError,
  isUnauthorizedError,
} from '../src/index';

// Initialize the client
const client = new EnvlopedClient({
  apiKey: process.env.ENVELOPED_API_KEY || 'ev_test_api_key',
});

// Example 1: Handle validation errors
async function handleValidationError() {
  try {
    await client.emails.send({
      from: '', // Invalid: empty from address
      to: [] as string[], // Invalid: no recipients
      subject: '', // Invalid: empty subject
      html: '<p>Test</p>',
    });
  } catch (error) {
    if (isValidationError(error)) {
      console.error('Validation Error:', error.message);
      // Fix the validation errors...
    }
  }
}

// Example 2: Handle unauthorized errors
async function handleUnauthorizedError() {
  const badClient = new EnvlopedClient({ apiKey: 'invalid_key' });

  try {
    await badClient.ping();
  } catch (error) {
    if (isUnauthorizedError(error)) {
      console.error('Authentication failed. Check your API key.');
      console.error('Error:', error.message);
    }
  }
}

// Example 3: Handle rate limit errors
async function handleRateLimitError() {
  try {
    await client.emails.send({
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Test',
      html: '<p>Test</p>',
    });
  } catch (error) {
    if (isRateLimitError(error)) {
      console.error('Rate limit exceeded!');
      console.error('Daily usage:', error.usage.dailyCount, '/', error.usage.dailyLimit);
      console.error('Monthly usage:', error.usage.monthlyCount, '/', error.usage.monthlyLimit);
      if (error.resetsAt) {
        console.error('Resets at:', error.resetsAt);
      }
    }
  }
}

// Example 4: Handle network errors
async function handleNetworkError() {
  try {
    // Set a very short timeout
    const timeoutClient = new EnvlopedClient({
      apiKey: process.env.ENVELOPED_API_KEY || 'ev_test_api_key',
      timeout: 1, // 1ms timeout
    });

    await timeoutClient.emails.send({
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Test',
      html: '<p>Test</p>',
    });
  } catch (error) {
    if (error instanceof EnvlopedNetworkError) {
      console.error('Network error:', error.message);
      if (error.cause) {
        console.error('Caused by:', error.cause.message);
      }
    }
  }
}

// Example 5: Handle generic API errors
async function handleApiError() {
  try {
    await client.ping();
  } catch (error) {
    if (error instanceof APIError) {
      console.error('API error occurred:');
      console.error('Status:', error.statusCode);
      console.error('Message:', error.message);
      if (error.body) {
        console.error('Response body:', error.body);
      }
    }
  }
}

// Example 6: Comprehensive error handling
async function comprehensiveErrorHandling() {
  try {
    await client.emails.send({
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Test',
      html: '<p>Test</p>',
    });
    console.log('Email sent successfully!');
  } catch (error) {
    if (isValidationError(error)) {
      console.error('❌ Validation failed:', error.message);
    } else if (isUnauthorizedError(error)) {
      console.error('❌ Authentication failed. Check your API key.');
    } else if (error instanceof ForbiddenError) {
      console.error('❌ Access forbidden:', error.message);
    } else if (isRateLimitError(error)) {
      console.error('❌ Rate limit exceeded.');
      console.error('   Usage:', error.usage.dailyCount, '/', error.usage.dailyLimit);
    } else if (error instanceof EnvlopedNetworkError) {
      console.error('❌ Network error:', error.message);
    } else if (error instanceof APIError) {
      console.error('❌ API error:', error.statusCode, error.message);
    } else {
      console.error('❌ Unknown error:', error);
    }
  }
}

// Example 7: Using type guards with switch
async function errorHandlingWithSwitch() {
  try {
    await client.emails.send({
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Test',
      html: '<p>Test</p>',
    });
  } catch (error) {
    // Check specific error types
    if (error instanceof ValidationError) {
      console.log('Handle validation error');
    } else if (error instanceof UnauthorizedError) {
      console.log('Handle auth error');
    } else if (error instanceof RateLimitError) {
      console.log('Handle rate limit - maybe retry later');
      console.log('Usage:', error.usage);
    } else if (error instanceof EnvlopedNetworkError) {
      console.log('Handle network error - maybe retry');
    } else {
      console.log('Handle unknown error');
    }
  }
}

// Run examples
async function main() {
  console.log('=== Error Handling Examples ===\n');

  console.log('1. Validation error example...');
  await handleValidationError();

  console.log('\n2. Unauthorized error example...');
  await handleUnauthorizedError();

  console.log('\n3. Rate limit error example...');
  await handleRateLimitError();

  console.log('\n4. Network error example...');
  await handleNetworkError();

  console.log('\n5. API error example...');
  await handleApiError();

  console.log('\n6. Comprehensive error handling...');
  await comprehensiveErrorHandling();

  console.log('\n7. Error handling with switch...');
  await errorHandlingWithSwitch();
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
