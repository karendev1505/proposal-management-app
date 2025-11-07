export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export enum NotificationCategory {
  PROPOSAL = 'PROPOSAL',
  EMAIL = 'EMAIL',
  SYSTEM = 'SYSTEM',
  REMINDER = 'REMINDER'
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilters {
  type?: NotificationType;
  category?: NotificationCategory;
  read?: boolean;
  page?: number;
  limit?: number;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byCategory: Record<NotificationCategory, number>;
}