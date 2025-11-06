'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { getProposalById } from '@/lib/mock-data';
import { Proposal, ProposalStatus } from '@/types/proposal';

const statusVariants = {
  [ProposalStatus.DRAFT]: 'secondary',
  [ProposalStatus.SENT]: 'default',
  [ProposalStatus.VIEWED]: 'warning',
  [ProposalStatus.SIGNED]: 'success',
  [ProposalStatus.REJECTED]: 'destructive',
  [ProposalStatus.EXPIRED]: 'destructive',
} as const;

export default function ViewProposalPage() {
  const params = useParams();
  const router = useRouter();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendData, setSendData] = useState({
    recipientEmail: '',
    recipientName: '',
    message: '',
  });
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (params.id) {
      const foundProposal = getProposalById(params.id as string);
      if (foundProposal) {
        setProposal(foundProposal);
        setSendData({
          recipientEmail: foundProposal.clientEmail || '',
          recipientName: foundProposal.clientName || '',
          message: '',
        });
      }
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

  const handleSend = async () => {
    setIsSending(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would make an API call here
      console.log('Sending proposal:', { proposalId: proposal?.id, ...sendData });
      
      setShowSendModal(false);
      // Refresh proposal data or update status
    } catch (error) {
      console.error('Error sending proposal:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!proposal) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Proposal Not Found</h2>
          <p className="text-gray-600 mb-4">The proposal you're looking for doesn't exist.</p>
          <Link href="/proposals">
            <Button>Back to Proposals</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{proposal.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant={statusVariants[proposal.status]}>
              {proposal.status}
            </Badge>
            <span className="text-sm text-gray-600">
              Created {formatDate(proposal.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/proposals/edit/${proposal.id}`}>
            <Button variant="outline">Edit</Button>
          </Link>
          {proposal.status === ProposalStatus.DRAFT && (
            <Button onClick={() => setShowSendModal(true)}>
              Send Proposal
            </Button>
          )}
          {proposal.publicToken && (
            <Link href={`/proposal/${proposal.publicToken}`} target="_blank">
              <Button variant="outline">Public View</Button>
            </Link>
          )}
          <Link href="/proposals">
            <Button variant="outline">Back</Button>
          </Link>
        </div>
      </div>

      {/* Proposal Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {proposal.content}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {proposal.clientName && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Name:</span>
                  <p className="text-sm">{proposal.clientName}</p>
                </div>
              )}
              {proposal.clientEmail && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <p className="text-sm">{proposal.clientEmail}</p>
                </div>
              )}
              {!proposal.clientName && !proposal.clientEmail && (
                <p className="text-sm text-gray-500">No client information provided</p>
              )}
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-xs text-gray-600">{formatDate(proposal.createdAt)}</p>
                </div>
              </div>
              
              {proposal.sentAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Sent</p>
                    <p className="text-xs text-gray-600">{formatDate(proposal.sentAt)}</p>
                  </div>
                </div>
              )}
              
              {proposal.viewedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Viewed</p>
                    <p className="text-xs text-gray-600">{formatDate(proposal.viewedAt)}</p>
                  </div>
                </div>
              )}
              
              {proposal.signedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Signed</p>
                    <p className="text-xs text-gray-600">{formatDate(proposal.signedAt)}</p>
                    {proposal.signature && (
                      <p className="text-xs text-gray-500">Signature: {proposal.signature}</p>
                    )}
                  </div>
                </div>
              )}
              
              {proposal.expiresAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Expires</p>
                    <p className="text-xs text-gray-600">{formatDate(proposal.expiresAt)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Send Proposal Modal */}
      <Modal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        title="Send Proposal"
        className="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="recipientEmail" className="block text-sm font-medium mb-2">
              Recipient Email *
            </label>
            <Input
              id="recipientEmail"
              type="email"
              value={sendData.recipientEmail}
              onChange={(e) => setSendData(prev => ({ ...prev, recipientEmail: e.target.value }))}
              placeholder="Enter recipient email"
              required
            />
          </div>

          <div>
            <label htmlFor="recipientName" className="block text-sm font-medium mb-2">
              Recipient Name
            </label>
            <Input
              id="recipientName"
              type="text"
              value={sendData.recipientName}
              onChange={(e) => setSendData(prev => ({ ...prev, recipientName: e.target.value }))}
              placeholder="Enter recipient name"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Message (Optional)
            </label>
            <textarea
              id="message"
              value={sendData.message}
              onChange={(e) => setSendData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Add a personal message..."
              rows={3}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSend}
              disabled={!sendData.recipientEmail || isSending}
              className="flex-1"
            >
              {isSending ? 'Sending...' : 'Send Proposal'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSendModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
