const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
    options: RequestInit = {}
  ): Promise<T> {
    // Import Cookies here to avoid SSR issues
    const Cookies = (await import('js-cookie')).default;
    const token = Cookies.get('accessToken');
    
    console.log('Subscriptions API request:', {
      endpoint,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    });
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      console.error('Subscriptions API error:', {
        status: response.status,
        endpoint,
        hasToken: !!token
      });
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
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
      body: JSON.stringify({ planId }),
    });
  }

  async upgradeSubscription(planId: string): Promise<Subscription> {
    return this.request<Subscription>('/subscriptions/upgrade', {
      method: 'PUT',
      body: JSON.stringify({ planId }),
    });
  }

  async cancelSubscription(immediate = false): Promise<Subscription> {
    return this.request<Subscription>('/subscriptions/cancel', {
      method: 'PUT',
      body: JSON.stringify({ immediate }),
    });
  }
}

export const subscriptionsAPI = new SubscriptionsAPI();
