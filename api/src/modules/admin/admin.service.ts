import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export interface UserFilters {
  page: number;
  limit: number;
  search?: string;
  role?: string;
}

export interface PaymentFilters {
  page: number;
  limit: number;
  status?: string;
  userId?: string;
}

export interface SubscriptionFilters {
  page: number;
  limit: number;
  status?: string;
  planId?: string;
}

export interface EmailFilters {
  page: number;
  limit: number;
  status?: string;
}

export interface ProposalFilters {
  page: number;
  limit: number;
  status?: string;
  userId?: string;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  // Users management
  async getUsers(filters: UserFilters) {
    const { page, limit, search, role } = filters;
    const offset = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              proposals: true,
              templates: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        proposals: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        templates: {
          select: {
            id: true,
            name: true,
            type: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            proposals: true,
            templates: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateUser(id: string, updateData: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async deactivateUser(id: string) {
    // In a real app, you might have an 'active' field
    // For now, we'll just log the action
    this.logger.log(`Deactivating user ${id}`);
    
    // You could update a status field or soft delete
    return { message: 'User deactivated successfully' };
  }

  async activateUser(id: string) {
    this.logger.log(`Activating user ${id}`);
    return { message: 'User activated successfully' };
  }

  // Mock payments management (since we don't have real Prisma types yet)
  async getPayments(filters: PaymentFilters) {
    const { page, limit } = filters;
    
    // Mock data for now
    return {
      payments: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0,
      },
    };
  }

  async getPaymentDetails(id: string) {
    // Mock implementation
    return {
      id,
      amount: 29.99,
      currency: 'USD',
      status: 'succeeded',
      createdAt: new Date(),
    };
  }

  // Statistics
  async getAdminStats() {
    const [
      totalUsers,
      totalProposals,
      totalTemplates,
      recentUsers,
      recentProposals,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.proposal.count(),
      this.prisma.template.count(),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      this.prisma.proposal.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    // Mock revenue data
    const totalRevenue = 12450.00;
    const monthlyRevenue = 2890.00;

    return {
      overview: {
        totalUsers,
        totalProposals,
        totalTemplates,
        totalRevenue,
      },
      growth: {
        newUsersThisMonth: recentUsers,
        newProposalsThisMonth: recentProposals,
        revenueThisMonth: monthlyRevenue,
      },
      trends: {
        userGrowthRate: 15.2, // Mock percentage
        proposalGrowthRate: 23.1,
        revenueGrowthRate: 18.7,
      },
    };
  }

  async getRevenueStats(options: {
    period?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    // Mock revenue statistics
    const { period = 'month' } = options;
    
    const mockData = {
      month: [
        { date: '2024-01', revenue: 1200 },
        { date: '2024-02', revenue: 1450 },
        { date: '2024-03', revenue: 1680 },
        { date: '2024-04', revenue: 1890 },
        { date: '2024-05', revenue: 2100 },
        { date: '2024-06', revenue: 2350 },
      ],
      week: [
        { date: '2024-06-01', revenue: 320 },
        { date: '2024-06-08', revenue: 450 },
        { date: '2024-06-15', revenue: 380 },
        { date: '2024-06-22', revenue: 520 },
      ],
    };

    return {
      period,
      data: mockData[period] || mockData.month,
      total: mockData[period]?.reduce((sum, item) => sum + item.revenue, 0) || 0,
    };
  }

  // Plans management
  async getPlans(includeInactive = false) {
    // Mock implementation - in real app would use PlansService
    return [];
  }

  async updatePlan(id: string, updateData: any) {
    // Mock implementation
    this.logger.log(`Updating plan ${id}`);
    return { id, ...updateData };
  }

  // Subscriptions management
  async getSubscriptions(filters: SubscriptionFilters) {
    const { page, limit } = filters;
    
    // Mock data
    return {
      subscriptions: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0,
      },
    };
  }

  async cancelSubscription(id: string) {
    this.logger.log(`Canceling subscription ${id}`);
    return { message: 'Subscription canceled successfully' };
  }

  async reactivateSubscription(id: string) {
    this.logger.log(`Reactivating subscription ${id}`);
    return { message: 'Subscription reactivated successfully' };
  }

  // System management
  async getSystemHealth() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        email: 'healthy',
        storage: 'healthy',
      },
    };
  }

  async getSystemLogs(level?: string, limit = 100) {
    // Mock system logs
    const logs = [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'User login successful',
        userId: 'user123',
      },
      {
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: 'warn',
        message: 'Rate limit exceeded',
        ip: '192.168.1.1',
      },
      {
        timestamp: new Date(Date.now() - 120000).toISOString(),
        level: 'error',
        message: 'Payment processing failed',
        error: 'Card declined',
      },
    ];

    return {
      logs: level ? logs.filter(log => log.level === level) : logs,
      total: logs.length,
    };
  }

  // Email management
  async getEmailLogs(filters: EmailFilters) {
    const { page, limit } = filters;
    const offset = (page - 1) * limit;

    const [emails, total] = await Promise.all([
      this.prisma.emailLog.findMany({
        orderBy: { sentAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.emailLog.count(),
    ]);

    return {
      emails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Proposals management
  async getProposals(filters: ProposalFilters) {
    const { page, limit, status, userId } = filters;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.authorId = userId;

    const [proposals, total] = await Promise.all([
      this.prisma.proposal.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          _count: {
            select: {
              signatures: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.proposal.count({ where }),
    ]);

    return {
      proposals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
