import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Plan, Subscription, SubscriptionStatus } from '@prisma/client';

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

export interface CreatePlanDto {
  name: string;
  displayName: string;
  description?: string;
  price: number;
  currency?: string;
  interval?: string;
  features: PlanFeatures;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdatePlanDto {
  displayName?: string;
  description?: string;
  price?: number;
  currency?: string;
  interval?: string;
  features?: PlanFeatures;
  isActive?: boolean;
  sortOrder?: number;
}

@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(includeInactive = false): Promise<Plan[]> {
    return this.prisma.plan.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string): Promise<Plan> {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    return plan;
  }

  async findByName(name: string): Promise<Plan | null> {
    return this.prisma.plan.findUnique({
      where: { name },
    });
  }

  async create(dto: CreatePlanDto): Promise<Plan> {
    // Check if plan with this name already exists
    const existingPlan = await this.findByName(dto.name);
    if (existingPlan) {
      throw new BadRequestException(`Plan with name '${dto.name}' already exists`);
    }

    return this.prisma.plan.create({
      data: {
        name: dto.name,
        displayName: dto.displayName,
        description: dto.description,
        price: dto.price,
        currency: dto.currency || 'USD',
        interval: dto.interval || 'month',
        features: dto.features as any,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.findOne(id);

    return this.prisma.plan.update({
      where: { id },
      data: {
        displayName: dto.displayName,
        description: dto.description,
        price: dto.price,
        currency: dto.currency,
        interval: dto.interval,
        features: dto.features as any,
        isActive: dto.isActive,
        sortOrder: dto.sortOrder,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    const plan = await this.findOne(id);

    // Check if plan has active subscriptions
    const activeSubscriptions = await this.prisma.subscription.count({
      where: {
        planId: id,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (activeSubscriptions > 0) {
      throw new BadRequestException(
        `Cannot delete plan with ${activeSubscriptions} active subscriptions. Deactivate the plan instead.`
      );
    }

    await this.prisma.plan.delete({
      where: { id },
    });

    this.logger.log(`Plan ${plan.name} deleted`);
  }

  async deactivate(id: string): Promise<Plan> {
    return this.update(id, { isActive: false });
  }

  async activate(id: string): Promise<Plan> {
    return this.update(id, { isActive: true });
  }

  async getFreePlan(): Promise<Plan> {
    const freePlan = await this.findByName('free');
    if (!freePlan) {
      throw new NotFoundException('Free plan not found');
    }
    return freePlan;
  }

  async getPlanFeatures(planId: string): Promise<PlanFeatures> {
    const plan = await this.findOne(planId);
    return plan.features as PlanFeatures;
  }

  async checkFeatureLimit(planId: string, feature: string, currentUsage: number): Promise<boolean> {
    const features = await this.getPlanFeatures(planId);
    const limit = features[feature];

    // -1 means unlimited
    if (limit === -1) {
      return true;
    }

    return currentUsage < limit;
  }

  async getUsageStats(planId: string) {
    const subscriptionsCount = await this.prisma.subscription.count({
      where: {
        planId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    const totalRevenue = await this.prisma.paymentLog.aggregate({
      where: {
        planId,
        status: 'SUCCEEDED',
      },
      _sum: {
        amount: true,
      },
    });

    return {
      activeSubscriptions: subscriptionsCount,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }
}
