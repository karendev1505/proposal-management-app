export enum EmailStatus {
  DRAFT = 'DRAFT',
  QUEUED = 'QUEUED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  OPENED = 'OPENED',
  CLICKED = 'CLICKED',
  BOUNCED = 'BOUNCED',
  FAILED = 'FAILED',
  SPAM = 'SPAM'
}

export enum EmailPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum EmailType {
  PROPOSAL = 'PROPOSAL',
  REMINDER = 'REMINDER',
  NOTIFICATION = 'NOTIFICATION',
  CUSTOM = 'CUSTOM'
}

export interface Email {
  id: string;
  subject: string;
  content: string;
  htmlContent?: string;
  recipientEmail: string;
  recipientName?: string;
  senderEmail: string;
  senderName?: string;
  type: EmailType;
  status: EmailStatus;
  templateId?: string;
  proposalId?: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateEmailData {
  subject: string;
  content: string;
  recipientEmail: string;
  recipientName?: string;
  type: EmailType;
  templateId?: string;
  proposalId?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  category: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailFilters {
  status?: EmailStatus;
  type?: EmailType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface EmailListResponse {
  emails: Email[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EmailStats {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  failed: number;
  openRate: number;
  deliveryRate: number;
}
