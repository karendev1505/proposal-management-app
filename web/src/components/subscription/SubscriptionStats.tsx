'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { subscriptionsAPI, SubscriptionStats } from '@/lib/api/subscriptions';

interface SubscriptionStatsProps {
  onUpgrade?: () => void;
}

export function SubscriptionStatsComponent({ onUpgrade }: SubscriptionStatsProps) {
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subscriptionsAPI.getMySubscriptionStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription stats');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      case 'PAST_DUE':
        return 'bg-yellow-100 text-yellow-800';
      case 'TRIALING':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatUsage = (used: number, limit: number, type: string) => {
    if (limit === -1) {
      return `${used} / Unlimited`;
    }
    if (type === 'storage') {
      return `${used} MB / ${limit} MB`;
    }
    return `${used} / ${limit}`;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadStats} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Subscription Overview</h3>
        <Badge className={getStatusColor(stats.subscription.status)}>
          {stats.subscription.status}
        </Badge>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Plan</span>
            <span className="text-sm text-gray-600">
              {stats.subscription.plan.displayName} - ${stats.subscription.plan.price}/{stats.subscription.plan.currency}
            </span>
          </div>
        </div>

        {stats.subscription.currentPeriodEnd && (
          <div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Next billing</span>
              <span className="text-sm text-gray-600">
                {new Date(stats.subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {stats.subscription.cancelAtPeriodEnd && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              Your subscription will be canceled at the end of the current billing period.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Usage Statistics</h4>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Proposals</span>
              <span className="text-sm font-medium">
                {formatUsage(stats.usage.proposals, stats.limits.proposals, 'proposals')}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getUsageColor(stats.percentageUsed.proposals)}`}
                style={{ width: `${Math.min(stats.percentageUsed.proposals, 100)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Templates</span>
              <span className="text-sm font-medium">
                {formatUsage(stats.usage.templates, stats.limits.templates, 'templates')}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getUsageColor(stats.percentageUsed.templates)}`}
                style={{ width: `${Math.min(stats.percentageUsed.templates, 100)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Storage</span>
              <span className="text-sm font-medium">
                {formatUsage(stats.usage.storage, stats.limits.storage, 'storage')}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getUsageColor(stats.percentageUsed.storage)}`}
                style={{ width: `${Math.min(stats.percentageUsed.storage, 100)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">Emails this month</span>
              <span className="text-sm font-medium">
                {formatUsage(stats.usage.emailsThisMonth, stats.limits.emailsPerMonth, 'emails')}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getUsageColor(stats.percentageUsed.emails)}`}
                style={{ width: `${Math.min(stats.percentageUsed.emails, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {onUpgrade && (
        <div className="mt-6 pt-4 border-t">
          <Button onClick={onUpgrade} className="w-full">
            Upgrade Plan
          </Button>
        </div>
      )}
    </Card>
  );
}
