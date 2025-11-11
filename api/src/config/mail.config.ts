export interface MailConfig {
  provider: 'sendgrid' | 'smtp' | 'console';
  sendgridApiKey?: string;
  fromEmail: string;
  fromName: string;
  testEmail?: string;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user?: string;
    pass?: string;
  };
}

export default (): { mail: MailConfig } => ({
  mail: {
    provider: (process.env.MAIL_PROVIDER as 'sendgrid' | 'smtp' | 'console') || 'console',
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.MAIL_FROM || 'noreply@proposal.com',
    fromName: process.env.MAIL_FROM_NAME || 'Proposal Management System',
    testEmail: process.env.MAIL_TEST_TO,
    smtp: {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
});
