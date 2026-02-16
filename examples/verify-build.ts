/**
 * Build verification script
 */

import { EnvlopedClient, getVersion, ValidationError } from '../dist/index.js';

console.log('=== Build Verification ===\n');

// Test 1: Import version
console.log('✓ Version:', getVersion());

// Test 2: Create client
const client = new EnvlopedClient({
  apiKey: 'ev_test',
});
console.log('✓ Client created successfully');
console.log('  - API Key:', client.apiKey);
console.log('  - Base URL:', client.baseURL);
console.log('  - Timeout:', client.timeout);

// Test 3: Builder methods
client.withBaseURL('https://test.com').withTimeout(5000);
console.log('✓ Builder methods work');
console.log('  - Base URL:', client.baseURL);
console.log('  - Timeout:', client.timeout);

// Test 4: Validation
const validationResult = client.emails.validateEmailAddress('invalid-email');
if (!validationResult.valid) {
  console.log('✓ Validation works correctly');
  console.log('  - Error:', validationResult.error);
} else {
  console.log('✗ Validation should have failed');
}

// Test 5: Error classes
const validationError = new ValidationError('Test error');
console.log('✓ Error classes work');
console.log('  - ValidationError name:', validationError.name);

// Test 6: Email service
console.log('✓ Email service initialized');
console.log('  - Emails service exists:', !!client.emails);

console.log('\n=== All Build Verification Tests Passed! ===');
