'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface SubscriptionData {
  id: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: {
    name: string;
    displayName: string;
    price: number;
    currency: string;
  };
}

interface UsageData {
  proposals: number;
  templates: number;
  storage: number;
  emailsThisMonth: number;
}

interface LimitsData {
  proposals: number;
  templates: number;
  storage: number;
  emailsPerMonth: number;
}

interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  createdAt: string;
  plan?: {
    displayName: string;
  };
}

const mockSubscription: SubscriptionData = {
  id: 'sub_123',
  status: 'active',
  currentPeriodEnd: '2024-12-11T00:00:00Z',
  cancelAtPeriodEnd: false,
  plan: {
    name: 'pro',
    displayName: 'Pro',
    price: 29.99,
    currency: 'USD',
  },
};

const mockUsage: UsageData = {
  proposals: 23,
  templates: 12,
  storage: 1250,
  emailsThisMonth: 156,
};

const mockLimits: LimitsData = {
  proposals: 100,
  templates: 50,
  storage: 5000,
  emailsPerMonth: 1000,
};

const mockPaymentHistory: PaymentHistory[] = [
  {
    id: 'pi_1',
    amount: 29.99,
    currency: 'USD',
    status: 'succeeded',
    description: 'Pro Plan - Monthly',
    createdAt: '2024-11-11T00:00:00Z',
    plan: { displayName: 'Pro' },
  },
  {
    id: 'pi_2',
    amount: 29.99,
    currency: 'USD',
    status: 'succeeded',
    description: 'Pro Plan - Monthly',
    createdAt: '2024-10-11T00:00:00Z',
    plan: { displayName: 'Pro' },
  },
  {
    id: 'pi_3',
    amount: 0,
    currency: 'USD',
    status: 'succeeded',
    description: 'Free Plan',
    createdAt: '2024-09-11T00:00:00Z',
    plan: { displayName: 'Free' },
  },
];

export default function BillingPage() {
  const [subscription, setSubscription] = useState<SubscriptionData>(mockSubscription);
  const [usage, setUsage] = useState<UsageData>(mockUsage);
  const [limits, setLimits] = useState<LimitsData>(mockLimits);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>(mockPaymentHistory);
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.round((used / limit) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubscription(prev => ({
        ...prev,
        cancelAtPeriodEnd: true,
      }));
      
      setShowCancelModal(false);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubscription(prev => ({
        ...prev,
        cancelAtPeriodEnd: false,
      }));
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Billing & Subscription
        </h1>
        <p className="text-gray-600">
          Manage your subscription, view usage, and payment history.
        </p>
      </div>

      {/* Current Subscription */}
      <Card className="p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Current Plan</h2>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">
                {subscription.plan.displayName}
              </span>
              <Badge className={getStatusColor(subscription.status)}>
                {subscription.status}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              ${subscription.plan.price}
              <span className="text-sm font-normal text-gray-600">/month</span>
            </div>
            {subscription.cancelAtPeriodEnd && (
              <p className="text-sm text-red-600 mt-1">
                Cancels on {formatDate(subscription.currentPeriodEnd)}
              </p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Next billing date</p>
            <p className="font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Billing cycle</p>
            <p className="font-medium">Monthly</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.location.href = '/pricing'}>
            Change Plan
          </Button>
          
          {subscription.cancelAtPeriodEnd ? (
            <Button 
              variant="default" 
              onClick={handleReactivateSubscription}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Reactivate Subscription'}
            </Button>
          ) : (
            <Button 
              variant="destructive" 
              onClick={() => setShowCancelModal(true)}
              disabled={loading}
            >
              Cancel Subscription
            </Button>
          )}
        </div>
      </Card>

      {/* Usage Statistics */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">Usage This Month</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Proposals</span>
              <span className="text-sm font-medium">
                {usage.proposals} / {limits.proposals === -1 ? '∞' : limits.proposals}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${getUsagePercentage(usage.proposals, limits.proposals)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Templates</span>
              <span className="text-sm font-medium">
                {usage.templates} / {limits.templates === -1 ? '∞' : limits.templates}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${getUsagePercentage(usage.templates, limits.templates)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Storage</span>
              <span className="text-sm font-medium">
                {usage.storage} MB / {limits.storage === -1 ? '∞' : `${limits.storage} MB`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${getUsagePercentage(usage.storage, limits.storage)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Emails</span>
              <span className="text-sm font-medium">
                {usage.emailsThisMonth} / {limits.emailsPerMonth === -1 ? '∞' : limits.emailsPerMonth}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full" 
                style={{ width: `${getUsagePercentage(usage.emailsThisMonth, limits.emailsPerMonth)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment History */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Payment History</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment) => (
                <tr key={payment.id} className="border-b">
                  <td className="py-3 px-4">
                    {formatDate(payment.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    {payment.description}
                  </td>
                  <td className="py-3 px-4">
                    ${payment.amount.toFixed(2)} {payment.currency}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Cancel Subscription</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your subscription? You'll continue to have access 
              until {formatDate(subscription.currentPeriodEnd)}, then your account will be 
              downgraded to the Free plan.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowCancelModal(false)}
                disabled={loading}
              >
                Keep Subscription
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancelSubscription}
                disabled={loading}
              >
                {loading ? 'Canceling...' : 'Yes, Cancel'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
