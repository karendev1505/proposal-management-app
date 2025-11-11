import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PlansService, PlanFeatures } from '../plans/plans.service';
import { Subscription, SubscriptionStatus, Plan } from '@prisma/client';

export interface UserUsage {
  proposals: number;
  templates: number;
  storage: number; // in MB
  emailsThisMonth: number;
}

export interface SubscriptionWithPlan extends Subscription {
  plan: Plan;
}

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private prisma: PrismaService,
    private plansService: PlansService,
  ) {}

  async getActivePlan(userId: string): Promise<SubscriptionWithPlan> {
    this.logger.debug(`Getting active plan for userId: ${userId}`);
    
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // Get user with their role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      throw new NotFoundException(`User not found with ID: ${userId}`);
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: { 
        userId,
        status: SubscriptionStatus.ACTIVE 
      },
      include: { plan: true },
      orderBy: { updatedAt: 'desc' },
    });

    // Determine what plan the user should have based on role
    const shouldHaveProPlan = user.role === 'ADMIN';
    
    if (!subscription) {
      // Create new subscription based on user role
      let targetPlan;
      
      if (shouldHaveProPlan) {
        // Admin gets Pro plan
        targetPlan = await this.prisma.plan.findFirst({
          where: { name: 'pro' }
        });
      } else {
        // Regular user gets Free plan  
        targetPlan = await this.prisma.plan.findFirst({
          where: { name: 'free' }
        });
      }

      if (!targetPlan) {
        throw new NotFoundException(`${shouldHaveProPlan ? 'Pro' : 'Free'} plan not found`);
      }
      
      const newSubscription = await this.prisma.subscription.create({
        data: {
          userId,
          planId: targetPlan.id,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
        include: { plan: true },
      });
      
      return newSubscription as SubscriptionWithPlan;
    }

    // Check if current subscription matches user role
    const currentlyHasProPlan = subscription.plan.name === 'pro';
    
    if (shouldHaveProPlan && !currentlyHasProPlan) {
      // Admin should have Pro but has Free - upgrade to Pro
      const proPlan = await this.prisma.plan.findFirst({
        where: { name: 'pro' }
      });
      
      if (proPlan) {
        const updatedSubscription = await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            planId: proPlan.id,
            updatedAt: new Date(),
          },
          include: { plan: true },
        });
        return updatedSubscription as SubscriptionWithPlan;
      }
    } else if (!shouldHaveProPlan && currentlyHasProPlan) {
      // Regular user has Pro but should have Free - downgrade to Free
      const freePlan = await this.prisma.plan.findFirst({
        where: { name: 'free' }
      });
      
      if (freePlan) {
        const updatedSubscription = await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            planId: freePlan.id,
            updatedAt: new Date(),
          },
          include: { plan: true },
        });
        return updatedSubscription as SubscriptionWithPlan;
      }
    }

    return subscription as SubscriptionWithPlan;
  }

  async createSubscription(userId: string, planId: string): Promise<Subscription> {
    // Check if user already has a subscription
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: { userId },
    });

    if (existingSubscription) {
      throw new BadRequestException('User already has a subscription');
    }

    // Verify plan exists
    await this.plansService.findOne(planId);

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      include: { plan: true },
    });

    this.logger.log(`Created subscription for user ${userId} with plan ${planId}`);
    return subscription;
  }

  async upgradePlan(userId: string, newPlanId: string): Promise<Subscription> {
    const currentSubscription = await this.getActivePlan(userId);
    const newPlan = await this.plansService.findOne(newPlanId);

    // Check if it's actually an upgrade (higher price)
    if (newPlan.price <= currentSubscription.plan.price && newPlan.id !== currentSubscription.planId) {
      this.logger.warn(`User ${userId} attempting to "upgrade" to a lower-priced plan`);
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id: currentSubscription.id },
      data: {
        planId: newPlanId,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Reset billing period
        cancelAtPeriodEnd: false,
        canceledAt: null,
        updatedAt: new Date(),
      },
      include: { plan: true },
    });

    this.logger.log(`User ${userId} upgraded from ${currentSubscription.plan.name} to ${newPlan.name}`);
    return updatedSubscription;
  }

  async cancelSubscription(userId: string, immediate = false): Promise<Subscription> {
    const subscription = await this.getActivePlan(userId);

    if (subscription.status === SubscriptionStatus.CANCELED) {
      throw new BadRequestException('Subscription is already canceled');
    }

    const updateData: any = {
      canceledAt: new Date(),
      updatedAt: new Date(),
    };

    if (immediate) {
      // Immediately downgrade to free plan
      const freePlan = await this.plansService.getFreePlan();
      updateData.planId = freePlan.id;
      updateData.status = SubscriptionStatus.ACTIVE;
      updateData.cancelAtPeriodEnd = false;
    } else {
      // Cancel at period end
      updateData.cancelAtPeriodEnd = true;
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { userId },
      data: updateData,
      include: { plan: true },
    });

    this.logger.log(`User ${userId} canceled subscription (immediate: ${immediate})`);
    return updatedSubscription;
  }

  async getUserUsage(userId: string): Promise<UserUsage> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [proposalsCount, templatesCount, emailsCount] = await Promise.all([
      // Count user's proposals
      this.prisma.proposal.count({
        where: { authorId: userId },
      }),
      
      // Count user's templates
      this.prisma.template.count({
        where: { authorId: userId },
      }),
      
      // Count emails sent this month (via user's proposals)
      this.getUserEmailCount(userId, startOfMonth),
    ]);

    // TODO: Calculate actual storage usage
    const storageUsage = 0; // Placeholder

    return {
      proposals: proposalsCount,
      templates: templatesCount,
      storage: storageUsage,
      emailsThisMonth: emailsCount,
    };
  }

  private async getUserEmailCount(userId: string, startDate: Date): Promise<number> {
    // Get user's proposal IDs
    const userProposals = await this.prisma.proposal.findMany({
      where: { authorId: userId },
      select: { id: true },
    });
    
    const proposalIds = userProposals.map(p => p.id);
    
    if (proposalIds.length === 0) {
      return 0;
    }

    return this.prisma.emailLog.count({
      where: {
        proposalId: {
          in: proposalIds,
        },
        sentAt: {
          gte: startDate,
        },
      },
    });
  }

  async checkUsageLimits(userId: string): Promise<{
    withinLimits: boolean;
    limits: PlanFeatures;
    usage: UserUsage;
    violations: string[];
  }> {
    const subscription = await this.getActivePlan(userId);
    const usage = await this.getUserUsage(userId);
    const limits = subscription.plan.features as PlanFeatures;

    const violations: string[] = [];

    // Check each limit
    if (limits.proposals !== -1 && usage.proposals >= limits.proposals) {
      violations.push(`Proposal limit reached (${usage.proposals}/${limits.proposals})`);
    }

    if (limits.templates !== -1 && usage.templates >= limits.templates) {
      violations.push(`Template limit reached (${usage.templates}/${limits.templates})`);
    }

    if (limits.storage !== -1 && usage.storage >= limits.storage) {
      violations.push(`Storage limit reached (${usage.storage}MB/${limits.storage}MB)`);
    }

    if (limits.emailsPerMonth !== -1 && usage.emailsThisMonth >= limits.emailsPerMonth) {
      violations.push(`Monthly email limit reached (${usage.emailsThisMonth}/${limits.emailsPerMonth})`);
    }

    return {
      withinLimits: violations.length === 0,
      limits,
      usage,
      violations,
    };
  }

  async canPerformAction(userId: string, action: 'create_proposal' | 'create_template' | 'send_email'): Promise<boolean> {
    const limitsCheck = await this.checkUsageLimits(userId);
    
    switch (action) {
      case 'create_proposal':
        return limitsCheck.limits.proposals === -1 || limitsCheck.usage.proposals < limitsCheck.limits.proposals;
      
      case 'create_template':
        return limitsCheck.limits.templates === -1 || limitsCheck.usage.templates < limitsCheck.limits.templates;
      
      case 'send_email':
        return limitsCheck.limits.emailsPerMonth === -1 || limitsCheck.usage.emailsThisMonth < limitsCheck.limits.emailsPerMonth;
      
      default:
        return true;
    }
  }

  async getSubscriptionStats(userId: string) {
    const subscription = await this.getActivePlan(userId);
    const usage = await this.getUserUsage(userId);
    const limits = subscription.plan.features as PlanFeatures;

    return {
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        plan: {
          name: subscription.plan.name,
          displayName: subscription.plan.displayName,
          price: subscription.plan.price,
          currency: subscription.plan.currency,
        },
      },
      usage,
      limits,
      percentageUsed: {
        proposals: limits.proposals === -1 ? 0 : Math.round((usage.proposals / limits.proposals) * 100),
        templates: limits.templates === -1 ? 0 : Math.round((usage.templates / limits.templates) * 100),
        storage: limits.storage === -1 ? 0 : Math.round((usage.storage / limits.storage) * 100),
        emails: limits.emailsPerMonth === -1 ? 0 : Math.round((usage.emailsThisMonth / limits.emailsPerMonth) * 100),
      },
    };
  }

  async getAllSubscriptions(filters: {
    status?: SubscriptionStatus;
    planId?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const { status, planId, limit = 50, offset = 0 } = filters;

    const where: any = {};
    if (status) where.status = status;
    if (planId) where.planId = planId;

    return this.prisma.subscription.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }
}
