import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export interface CreateCheckoutSessionDto {
  userId: string;
  planId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface MockCheckoutSession {
  id: string;
  url: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'expired';
  expiresAt: Date;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  created: number;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private mockSessions = new Map<string, MockCheckoutSession>();

  constructor(private prisma: PrismaService) {}

  async createCheckoutSession(dto: CreateCheckoutSessionDto): Promise<MockCheckoutSession> {
    // Get plan details
    const plan = await this.prisma.plan.findUnique({
      where: { id: dto.planId },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${dto.planId} not found`);
    }

    // Create mock checkout session
    const sessionId = `cs_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: MockCheckoutSession = {
      id: sessionId,
      url: `${process.env.FRONTEND_URL}/checkout/${sessionId}`,
      userId: dto.userId,
      planId: dto.planId,
      amount: plan.price,
      currency: plan.currency,
      status: 'pending',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    this.mockSessions.set(sessionId, session);

    this.logger.log(`Created mock checkout session ${sessionId} for user ${dto.userId}`);
    return session;
  }

  async getCheckoutSession(sessionId: string): Promise<MockCheckoutSession | null> {
    return this.mockSessions.get(sessionId) || null;
  }

  async completeCheckoutSession(sessionId: string): Promise<void> {
    const session = this.mockSessions.get(sessionId);
    if (!session) {
      throw new NotFoundException(`Checkout session ${sessionId} not found`);
    }

    if (session.status !== 'pending') {
      this.logger.warn(`Checkout session ${sessionId} is already ${session.status}`);
      return;
    }

    // Mark session as completed
    session.status = 'completed';
    this.mockSessions.set(sessionId, session);

    // Create payment log
    await this.prisma.paymentLog.create({
      data: {
        userId: session.userId,
        planId: session.planId,
        amount: session.amount,
        currency: session.currency,
        status: 'SUCCEEDED',
        description: `Mock payment for plan upgrade`,
        metadata: {
          checkoutSessionId: sessionId,
          mockPayment: true,
        },
      },
    });

    // Update user subscription
    await this.updateUserSubscription(session.userId, session.planId);

    this.logger.log(`Completed mock checkout session ${sessionId}`);
  }

  private async updateUserSubscription(userId: string, planId: string): Promise<void> {
    // Check if user has existing subscription
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    const subscriptionData = {
      planId,
      status: 'ACTIVE' as const,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      cancelAtPeriodEnd: false,
      canceledAt: null,
    };

    if (existingSubscription) {
      await this.prisma.subscription.update({
        where: { userId },
        data: subscriptionData,
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          userId,
          ...subscriptionData,
        },
      });
    }
  }

  async handleWebhookEvent(event: WebhookEvent): Promise<void> {
    this.logger.log(`Processing mock webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data);
        break;
      default:
        this.logger.warn(`Unhandled webhook event type: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(data: any): Promise<void> {
    const { session_id, customer_id, subscription_id } = data;
    
    // In real Stripe, we would get the session and update subscription
    this.logger.log(`Mock: Checkout completed for session ${session_id}`);
  }

  private async handlePaymentFailed(data: any): Promise<void> {
    const { subscription_id, customer_id } = data;
    
    // Update subscription status to past_due
    this.logger.log(`Mock: Payment failed for subscription ${subscription_id}`);
  }

  private async handleSubscriptionUpdated(data: any): Promise<void> {
    const { subscription_id, status } = data;
    
    this.logger.log(`Mock: Subscription ${subscription_id} updated to ${status}`);
  }

  async cancelSubscription(userId: string): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription not found for user ${userId}`);
    }

    // In mock mode, immediately cancel
    await this.prisma.subscription.update({
      where: { userId },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
        cancelAtPeriodEnd: true,
      },
    });

    // Create payment log for cancellation
    await this.prisma.paymentLog.create({
      data: {
        userId,
        planId: subscription.planId,
        amount: 0,
        currency: 'USD',
        status: 'CANCELED',
        description: 'Mock subscription cancellation',
        metadata: {
          mockCancellation: true,
        },
      },
    });

    this.logger.log(`Mock: Canceled subscription for user ${userId}`);
  }

  async getPaymentHistory(userId: string, limit = 20, offset = 0) {
    return this.prisma.paymentLog.findMany({
      where: { userId },
      include: {
        plan: {
          select: {
            name: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async getAllPayments(filters: {
    status?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const { status, userId, limit = 50, offset = 0 } = filters;

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    return this.prisma.paymentLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        plan: {
          select: {
            name: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async syncSubscriptionStatus(userId: string): Promise<void> {
    // Mock implementation - in real app would sync with Stripe
    this.logger.log(`Mock: Syncing subscription status for user ${userId}`);
  }

  // Development helper methods
  async createMockPayment(userId: string, planId: string, amount: number) {
    return this.prisma.paymentLog.create({
      data: {
        userId,
        planId,
        amount,
        currency: 'USD',
        status: 'SUCCEEDED',
        description: 'Mock development payment',
        metadata: {
          mockPayment: true,
          development: true,
        },
      },
    });
  }

  async clearMockSessions(): Promise<void> {
    this.mockSessions.clear();
    this.logger.log('Cleared all mock checkout sessions');
  }
}
