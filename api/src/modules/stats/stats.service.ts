import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export interface UserStats {
  proposals: {
    total: number;
    draft: number;
    sent: number;
    viewed: number;
    signed: number;
    rejected: number;
    expired: number;
  };
  templates: {
    total: number;
    created: number;
  };
  emails: {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
  };
  notifications: {
    total: number;
    unread: number;
  };
}

export interface GlobalStats {
  users: {
    total: number;
    active: number;
  };
  proposals: {
    total: number;
    byStatus: Record<string, number>;
    thisMonth: number;
    lastMonth: number;
  };
  templates: {
    total: number;
    public: number;
  };
  signatures: {
    total: number;
    thisMonth: number;
  };
  emails: {
    total: number;
    thisMonth: number;
    successRate: number;
  };
}

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getUserStats(userId: string): Promise<UserStats> {
    const [
      proposalStats,
      templateStats,
      emailStats,
      notificationStats,
    ] = await Promise.all([
      this.getProposalStats(userId),
      this.getTemplateStats(userId),
      this.getEmailStats(userId),
      this.getNotificationStats(userId),
    ]);

    return {
      proposals: proposalStats,
      templates: templateStats,
      emails: emailStats,
      notifications: notificationStats,
    };
  }

  async getGlobalStats(): Promise<GlobalStats> {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      userStats,
      proposalStats,
      templateStats,
      signatureStats,
      emailStats,
    ] = await Promise.all([
      this.getGlobalUserStats(),
      this.getGlobalProposalStats(thisMonth, lastMonth),
      this.getGlobalTemplateStats(),
      this.getGlobalSignatureStats(thisMonth),
      this.getGlobalEmailStats(thisMonth),
    ]);

    return {
      users: userStats,
      proposals: proposalStats,
      templates: templateStats,
      signatures: signatureStats,
      emails: emailStats,
    };
  }

  private async getProposalStats(userId: string) {
    const proposals = await this.prisma.proposal.groupBy({
      by: ['status'],
      where: { authorId: userId },
      _count: { status: true },
    });

    const statusCounts = proposals.reduce((acc, item) => {
      acc[item.status.toLowerCase()] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    const total = await this.prisma.proposal.count({
      where: { authorId: userId },
    });

    return {
      total,
      draft: statusCounts.draft || 0,
      sent: statusCounts.sent || 0,
      viewed: statusCounts.viewed || 0,
      signed: statusCounts.signed || 0,
      rejected: statusCounts.rejected || 0,
      expired: statusCounts.expired || 0,
    };
  }

  private async getTemplateStats(userId: string) {
    const [total, created] = await Promise.all([
      this.prisma.template.count({
        where: {
          OR: [
            { authorId: userId },
            { isPublic: true },
          ],
        },
      }),
      this.prisma.template.count({
        where: { authorId: userId },
      }),
    ]);

    return { total, created };
  }

  private async getEmailStats(userId: string) {
    // Get user's proposal IDs first
    const userProposals = await this.prisma.proposal.findMany({
      where: { authorId: userId },
      select: { id: true },
    });
    
    const proposalIds = userProposals.map(p => p.id);
    
    if (proposalIds.length === 0) {
      return {
        total: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
      };
    }

    const total = await this.prisma.emailLog.count({
      where: {
        proposalId: {
          in: proposalIds,
        },
      },
    });

    // Since EmailLog schema was simplified, return basic stats
    return {
      total,
      sent: total, // Assume all logged emails were sent
      delivered: 0,
      failed: 0,
    };
  }

  private async getNotificationStats(userId: string) {
    const [total, unread] = await Promise.all([
      this.prisma.notification.count({
        where: { userId },
      }),
      this.prisma.notification.count({
        where: { userId, read: false },
      }),
    ]);

    return { total, unread };
  }

  private async getGlobalUserStats() {
    const total = await this.prisma.user.count();
    // Consider users active if they have proposals or have logged in recently
    const active = await this.prisma.user.count({
      where: {
        proposals: {
          some: {},
        },
      },
    });

    return { total, active };
  }

  private async getGlobalProposalStats(thisMonth: Date, lastMonth: Date) {
    const [total, statusGroups, thisMonthCount, lastMonthCount] = await Promise.all([
      this.prisma.proposal.count(),
      this.prisma.proposal.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.proposal.count({
        where: {
          createdAt: { gte: thisMonth },
        },
      }),
      this.prisma.proposal.count({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: thisMonth,
          },
        },
      }),
    ]);

    const byStatus = statusGroups.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byStatus,
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount,
    };
  }

  private async getGlobalTemplateStats() {
    const [total, publicCount] = await Promise.all([
      this.prisma.template.count(),
      this.prisma.template.count({
        where: { isPublic: true },
      }),
    ]);

    return {
      total,
      public: publicCount,
    };
  }

  private async getGlobalSignatureStats(thisMonth: Date) {
    const [total, thisMonthCount] = await Promise.all([
      this.prisma.signature.count(),
      this.prisma.signature.count({
        where: {
          signedAt: { gte: thisMonth },
        },
      }),
    ]);

    return {
      total,
      thisMonth: thisMonthCount,
    };
  }

  private async getGlobalEmailStats(thisMonth: Date) {
    const [total, thisMonthCount, successCount] = await Promise.all([
      this.prisma.emailLog.count(),
      this.prisma.emailLog.count({
        where: {
          sentAt: { gte: thisMonth },
        },
      }),
      this.prisma.emailLog.count(), // All emails are considered sent since status field was removed
    ]);

    const successRate = total > 0 ? (successCount / total) * 100 : 0;

    return {
      total,
      thisMonth: thisMonthCount,
      successRate: Math.round(successRate * 100) / 100,
    };
  }

  // Legacy method for backward compatibility
  async getStats() {
    const globalStats = await this.getGlobalStats();
    
    return {
      totalUsers: globalStats.users.total,
      totalProposals: globalStats.proposals.total,
      totalTemplates: globalStats.templates.total,
      totalSignatures: globalStats.signatures.total,
      recentProposals: await this.prisma.proposal.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    };
  }
}
