'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getEmailById } from '@/lib/mock-data';
import { Email, EmailStatus, EmailType } from '@/types/email';

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

export default function ViewEmailPage() {
  const params = useParams();
  const [email, setEmail] = useState<Email | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const foundEmail = getEmailById(params.id as string);
      setEmail(foundEmail || null);
      setIsLoading(false);
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const getStatusTimeline = () => {
    if (!email) return [];

    const timeline = [
      {
        status: 'Created',
        date: email.createdAt,
        icon: '📝',
        completed: true,
      },
    ];

    if (email.sentAt) {
      timeline.push({
        status: 'Sent',
        date: email.sentAt,
        icon: '📤',
        completed: true,
      });
    }

    if (email.deliveredAt) {
      timeline.push({
        status: 'Delivered',
        date: email.deliveredAt,
        icon: '✅',
        completed: true,
      });
    }

    if (email.openedAt) {
      timeline.push({
        status: 'Opened',
        date: email.openedAt,
        icon: '📖',
        completed: true,
      });
    }

    if (email.status === EmailStatus.FAILED) {
      timeline.push({
        status: 'Failed',
        date: email.updatedAt,
        icon: '❌',
        completed: true,
      });
    }

    return timeline;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading email...</p>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Email Not Found</h2>
          <p className="text-gray-600 mb-4">The email you're looking for doesn't exist.</p>
          <Link href="/emails">
            <Button>Back to Emails</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-2xl">{getStatusIcon(email.status)}</span>
            {email.subject}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant={statusVariants[email.status]}>
              {email.status}
            </Badge>
            <Badge variant="outline">
              {typeLabels[email.type]}
            </Badge>
            <span className="text-sm text-gray-600">
              Created {formatDate(email.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {email.status === EmailStatus.FAILED && (
            <Button variant="outline">Retry Send</Button>
          )}
          {email.proposalId && (
            <Link href={`/proposals/view/${email.proposalId}`}>
              <Button variant="outline">View Proposal</Button>
            </Link>
          )}
          <Link href="/emails">
            <Button variant="outline">Back to Emails</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Email Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Email Headers */}
                <div className="border-b pb-4">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="font-medium">From:</span> {email.senderName} &lt;{email.senderEmail}&gt;
                    </div>
                    <div>
                      <span className="font-medium">To:</span> {email.recipientName} &lt;{email.recipientEmail}&gt;
                    </div>
                    <div>
                      <span className="font-medium">Subject:</span> {email.subject}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {formatDate(email.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <div className="prose max-w-none">
                  {email.htmlContent ? (
                    <div dangerouslySetInnerHTML={{ __html: email.htmlContent }} />
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {email.content}
                    </pre>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Info Sidebar */}
        <div className="space-y-6">
          {/* Email Details */}
          <Card>
            <CardHeader>
              <CardTitle>Email Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg">{getStatusIcon(email.status)}</span>
                  <Badge variant={statusVariants[email.status]}>
                    {email.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Type:</span>
                <p className="text-sm">{typeLabels[email.type]}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Recipient:</span>
                <p className="text-sm">{email.recipientName || email.recipientEmail}</p>
                {email.recipientName && (
                  <p className="text-xs text-gray-500">{email.recipientEmail}</p>
                )}
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Created:</span>
                <p className="text-sm">{formatDate(email.createdAt)}</p>
              </div>
              
              {email.sentAt && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Sent:</span>
                  <p className="text-sm">{formatDate(email.sentAt)}</p>
                </div>
              )}
              
              {email.deliveredAt && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Delivered:</span>
                  <p className="text-sm">{formatDate(email.deliveredAt)}</p>
                </div>
              )}
              
              {email.openedAt && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Opened:</span>
                  <p className="text-sm">{formatDate(email.openedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Email Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getStatusTimeline().map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-sm">{item.icon}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.status}</p>
                      <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {email.status === EmailStatus.FAILED && (
                <Button className="w-full">Retry Send</Button>
              )}
              {email.proposalId && (
                <Link href={`/proposals/view/${email.proposalId}`}>
                  <Button variant="outline" className="w-full">View Related Proposal</Button>
                </Link>
              )}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(email.content);
                  alert('Email content copied to clipboard!');
                }}
              >
                Copy Content
              </Button>
              <Link href={`/emails/compose?replyTo=${email.id}`}>
                <Button variant="outline" className="w-full">Reply</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
