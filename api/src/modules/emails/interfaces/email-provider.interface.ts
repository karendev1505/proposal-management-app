export interface EmailOptions {
  to: string | string[];
  subject: string;
  template?: string;
  context?: Record<string, any>;
  html?: string;
  text?: string;
}

export interface IEmailProvider {
  sendMail(options: EmailOptions): Promise<void>;
}

export type EmailConfig = {
  mode: 'disabled' | 'smtp' | 'sendgrid';
  from: string;
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  sendgrid?: {
    apiKey: string;
  };
};
