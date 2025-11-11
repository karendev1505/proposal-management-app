export interface EmailPayload {
  to: string | string[];
  subject: string;
  template: string;
  context?: Record<string, any>;
  from?: string;
  fromName?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  disposition?: 'attachment' | 'inline';
  cid?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: 'sendgrid' | 'smtp' | 'console';
}

export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailContext {
  [key: string]: any;
  // Common context variables
  recipientName?: string;
  senderName?: string;
  proposalTitle?: string;
  proposalUrl?: string;
  signUrl?: string;
  companyName?: string;
  companyLogo?: string;
}

export enum EmailTemplateType {
  PROPOSAL_SENT = 'proposal-sent',
  PROPOSAL_VIEWED = 'proposal-viewed',
  PROPOSAL_SIGNED = 'proposal-signed',
  THANK_YOU = 'thank-you',
  TEST_EMAIL = 'test-email',
}
