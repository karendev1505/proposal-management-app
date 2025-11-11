// Temporary types until Prisma Client is properly generated

export interface Plan {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  price: number;
  currency: string;
  interval: string;
  features: any; // JSON
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  planId: string;
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
  createdAt: Date;
  userId: string;
  subscriptionId?: string;
  planId?: string;
  stripePaymentIntentId?: string;
  stripeInvoiceId?: string;
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

// Extended Prisma service interface
export interface ExtendedPrismaService {
  plan: {
    findMany: (args?: any) => Promise<Plan[]>;
    findUnique: (args: any) => Promise<Plan | null>;
    create: (args: any) => Promise<Plan>;
    update: (args: any) => Promise<Plan>;
    delete: (args: any) => Promise<Plan>;
    count: (args?: any) => Promise<number>;
    upsert: (args: any) => Promise<Plan>;
  };
  subscription: {
    findMany: (args?: any) => Promise<Subscription[]>;
    findUnique: (args: any) => Promise<Subscription | null>;
    create: (args: any) => Promise<Subscription>;
    update: (args: any) => Promise<Subscription>;
    delete: (args: any) => Promise<Subscription>;
    count: (args?: any) => Promise<number>;
    updateMany: (args: any) => Promise<any>;
    deleteMany: (args: any) => Promise<any>;
  };
  paymentLog: {
    findMany: (args?: any) => Promise<PaymentLog[]>;
    findUnique: (args: any) => Promise<PaymentLog | null>;
    create: (args: any) => Promise<PaymentLog>;
    update: (args: any) => Promise<PaymentLog>;
    delete: (args: any) => Promise<PaymentLog>;
    count: (args?: any) => Promise<number>;
    aggregate: (args: any) => Promise<any>;
  };
}
