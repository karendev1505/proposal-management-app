export default () => ({
  mail: {
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'noreply@proposal.com',
    smtp: {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
});
