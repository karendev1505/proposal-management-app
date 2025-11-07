'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getNotifications, markNotificationAsRead } from '@/lib/mock-data';
import { NotificationType, NotificationCategory } from '@/types/notification';

const typeIcons = {
  [NotificationType.INFO]: 'ℹ️',
  [NotificationType.SUCCESS]: '✅',
  [NotificationType.WARNING]: '⚠️',
  [NotificationType.ERROR]: '❌',
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => getNotifications({ limit: 5 }));
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    setNotifications(getNotifications({ limit: 5 }));
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
    return `${diffInDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        🔔
        {notifications.unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {notifications.unreadCount > 9 ? '9+' : notifications.unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              {notifications.unreadCount > 0 && (
                <Badge variant="default" className="text-xs">
                  {notifications.unreadCount} new
                </Badge>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <span className="text-sm">{typeIcons[notification.type]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">{notification.title}</p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(notification.createdAt)}
                          </span>
                          <div className="flex items-center gap-2">
                            {notification.actionUrl && (
                              <Link
                                href={notification.actionUrl}
                                className="text-xs text-blue-600 hover:text-blue-800"
                                onClick={() => setIsOpen(false)}
                              >
                                {notification.actionText || 'View'}
                              </Link>
                            )}
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-xs text-gray-500 hover:text-gray-700"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-2xl mb-2">🔔</div>
                <p className="text-sm text-gray-500">No notifications</p>
              </div>
            )}
          </div>

          {notifications.notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <Link
                href="/notifications"
                className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => setIsOpen(false)}
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
