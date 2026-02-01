# Email Utilities Documentation

## Overview
The Email Utilities module provides functions for sending emails through the CRM API. It supports both plain text emails and emails with document attachments using Nodemailer with Gmail SMTP configuration.

## Table of Contents
1. [Overview](#overview)
2. [Imports and Dependencies](#imports-and-dependencies)
3. [Interface Definitions](#interface-definitions)
4. [Function Details](#function-details)
5. [Configuration](#configuration)
6. [Security Considerations](#security-considerations)
7. [Usage Examples](#usage-examples)
8. [Integration Points](#integration-points)

## Imports and Dependencies

### External Dependencies
- `nodemailer`: Library for sending emails with various transport methods
- `typescript`: Provides type definitions for email operations

### Internal Dependencies
- `../config/env.config`: Configuration containing email settings

### Purpose of Each Import
- `nodemailer`: Provides email sending capabilities with transport configuration
- `config` from ../config/env.config: Provides email configuration settings

## Interface Definitions

### EmailOptions
```typescript
interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename?: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
  }>;
}
```
Defines the structure of options for sending emails, including recipient(s), subject, content, and optional attachments.

## Function Details

### sendTextEmail(to, subject, text)
**Description**: Sends a simple text-based email to the specified recipient(s).

**Parameters**:
- `to` (string): Email address of the recipient
- `subject` (string): Subject line of the email
- `text` (string): Plain text content of the email

**Return Type**: `Promise<Object>`

**Process Flow**:
1. Constructs email options with the provided parameters
2. Uses the configured transporter to send the email
3. Returns a result object with success status and message ID

**Return Object**:
```json
{
  "success": true,
  "messageId": "message-id-from-smtp",
  "recipients": ["recipient@example.com"]
}
```

**Usage**:
```typescript
const result = await sendTextEmail(
  'recipient@example.com',
  'Hello from CRM',
  'This is a test message.'
);
```

### sendDocumentEmail(to, subject, text, documentPath, documentName?)
**Description**: Sends an email with a document attachment to the specified recipient(s).

**Parameters**:
- `to` (string): Email address of the recipient
- `subject` (string): Subject line of the email
- `text` (string): Plain text content of the email
- `documentPath` (string): Path to the document file to attach
- `documentName` (string, optional): Custom name for the attached document (defaults to "document.pdf")

**Return Type**: `Promise<Object>`

**Process Flow**:
1. Constructs email options with the provided parameters and attachment
2. Uses the configured transporter to send the email with attachment
3. Returns a result object with success status and message ID

**Return Object**:
```json
{
  "success": true,
  "messageId": "message-id-from-smtp",
  "recipients": ["recipient@example.com"]
}
```

**Usage**:
```typescript
const result = await sendDocumentEmail(
  'recipient@example.com',
  'Report Attached',
  'Please find the requested report attached.',
  '/path/to/report.pdf',
  'Monthly_Report.pdf'
);
```

### sendEmail(options)
**Description**: Sends a customizable email with the provided options.

**Parameters**:
- `options` (EmailOptions): Complete email configuration including recipients, subject, content, and attachments

**Return Type**: `Promise<Object>`

**Process Flow**:
1. Uses the provided options to configure the email
2. Uses the configured transporter to send the email
3. Returns a result object with success status and message ID

**Return Object**:
```json
{
  "success": true,
  "messageId": "message-id-from-smtp",
  "recipients": ["recipient@example.com"]
}
```

**Usage**:
```typescript
const options = {
  to: 'recipient@example.com',
  subject: 'Custom Email',
  text: 'This is a custom email.',
  html: '<p>This is a <strong>custom email</strong>.</p>',
  attachments: [{
    filename: 'image.png',
    path: '/path/to/image.png'
  }]
};
const result = await sendEmail(options);
```

## Configuration

### Transporter Setup
The email utility uses Nodemailer with Gmail SMTP configuration:
- Service: Gmail
- Authentication: Requires EMAIL_USER and EMAIL_PASS environment variables
- From Address: Configured via EMAIL_FROM environment variable or defaults to noreply

### Required Environment Variables
- `EMAIL_USER`: Gmail address for sending emails
- `EMAIL_PASS`: App password for Gmail authentication
- `EMAIL_FROM`: Display name and address for the sender (optional)

## Security Considerations

### Current Security Measures
- Uses app-specific passwords for Gmail authentication
- Stores email credentials in environment variables
- Supports TLS encryption for SMTP connections
- Validates email addresses before sending

### Security Features
- **Credential Protection**: Email credentials stored in environment variables
- **Transport Security**: Uses encrypted connections to SMTP server
- **Authentication**: Requires valid Gmail credentials with app password
- **Rate Limiting**: Nodemailer respects rate limits of the email service

### Best Practices Followed
- Never hardcode email credentials in source code
- Use app-specific passwords instead of account passwords
- Validate email addresses before sending
- Monitor email sending for unusual activity

## Usage Examples

### Sending a Welcome Email
```javascript
import { sendTextEmail } from '../utils/email.util';

const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = 'Welcome to Our CRM!';
  const text = `Hi ${userName},\n\nWelcome to our CRM platform. We're excited to have you on board!\n\nBest regards,\nThe CRM Team`;
  
  const result = await sendTextEmail(userEmail, subject, text);
  
  if (result.success) {
    console.log(`Welcome email sent successfully to ${userEmail}`);
  } else {
    console.error('Failed to send welcome email:', result.error);
  }
};
```

### Sending a Document Report
```javascript
import { sendDocumentEmail } from '../utils/email.util';

const sendReport = async (userEmail, reportPath) => {
  const subject = 'Your Monthly Report';
  const text = 'Please find your monthly report attached.';
  const documentName = 'monthly_report.pdf';
  
  const result = await sendDocumentEmail(
    userEmail,
    subject,
    text,
    reportPath,
    documentName
  );
  
  if (result.success) {
    console.log(`Report sent successfully to ${userEmail}`);
  } else {
    console.error('Failed to send report:', result.error);
  }
};
```

### Sending an Email with HTML Content
```javascript
import { sendEmail } from '../utils/email.util';

const sendPromotionalEmail = async (userEmail, userName) => {
  const options = {
    to: userEmail,
    subject: 'Special Offer Just For You!',
    text: `Hi ${userName},\n\nWe have a special offer for you...`,
    html: `<h1>Hi ${userName},</h1><p>We have a <strong>special offer</strong> for you...</p>`,
  };
  
  const result = await sendEmail(options);
  
  if (result.success) {
    console.log(`Promotional email sent successfully to ${userEmail}`);
  } else {
    console.error('Failed to send promotional email:', result.error);
  }
};
```

### Bulk Email Sending
```javascript
// Sending emails to multiple recipients
const sendBulkEmail = async (recipients, subject, content) => {
  const promises = recipients.map(recipient => 
    sendTextEmail(recipient, subject, content)
  );
  
  const results = await Promise.allSettled(promises);
  
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - successful;
  
  console.log(`Sent emails: ${results.length}, Successful: ${successful}, Failed: ${failed}`);
};
```

## Integration Points

### With Application Services
- Used by notification services to send alerts
- Integrated with user services for welcome emails
- Supports document sharing functionality

### With Controllers
- Enables email sending from API endpoints
- Supports user invitation and notification features
- Facilitates document sharing workflows

### With Database
- Can be used to send notifications based on database changes
- Supports automated email workflows triggered by data events
- Enables reporting and document distribution features