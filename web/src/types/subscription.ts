export interface Plan {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  price: number;
  currency: string;
  interval: string;
  features: PlanFeatures;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanFeatures {
  proposals: number; // -1 for unlimited
  templates: number;
  storage: number; // MB
  emailsPerMonth: number;
  signatures: boolean;
  analytics: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  teamMembers: number;
  [key: string]: any;
}

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  planId: string;
  plan: Plan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface PaymentLog {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  metadata?: any;
  createdAt: string;
  userId: string;
  subscriptionId?: string;
  planId?: string;
  plan?: {
    name: string;
    displayName: string;
  };
  user?: {
    id: string;
    email: string;
    name: string;
  };
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
}

export interface UserUsage {
  proposals: number;
  templates: number;
  storage: number; // in MB
  emailsThisMonth: number;
}

export interface SubscriptionStats {
  subscription: {
    id: string;
    status: SubscriptionStatus;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd: boolean;
    plan: {
      name: string;
      displayName: string;
      price: number;
      currency: string;
    };
  };
  usage: UserUsage;
  limits: PlanFeatures;
  percentageUsed: {
    proposals: number;
    templates: number;
    storage: number;
    emails: number;
  };
}

export interface CheckoutSession {
  id: string;
  url: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'expired';
  expiresAt: string;
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
  PAST_DUE = 'PAST_DUE',
  TRIALING = 'TRIALING',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
  REFUNDED = 'REFUNDED',
}

// API Request/Response types
export interface CreateCheckoutSessionRequest {
  planId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface GetPlansResponse {
  plans: Plan[];
}

export interface GetSubscriptionResponse {
  subscription: Subscription;
  usage: UserUsage;
  limits: PlanFeatures;
}

export interface GetPaymentHistoryResponse {
  payments: PaymentLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
