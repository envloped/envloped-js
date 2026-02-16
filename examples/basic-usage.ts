/**
 * Basic usage example for Envloped SDK
 */

import { EnvlopedClient } from '../src/index';

// Initialize the client
const client = new EnvlopedClient({
  apiKey: process.env.ENVELOPED_API_KEY || 'ev_test_api_key',
});

// Send a simple email
async function sendSimpleEmail() {
  try {
    const response = await client.emails.send({
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Hello from Envloped',
      html: '<h1>Hello World!</h1><p>This is a test email.</p>',
    });

    console.log('Email sent successfully:', response.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

// Send email with multiple recipients
async function sendMultipleRecipients() {
  try {
    const response = await client.emails.send({
      from: 'sender@example.com',
      to: [
        'recipient1@example.com',
        { email: 'recipient2@example.com', name: 'Jane Doe' },
      ],
      cc: ['cc@example.com'],
      bcc: [{ email: 'bcc@example.com', name: 'Hidden Recipient' }],
      subject: 'Multiple Recipients',
      html: '<p>This email has multiple recipients.</p>',
    });

    console.log('Email sent successfully:', response.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

// Send email with text content
async function sendTextEmail() {
  try {
    const response = await client.emails.send({
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Plain Text Email',
      text: 'This is a plain text email.',
    });

    console.log('Email sent successfully:', response.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

// Send email with custom headers
async function sendCustomHeaders() {
  try {
    const response = await client.emails.send({
      from: 'sender@example.com',
      to: ['recipient@example.com'],
      subject: 'Email with Custom Headers',
      html: '<p>This email has custom headers.</p>',
      replyTo: 'replies@example.com',
      headers: {
        'X-Custom-Header': 'custom-value',
        'X-Priority': '1',
      },
    });

    console.log('Email sent successfully:', response.messageId);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

// Ping the API
async function checkApiHealth() {
  try {
    const response = await client.ping();
    console.log('API is healthy:', response);
  } catch (error) {
    console.error('API health check failed:', error);
  }
}

// Run examples
async function main() {
  console.log('=== Basic Usage Examples ===\n');

  console.log('1. Sending simple email...');
  await sendSimpleEmail();

  console.log('\n2. Sending to multiple recipients...');
  await sendMultipleRecipients();

  console.log('\n3. Sending text email...');
  await sendTextEmail();

  console.log('\n4. Sending with custom headers...');
  await sendCustomHeaders();

  console.log('\n5. Checking API health...');
  await checkApiHealth();
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
