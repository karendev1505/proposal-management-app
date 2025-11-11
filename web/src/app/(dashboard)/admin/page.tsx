'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface AdminStats {
  overview: {
    totalUsers: number;
    totalProposals: number;
    totalTemplates: number;
    totalRevenue: number;
  };
  growth: {
    newUsersThisMonth: number;
    newProposalsThisMonth: number;
    revenueThisMonth: number;
  };
  trends: {
    userGrowthRate: number;
    proposalGrowthRate: number;
    revenueGrowthRate: number;
  };
}

interface RecentUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  proposalsCount: number;
}

interface RecentPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  user: {
    email: string;
    name: string;
  };
  plan: {
    displayName: string;
  };
  createdAt: string;
}

const mockStats: AdminStats = {
  overview: {
    totalUsers: 1247,
    totalProposals: 3892,
    totalTemplates: 156,
    totalRevenue: 45230.50,
  },
  growth: {
    newUsersThisMonth: 89,
    newProposalsThisMonth: 234,
    revenueThisMonth: 3420.00,
  },
  trends: {
    userGrowthRate: 12.5,
    proposalGrowthRate: 18.3,
    revenueGrowthRate: 15.7,
  },
};

const mockRecentUsers: RecentUser[] = [
  {
    id: '1',
    email: 'john@company.com',
    name: 'John Doe',
    role: 'user',
    createdAt: '2024-11-10T10:30:00Z',
    proposalsCount: 3,
  },
  {
    id: '2',
    email: 'sarah@startup.io',
    name: 'Sarah Wilson',
    role: 'user',
    createdAt: '2024-11-10T08:15:00Z',
    proposalsCount: 1,
  },
  {
    id: '3',
    email: 'mike@agency.com',
    name: 'Mike Johnson',
    role: 'user',
    createdAt: '2024-11-09T16:45:00Z',
    proposalsCount: 7,
  },
];

const mockRecentPayments: RecentPayment[] = [
  {
    id: '1',
    amount: 99.99,
    currency: 'USD',
    status: 'succeeded',
    user: { email: 'alice@corp.com', name: 'Alice Brown' },
    plan: { displayName: 'Business' },
    createdAt: '2024-11-11T09:30:00Z',
  },
  {
    id: '2',
    amount: 29.99,
    currency: 'USD',
    status: 'succeeded',
    user: { email: 'bob@startup.com', name: 'Bob Smith' },
    plan: { displayName: 'Pro' },
    createdAt: '2024-11-11T08:15:00Z',
  },
  {
    id: '3',
    amount: 29.99,
    currency: 'USD',
    status: 'failed',
    user: { email: 'carol@company.org', name: 'Carol Davis' },
    plan: { displayName: 'Pro' },
    createdAt: '2024-11-10T22:10:00Z',
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>(mockStats);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>(mockRecentUsers);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>(mockRecentPayments);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (rate: number) => {
    if (rate > 0) {
      return <span className="text-green-600">↗ +{rate}%</span>;
    } else if (rate < 0) {
      return <span className="text-red-600">↘ {rate}%</span>;
    }
    return <span className="text-gray-600">→ {rate}%</span>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Monitor system performance, users, and revenue.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-2xl font-bold">{stats.overview.totalUsers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {getTrendIcon(stats.trends.userGrowthRate)}
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Proposals</p>
              <p className="text-2xl font-bold">{stats.overview.totalProposals.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {getTrendIcon(stats.trends.proposalGrowthRate)}
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">📄</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Templates</p>
              <p className="text-2xl font-bold">{stats.overview.totalTemplates.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <span className="text-gray-600">📋 Active</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">📋</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.overview.totalRevenue)}</p>
              <div className="flex items-center mt-2">
                {getTrendIcon(stats.trends.revenueGrowthRate)}
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 text-xl">💰</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => window.location.href = '/admin/users'}
          >
            👥 Manage Users
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => window.location.href = '/admin/payments'}
          >
            💳 View Payments
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => window.location.href = '/admin/plans'}
          >
            📋 Manage Plans
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => window.location.href = '/admin/system'}
          >
            ⚙️ System Health
          </Button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Users</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/admin/users'}
            >
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {user.proposalsCount} proposals
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Payments */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Payments</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/admin/payments'}
            >
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{payment.user.name}</p>
                  <p className="text-sm text-gray-600">{payment.plan.displayName} Plan</p>
                  <p className="text-xs text-gray-500">{formatDate(payment.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(payment.amount)}</p>
                  <Badge className={getStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Monthly Growth */}
      <Card className="p-6 mt-8">
        <h2 className="text-xl font-semibold mb-6">This Month's Growth</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              +{stats.growth.newUsersThisMonth}
            </div>
            <p className="text-gray-600">New Users</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              +{stats.growth.newProposalsThisMonth}
            </div>
            <p className="text-gray-600">New Proposals</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {formatCurrency(stats.growth.revenueThisMonth)}
            </div>
            <p className="text-gray-600">Revenue</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
