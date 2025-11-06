'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getProposalStats } from '@/lib/mock-data';

export default function ProposalStats() {
  const stats = useMemo(() => getProposalStats(), []);

  const statCards = [
    {
      title: 'Total Proposals',
      value: stats.total,
      variant: 'default' as const,
    },
    {
      title: 'Draft',
      value: stats.draft,
      variant: 'secondary' as const,
    },
    {
      title: 'Sent',
      value: stats.sent,
      variant: 'default' as const,
    },
    {
      title: 'Viewed',
      value: stats.viewed,
      variant: 'warning' as const,
    },
    {
      title: 'Signed',
      value: stats.signed,
      variant: 'success' as const,
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      variant: 'destructive' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-green-600">{stats.conversionRate}%</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="success">{stats.signed} Signed</Badge>
              <Badge variant="destructive">{stats.rejected} Rejected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
