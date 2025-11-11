'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SubscriptionStatsComponent } from '@/components/subscription/SubscriptionStats';
import { subscriptionsAPI } from '@/lib/api/subscriptions';

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleCancelSubscription = async (immediate = false) => {
    if (!confirm(
      immediate 
        ? 'Are you sure you want to cancel your subscription immediately? You will lose access to premium features right away.'
        : 'Are you sure you want to cancel your subscription? You will keep access until the end of your current billing period.'
    )) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await subscriptionsAPI.cancelSubscription(immediate);
      // Refresh the page to show updated subscription status
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Subscription Management
        </h1>
        <p className="text-gray-600">
          Manage your subscription, view usage statistics, and upgrade your plan.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <SubscriptionStatsComponent onUpgrade={handleUpgrade} />
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <Button
                onClick={handleUpgrade}
                className="w-full"
                variant="default"
              >
                View All Plans
              </Button>

              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full"
                variant="outline"
              >
                Back to Dashboard
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-red-700">
              Danger Zone
            </h3>
            
            <div className="space-y-3">
              <div className="text-sm text-gray-600 mb-4">
                Cancel your subscription. You can choose to cancel immediately or at the end of your billing period.
              </div>

              <Button
                onClick={() => handleCancelSubscription(false)}
                className="w-full"
                variant="outline"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Cancel at Period End'}
              </Button>

              <Button
                onClick={() => handleCancelSubscription(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Cancel Immediately'}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
            
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                Have questions about your subscription or need assistance with billing?
              </p>
              
              <div className="space-y-2">
                <Button
                  onClick={() => window.open('mailto:support@yourapp.com', '_blank')}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Contact Support
                </Button>
                
                <Button
                  onClick={() => router.push('/help')}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  View Documentation
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
