import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      totalProposals,
      totalTemplates,
      totalSignatures,
      recentProposals,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.proposal.count(),
      this.prisma.template.count(),
      this.prisma.signature.count(),
      this.prisma.proposal.findMany({
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
    ]);

    return {
      totalUsers,
      totalProposals,
      totalTemplates,
      totalSignatures,
      recentProposals,
    };
  }
}
