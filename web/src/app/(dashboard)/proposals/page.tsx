'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { getProposals } from '@/lib/mock-data';
import { ProposalStatus } from '@/types/proposal';

const statusVariants = {
  [ProposalStatus.DRAFT]: 'secondary',
  [ProposalStatus.SENT]: 'default',
  [ProposalStatus.VIEWED]: 'warning',
  [ProposalStatus.SIGNED]: 'success',
  [ProposalStatus.REJECTED]: 'destructive',
  [ProposalStatus.EXPIRED]: 'destructive',
} as const;

export default function ProposalsPage() {
  const [filters, setFilters] = useState({
    status: '' as ProposalStatus | '',
    search: '',
    page: 1,
    limit: 10,
  });

  const proposalsData = useMemo(() => {
    return getProposals({
      status: filters.status || undefined,
      search: filters.search || undefined,
      page: filters.page,
      limit: filters.limit,
    });
  }, [filters]);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (typeof value === 'number' ? value : 1), // Reset to page 1 when changing filters
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Proposals</h1>
        <Link href="/proposals/new">
          <Button>Create Proposal</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Search proposals..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value={ProposalStatus.DRAFT}>Draft</option>
                <option value={ProposalStatus.SENT}>Sent</option>
                <option value={ProposalStatus.VIEWED}>Viewed</option>
                <option value={ProposalStatus.SIGNED}>Signed</option>
                <option value={ProposalStatus.REJECTED}>Rejected</option>
                <option value={ProposalStatus.EXPIRED}>Expired</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposals List */}
      <div className="space-y-4">
        {proposalsData.proposals.map((proposal) => (
          <Card key={proposal.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      <Link 
                        href={`/proposals/view/${proposal.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {proposal.title}
                      </Link>
                    </h3>
                    <Badge variant={statusVariants[proposal.status]}>
                      {proposal.status}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    {proposal.clientName && (
                      <p><span className="font-medium">Client:</span> {proposal.clientName}</p>
                    )}
                    {proposal.clientEmail && (
                      <p><span className="font-medium">Email:</span> {proposal.clientEmail}</p>
                    )}
                    <p><span className="font-medium">Created:</span> {formatDate(proposal.createdAt)}</p>
                    {proposal.sentAt && (
                      <p><span className="font-medium">Sent:</span> {formatDate(proposal.sentAt)}</p>
                    )}
                    {proposal.signedAt && (
                      <p><span className="font-medium">Signed:</span> {formatDate(proposal.signedAt)}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Link href={`/proposals/view/${proposal.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                  <Link href={`/proposals/edit/${proposal.id}`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  {proposal.publicToken && (
                    <Link href={`/proposal/${proposal.publicToken}`} target="_blank">
                      <Button variant="outline" size="sm">Public Link</Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {proposalsData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((filters.page - 1) * filters.limit) + 1} to{' '}
            {Math.min(filters.page * filters.limit, proposalsData.total)} of{' '}
            {proposalsData.total} proposals
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page === 1}
              onClick={() => handleFilterChange('page', filters.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={filters.page === proposalsData.totalPages}
              onClick={() => handleFilterChange('page', filters.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {proposalsData.proposals.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No proposals found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.status 
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first proposal.'
              }
            </p>
            <Link href="/proposals/new">
              <Button>Create Proposal</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
