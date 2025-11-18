'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { subscriptionsAPI, Plan, PlanFeatures, Subscription } from '@/lib/api/subscriptions';
import { useToast } from '@/hooks/useToast';


export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [plansData, subscriptionData] = await Promise.all([
        subscriptionsAPI.getPlans(),
        subscriptionsAPI.getMySubscription().catch(() => null), // User might not have subscription yet
      ]);
      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const formatFeatureValue = (value: number | boolean, type: string) => {
    if (typeof value === 'boolean') {
      return value ? '✓' : '✗';
    }
    if (value === -1) {
      return 'Unlimited';
    }
    if (type === 'storage') {
      return `${value} MB`;
    }
    return value.toString();
  };

  const handleUpgrade = async (planId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Upgrading to plan:', planId);
      const selectedPlan = plans.find(p => p.id === planId);
      
      if (currentSubscription) {
        console.log('Upgrading existing subscription');
        await subscriptionsAPI.upgradeSubscription(planId);
        addToast({
          type: 'success',
          title: 'Plan Upgraded!',
          message: `You have successfully upgraded to ${selectedPlan?.displayName || 'the new plan'}.`,
        });
      } else {
        console.log('Creating new subscription');
        await subscriptionsAPI.createSubscription(planId);
        addToast({
          type: 'success',
          title: 'Subscription Created!',
          message: `You have successfully subscribed to ${selectedPlan?.displayName || 'the plan'}.`,
        });
      }
      
      await loadData(); // Reload data to show updated subscription
    } catch (error: any) {
      console.error('Upgrade error:', error);
      const errorMessage = error?.message || 'Failed to upgrade plan. Please try again.';
      setError(errorMessage);
      addToast({
        type: 'error',
        title: 'Upgrade Failed',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = (plan: Plan) => {
    if (currentSubscription && plan.id === currentSubscription.planId) {
      return 'Current Plan';
    }
    if (plan.price === 0) {
      return 'Get Started';
    }
    return 'Upgrade Now';
  };

  const getButtonVariant = (plan: Plan) => {
    if (currentSubscription && plan.id === currentSubscription.planId) {
      return 'secondary';
    }
    if (plan.name === 'pro') {
      return 'default';
    }
    return 'outline';
  };

  if (loading && plans.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-red-800 font-medium mb-2">Error Loading Plans</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadData} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your proposal management needs. 
          Upgrade or downgrade at any time.
        </p>
        {currentSubscription && (
          <div className="mt-4">
            <Badge className="bg-green-100 text-green-800">
              Current: {currentSubscription.plan.displayName}
            </Badge>
          </div>
        )}
        {error && (
          <div className="mt-4 max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative p-8 ${
              plan.name === 'pro' 
                ? 'border-blue-500 border-2 shadow-lg scale-105' 
                : 'border-gray-200'
            }`}
          >
            {plan.name === 'pro' && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                Most Popular
              </Badge>
            )}
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.displayName}
              </h3>
              <p className="text-gray-600 mb-4">
                {plan.description}
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${plan.price}
                </span>
                <span className="text-gray-600">/{plan.interval}</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between">
                <span className="text-gray-600">Proposals</span>
                <span className="font-medium">
                  {formatFeatureValue(plan.features.proposals, 'proposals')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Templates</span>
                <span className="font-medium">
                  {formatFeatureValue(plan.features.templates, 'templates')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Storage</span>
                <span className="font-medium">
                  {formatFeatureValue(plan.features.storage, 'storage')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Emails/month</span>
                <span className="font-medium">
                  {formatFeatureValue(plan.features.emailsPerMonth, 'emails')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Digital Signatures</span>
                <span className="font-medium">
                  {formatFeatureValue(plan.features.signatures, 'boolean')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Analytics</span>
                <span className="font-medium">
                  {formatFeatureValue(plan.features.analytics, 'boolean')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Custom Branding</span>
                <span className="font-medium">
                  {formatFeatureValue(plan.features.customBranding, 'boolean')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API Access</span>
                <span className="font-medium">
                  {formatFeatureValue(plan.features.apiAccess, 'boolean')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Priority Support</span>
                <span className="font-medium">
                  {formatFeatureValue(plan.features.prioritySupport, 'boolean')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Team Members</span>
                <span className="font-medium">
                  {formatFeatureValue(plan.features.teamMembers, 'members')}
                </span>
              </div>

              {plan.features.advancedTemplates && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Advanced Templates</span>
                  <span className="font-medium">✓</span>
                </div>
              )}

              {plan.features.automatedReminders && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Automated Reminders</span>
                  <span className="font-medium">✓</span>
                </div>
              )}

              {plan.features.whiteLabel && (
                <div className="flex justify-between">
                  <span className="text-gray-600">White Label</span>
                  <span className="font-medium">✓</span>
                </div>
              )}

              {plan.features.sso && (
                <div className="flex justify-between">
                  <span className="text-gray-600">SSO Integration</span>
                  <span className="font-medium">✓</span>
                </div>
              )}

              {plan.features.dedicatedManager && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Dedicated Manager</span>
                  <span className="font-medium">✓</span>
                </div>
              )}
            </div>

            <Button
              variant={getButtonVariant(plan)}
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Button clicked for plan:', plan.id);
                handleUpgrade(plan.id);
              }}
              disabled={loading || (currentSubscription && plan.id === currentSubscription.planId)}
            >
              {loading ? 'Processing...' : getButtonText(plan)}
            </Button>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">
          Need a custom solution? Contact our sales team.
        </p>
        <Button variant="outline">
          Contact Sales
        </Button>
      </div>

      <div className="max-w-4xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
            <p className="text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. 
              Changes take effect immediately.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">What happens to my data?</h3>
            <p className="text-gray-600">
              Your data is always safe. When downgrading, you'll keep access 
              to all existing proposals and templates.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Is there a free trial?</h3>
            <p className="text-gray-600">
              The Free plan is available forever. You can also try Pro features 
              with a 14-day free trial.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">How does billing work?</h3>
            <p className="text-gray-600">
              We bill monthly or annually. You can cancel anytime and 
              we'll prorate any unused time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
