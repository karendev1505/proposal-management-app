'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getProposalStats, mockProposals, mockTemplates } from '@/lib/mock-data';
import { ProposalStatus } from '@/types/proposal';

const statusVariants = {
  [ProposalStatus.DRAFT]: 'secondary',
  [ProposalStatus.SENT]: 'default',
  [ProposalStatus.VIEWED]: 'warning',
  [ProposalStatus.SIGNED]: 'success',
  [ProposalStatus.REJECTED]: 'destructive',
  [ProposalStatus.EXPIRED]: 'destructive',
} as const;

export default function DashboardPage() {
  const { user } = useAuth();
  const stats = useMemo(() => getProposalStats(), []);
  
  const recentProposals = useMemo(() => {
    return mockProposals
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || 'User'}!</p>
        </div>
        <div className="flex gap-2">
          <Link href="/proposals/new">
            <Button>New Proposal</Button>
          </Link>
          <Link href="/templates/new">
            <Button variant="outline">New Template</Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-gray-600">Total Proposals</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.signed}</div>
            <p className="text-sm text-gray-600">Signed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.sent + stats.viewed}</div>
            <p className="text-sm text-gray-600">Active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</div>
            <p className="text-sm text-gray-600">Conversion Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Proposals */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Proposals</CardTitle>
                <CardDescription>Your latest proposal activities</CardDescription>
              </div>
              <Link href="/proposals">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentProposals.length > 0 ? (
                <div className="space-y-4">
                  {recentProposals.map((proposal) => (
                    <div key={proposal.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <Link 
                          href={`/proposals/view/${proposal.id}`}
                          className="font-medium hover:text-blue-600 transition-colors"
                        >
                          {proposal.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={statusVariants[proposal.status]} className="text-xs">
                            {proposal.status}
                          </Badge>
                          {proposal.clientName && (
                            <span className="text-sm text-gray-600">{proposal.clientName}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(proposal.updatedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No proposals yet</p>
                  <Link href="/proposals/new">
                    <Button>Create Your First Proposal</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Templates */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/proposals/new">
                <Button className="w-full">Create Proposal</Button>
              </Link>
              <Link href="/templates/new">
                <Button variant="outline" className="w-full">Create Template</Button>
              </Link>
              <Link href="/proposals?status=DRAFT">
                <Button variant="outline" className="w-full">View Drafts ({stats.draft})</Button>
              </Link>
              <Link href="/proposals?status=SENT">
                <Button variant="outline" className="w-full">View Sent ({stats.sent})</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Templates</CardTitle>
                <CardDescription>{mockTemplates.length} available</CardDescription>
              </div>
              <Link href="/templates">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockTemplates.slice(0, 3).map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">{template.name}</p>
                      {template.category && (
                        <p className="text-xs text-gray-600">{template.category}</p>
                      )}
                    </div>
                    <Link href={`/proposals/new?template=${template.id}`}>
                      <Button variant="outline" size="sm">Use</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
