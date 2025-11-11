import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async createNotification(dto: CreateNotificationDto) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: dto.userId,
          type: dto.type,
          title: dto.title,
          message: dto.message,
          read: false,
        },
      });

      this.logger.log(`Notification created for user ${dto.userId}: ${dto.title}`);
      return notification;
    } catch (error) {
      this.logger.error('Failed to create notification', error);
      throw error;
    }
  }

  async getUserNotifications(userId: string, options: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  } = {}) {
    const { limit = 20, offset = 0, unreadOnly = false } = options;

    const where: any = { userId };
    if (unreadOnly) {
      where.read = false;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId, // Ensure user can only mark their own notifications
      },
      data: {
        read: true,
        updatedAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        updatedAt: new Date(),
      },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId, // Ensure user can only delete their own notifications
      },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  // Convenience methods for common notification types
  async notifyProposalCreated(userId: string, proposalTitle: string, proposalId: string) {
    return this.createNotification({
      userId,
      type: NotificationType.SUCCESS,
      title: 'Proposal Created',
      message: `Your proposal "${proposalTitle}" has been created successfully.`,
    });
  }

  async notifyProposalSent(userId: string, proposalTitle: string, proposalId: string, recipientEmail: string) {
    return this.createNotification({
      userId,
      type: NotificationType.INFO,
      title: 'Proposal Sent',
      message: `Your proposal "${proposalTitle}" has been sent to ${recipientEmail}.`,
    });
  }

  async notifyProposalViewed(userId: string, proposalTitle: string, proposalId: string) {
    return this.createNotification({
      userId,
      type: NotificationType.INFO,
      title: 'Proposal Viewed',
      message: `Your proposal "${proposalTitle}" has been viewed by the recipient.`,
    });
  }

  async notifyProposalSigned(userId: string, proposalTitle: string, proposalId: string, signerName: string) {
    return this.createNotification({
      userId,
      type: NotificationType.SUCCESS,
      title: 'Proposal Signed',
      message: `Your proposal "${proposalTitle}" has been signed by ${signerName}.`,
    });
  }

  async notifyEmailSent(userId: string, emailSubject: string, recipient: string) {
    return this.createNotification({
      userId,
      type: NotificationType.INFO,
      title: 'Email Sent',
      message: `Email "${emailSubject}" has been sent to ${recipient}.`,
    });
  }

  async notifySystemEvent(userId: string, title: string, message: string) {
    return this.createNotification({
      userId,
      type: NotificationType.INFO,
      title,
      message,
    });
  }

  // Legacy methods for backward compatibility
  async findAll() {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return this.prisma.notification.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.notification.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }
}