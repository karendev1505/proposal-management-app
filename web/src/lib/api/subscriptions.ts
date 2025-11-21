import api from '@/lib/api';

export interface Plan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: PlanFeatures;
  isActive: boolean;
  sortOrder: number;
}

export interface PlanFeatures {
  proposals: number;
  templates: number;
  storage: number;
  emailsPerMonth: number;
  signatures: boolean;
  analytics: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  teamMembers: number;
  [key: string]: any;
}

export interface Subscription {
  id: string;
  status: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'PAST_DUE' | 'TRIALING';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  planId: string;
  plan: Plan;
}

export interface UserUsage {
  proposals: number;
  templates: number;
  storage: number;
  emailsThisMonth: number;
}

export interface SubscriptionStats {
  subscription: {
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
  };
  usage: UserUsage;
  limits: PlanFeatures;
  percentageUsed: {
    proposals: number;
    templates: number;
    storage: number;
    emails: number;
  };
}

class SubscriptionsAPI {
  private async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      data?: any;
    } = {}
  ): Promise<T> {
    const { method = 'GET', data } = options;
    
    try {
      const response = await api.request<T>({
        url: endpoint,
        method,
        data,
      });
      return response.data;
    } catch (error: any) {
      console.error('Subscriptions API error:', {
        status: error.response?.status,
        endpoint,
        message: error.message,
      });
      throw error;
    }
  }

  // Plans
  async getPlans(): Promise<Plan[]> {
    return this.request<Plan[]>('/plans');
  }

  async getPlan(id: string): Promise<Plan> {
    return this.request<Plan>(`/plans/${id}`);
  }

  // User subscription
  async getMySubscription(): Promise<Subscription> {
    return this.request<Subscription>('/subscriptions/my');
  }

  async getMySubscriptionStats(): Promise<SubscriptionStats> {
    return this.request<SubscriptionStats>('/subscriptions/my/stats');
  }

  async getMyUsage(): Promise<UserUsage> {
    return this.request<UserUsage>('/subscriptions/my/usage');
  }

  async checkMyLimits(): Promise<{
    withinLimits: boolean;
    limits: PlanFeatures;
    usage: UserUsage;
    violations: string[];
  }> {
    return this.request('/subscriptions/my/limits');
  }

  // Subscription management
  async createSubscription(planId: string): Promise<Subscription> {
    return this.request<Subscription>('/subscriptions', {
      method: 'POST',
      data: { planId },
    });
  }

  async upgradeSubscription(planId: string): Promise<Subscription> {
    return this.request<Subscription>('/subscriptions/upgrade', {
      method: 'PUT',
      data: { planId },
    });
  }

  async cancelSubscription(immediate = false): Promise<Subscription> {
    return this.request<Subscription>('/subscriptions/cancel', {
      method: 'PUT',
      data: { immediate },
    });
  }
}

export const subscriptionsAPI = new SubscriptionsAPI();
