import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // Node environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  
  // Server
  PORT: Joi.number().default(3001),
  
  // Database
  DATABASE_URL: Joi.string().required(),
  
  // JWT
  JWT_SECRET: Joi.string().required().min(32),
  JWT_EXPIRES_IN: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required().min(32),
  JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
  
  // Email Configuration
  EMAIL_MODE: Joi.string().valid('disabled', 'smtp', 'sendgrid').default('disabled'),
  EMAIL_FROM: Joi.string().email().default('noreply@example.com'),
  
  // SendGrid Configuration
  SENDGRID_API_KEY: Joi.string().when('EMAIL_MODE', {
    is: 'sendgrid',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  
  // SMTP Configuration
  EMAIL_SMTP_HOST: Joi.string().when('EMAIL_MODE', {
    is: 'smtp',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  EMAIL_SMTP_PORT: Joi.number().when('EMAIL_MODE', {
    is: 'smtp',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  EMAIL_SMTP_SECURE: Joi.boolean().when('EMAIL_MODE', {
    is: 'smtp',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  EMAIL_SMTP_USER: Joi.string().when('EMAIL_MODE', {
    is: 'smtp',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  EMAIL_SMTP_PASS: Joi.string().when('EMAIL_MODE', {
    is: 'smtp',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  
  // Frontend URL for email links
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  
  // AWS S3 (optional for file uploads)
  AWS_ACCESS_KEY_ID: Joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
  AWS_REGION: Joi.string().optional(),
  AWS_BUCKET_NAME: Joi.string().optional(),
  
  // CORS
  CORS_ORIGIN: Joi.string().uri().optional(),
});
