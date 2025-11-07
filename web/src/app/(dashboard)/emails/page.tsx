'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { getEmails, getEmailStats } from '@/lib/mock-data';
import { EmailStatus, EmailType } from '@/types/email';

const statusVariants = {
  [EmailStatus.DRAFT]: 'secondary',
  [EmailStatus.SENT]: 'default',
  [EmailStatus.DELIVERED]: 'success',
  [EmailStatus.OPENED]: 'success',
  [EmailStatus.FAILED]: 'destructive',
} as const;

const typeLabels = {
  [EmailType.PROPOSAL]: 'Proposal',
  [EmailType.REMINDER]: 'Reminder',
  [EmailType.NOTIFICATION]: 'Notification',
  [EmailType.CUSTOM]: 'Custom',
};

export default function EmailsPage() {
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: '',
    page: 1,
    limit: 10,
  });

  const emailData = useMemo(() => getEmails(filters), [filters]);
  const stats = useMemo(() => getEmailStats(), []);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (typeof value === 'number' ? value : 1),
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: EmailStatus) => {
    switch (status) {
      case EmailStatus.OPENED:
        return '📖';
      case EmailStatus.DELIVERED:
        return '✅';
      case EmailStatus.SENT:
        return '📤';
      case EmailStatus.FAILED:
        return '❌';
      default:
        return '📝';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Management</h1>
          <p className="text-gray-600">Manage and track your email communications</p>
        </div>
        <Link href="/emails/compose">
          <Button>Compose Email</Button>
        </Link>
      </div>

      {/* Email Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-gray-600">Total Emails</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
            <p className="text-sm text-gray-600">Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <p className="text-sm text-gray-600">Delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.opened}</div>
            <p className="text-sm text-gray-600">Opened</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.openRate}%</div>
            <p className="text-sm text-gray-600">Open Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <Input
                placeholder="Search emails..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value={EmailStatus.DRAFT}>Draft</option>
                <option value={EmailStatus.SENT}>Sent</option>
                <option value={EmailStatus.DELIVERED}>Delivered</option>
                <option value={EmailStatus.OPENED}>Opened</option>
                <option value={EmailStatus.FAILED}>Failed</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value={EmailType.PROPOSAL}>Proposal</option>
                <option value={EmailType.REMINDER}>Reminder</option>
                <option value={EmailType.NOTIFICATION}>Notification</option>
                <option value={EmailType.CUSTOM}>Custom</option>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ status: '', type: '', search: '', page: 1, limit: 10 })}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Emails ({emailData.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emailData.emails.length > 0 ? (
            <div className="space-y-4">
              {emailData.emails.map((email) => (
                <div key={email.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg">{getStatusIcon(email.status)}</span>
                        <Link 
                          href={`/emails/view/${email.id}`}
                          className="font-semibold hover:text-blue-600 transition-colors"
                        >
                          {email.subject}
                        </Link>
                        <Badge variant={statusVariants[email.status]} className="text-xs">
                          {email.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {typeLabels[email.type]}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        To: <span className="font-medium">{email.recipientName || email.recipientEmail}</span>
                        {email.recipientName && (
                          <span className="text-gray-500"> ({email.recipientEmail})</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {email.content}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500 ml-4">
                      <div>{formatDate(email.createdAt)}</div>
                      {email.sentAt && (
                        <div className="text-xs">Sent: {formatDate(email.sentAt)}</div>
                      )}
                      {email.openedAt && (
                        <div className="text-xs text-green-600">Opened: {formatDate(email.openedAt)}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex gap-2">
                      <Link href={`/emails/view/${email.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                      {email.status === EmailStatus.FAILED && (
                        <Button variant="outline" size="sm">Retry</Button>
                      )}
                      {email.proposalId && (
                        <Link href={`/proposals/view/${email.proposalId}`}>
                          <Button variant="outline" size="sm">View Proposal</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No emails found</p>
              <Link href="/emails/compose">
                <Button>Send Your First Email</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {emailData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((emailData.page - 1) * emailData.limit) + 1} to {Math.min(emailData.page * emailData.limit, emailData.total)} of {emailData.total} emails
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={emailData.page === 1}
              onClick={() => handleFilterChange('page', emailData.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={emailData.page === emailData.totalPages}
              onClick={() => handleFilterChange('page', emailData.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
