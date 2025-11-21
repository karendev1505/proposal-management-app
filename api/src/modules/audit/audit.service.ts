import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export interface AuditLogData {
  userId?: string;
  workspaceId: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async logAction(data: AuditLogData) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          workspaceId: data.workspaceId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          metadata: data.metadata || {},
        },
      });
    } catch (error) {
      // Log error but don't throw - audit logging should not break the main flow
      this.logger.error('Failed to log audit action', {
        error: error.message,
        action: data.action,
        entity: data.entity,
        workspaceId: data.workspaceId,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }

  async getAuditLogs(
    workspaceId: string,
    filters?: {
      userId?: string;
      action?: string;
      entity?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
  ) {
    const where: {
      workspaceId: string;
      userId?: string;
      action?: string;
      entity?: string;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {
      workspaceId,
    };

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.action) {
      where.action = filters.action;
    }

    if (filters?.entity) {
      where.entity = filters.entity;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      limit: filters?.limit || 50,
      offset: filters?.offset || 0,
    };
  }
}

