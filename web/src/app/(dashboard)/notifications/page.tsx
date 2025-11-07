'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { getNotifications, getNotificationStats, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/mock-data';
import { NotificationType, NotificationCategory } from '@/types/notification';

const typeVariants = {
  [NotificationType.INFO]: 'default',
  [NotificationType.SUCCESS]: 'success',
  [NotificationType.WARNING]: 'warning',
  [NotificationType.ERROR]: 'destructive',
} as const;

const categoryLabels = {
  [NotificationCategory.PROPOSAL]: 'Proposal',
  [NotificationCategory.EMAIL]: 'Email',
  [NotificationCategory.SYSTEM]: 'System',
  [NotificationCategory.REMINDER]: 'Reminder',
};

const typeIcons = {
  [NotificationType.INFO]: 'ℹ️',
  [NotificationType.SUCCESS]: '✅',
  [NotificationType.WARNING]: '⚠️',
  [NotificationType.ERROR]: '❌',
};

export default function NotificationsPage() {
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    read: '',
    page: 1,
    limit: 10,
  });

  const notificationData = useMemo(() => getNotifications(filters), [filters]);
  const stats = useMemo(() => getNotificationStats(), []);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (typeof value === 'number' ? value : 1),
    }));
  };

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    // Force re-render by updating filters
    setFilters(prev => ({ ...prev }));
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
    // Force re-render by updating filters
    setFilters(prev => ({ ...prev }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return formatDate(dateString);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-gray-600">Stay updated with important events and activities</p>
        </div>
        <div className="flex gap-2">
          {stats.unread > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              Mark All as Read ({stats.unread})
            </Button>
          )}
        </div>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-gray-600">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
            <p className="text-sm text-gray-600">Unread</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.byType[NotificationType.SUCCESS]}</div>
            <p className="text-sm text-gray-600">Success</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.byType[NotificationType.ERROR]}</div>
            <p className="text-sm text-gray-600">Errors</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value={NotificationType.INFO}>Info</option>
                <option value={NotificationType.SUCCESS}>Success</option>
                <option value={NotificationType.WARNING}>Warning</option>
                <option value={NotificationType.ERROR}>Error</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value={NotificationCategory.PROPOSAL}>Proposal</option>
                <option value={NotificationCategory.EMAIL}>Email</option>
                <option value={NotificationCategory.SYSTEM}>System</option>
                <option value={NotificationCategory.REMINDER}>Reminder</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select
                value={filters.read}
                onChange={(e) => handleFilterChange('read', e.target.value)}
              >
                <option value="">All</option>
                <option value="false">Unread</option>
                <option value="true">Read</option>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ type: '', category: '', read: '', page: 1, limit: 10 })}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Notifications ({notificationData.total})
            {notificationData.unreadCount > 0 && (
              <Badge variant="default" className="ml-2">
                {notificationData.unreadCount} unread
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notificationData.notifications.length > 0 ? (
            <div className="space-y-4">
              {notificationData.notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`border rounded-lg p-4 transition-colors ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        <span className="text-lg">{typeIcons[notification.type]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm">{notification.title}</h3>
                          <Badge variant={typeVariants[notification.type]} className="text-xs">
                            {notification.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {categoryLabels[notification.category]}
                          </Badge>
                          {!notification.read && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{getTimeAgo(notification.createdAt)}</span>
                          {notification.actionUrl && (
                            <Link 
                              href={notification.actionUrl}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {notification.actionText || 'View'}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!notification.read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔔</div>
              <p className="text-gray-500 mb-4">No notifications found</p>
              <p className="text-sm text-gray-400">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {notificationData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((notificationData.page - 1) * notificationData.limit) + 1} to {Math.min(notificationData.page * notificationData.limit, notificationData.total)} of {notificationData.total} notifications
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={notificationData.page === 1}
              onClick={() => handleFilterChange('page', notificationData.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={notificationData.page === notificationData.totalPages}
              onClick={() => handleFilterChange('page', notificationData.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
