'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { getProposalByToken } from '@/lib/mock-data';
import { Proposal, ProposalStatus } from '@/types/proposal';

const statusVariants = {
  [ProposalStatus.DRAFT]: 'secondary',
  [ProposalStatus.SENT]: 'default',
  [ProposalStatus.VIEWED]: 'warning',
  [ProposalStatus.SIGNED]: 'success',
  [ProposalStatus.REJECTED]: 'destructive',
  [ProposalStatus.EXPIRED]: 'destructive',
} as const;

export default function PublicProposalTokenPage() {
  const params = useParams();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [signature, setSignature] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.token) {
      const foundProposal = getProposalByToken(params.token as string);
      setProposal(foundProposal || null);
      setIsLoading(false);
    }
  }, [params.token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSign = async () => {
    if (!signature.trim() || !proposal) return;

    setIsSigning(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would make an API call here
      console.log('Signing proposal:', { token: params.token, signature });
      
      // Update proposal status locally for demo
      setProposal(prev => prev ? {
        ...prev,
        status: ProposalStatus.SIGNED,
        signature,
        signedAt: new Date().toISOString(),
      } : null);
      
    } catch (error) {
      console.error('Error signing proposal:', error);
    } finally {
      setIsSigning(false);
    }
  };

  const handleReject = async () => {
    if (!proposal) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, you would make an API call here
      console.log('Rejecting proposal:', { token: params.token });
      
      // Update proposal status locally for demo
      setProposal(prev => prev ? {
        ...prev,
        status: ProposalStatus.REJECTED,
      } : null);
      
    } catch (error) {
      console.error('Error rejecting proposal:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Proposal Not Found</h1>
          <p className="text-gray-600 mb-6">
            The proposal you're looking for doesn't exist or may have been removed.
          </p>
          <p className="text-sm text-gray-500">
            Please check the link and try again, or contact the sender for a new link.
          </p>
        </div>
      </div>
    );
  }

  const isExpired = proposal.expiresAt && new Date(proposal.expiresAt) < new Date();
  const canSign = proposal.status === ProposalStatus.SENT || proposal.status === ProposalStatus.VIEWED;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{proposal.title}</h1>
          <div className="flex items-center justify-center gap-3">
            <Badge variant={statusVariants[proposal.status]}>
              {proposal.status}
            </Badge>
            {isExpired && (
              <Badge variant="destructive">Expired</Badge>
            )}
          </div>
          {proposal.expiresAt && !isExpired && (
            <p className="text-sm text-gray-600 mt-2">
              Expires on {formatDate(proposal.expiresAt)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Proposal Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Proposal Details</CardTitle>
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

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Proposal Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
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
                  
                  {proposal.signedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Signed</p>
                        <p className="text-xs text-gray-600">{formatDate(proposal.signedAt)}</p>
                        {proposal.signature && (
                          <p className="text-xs text-gray-500 font-medium">
                            Signed by: {proposal.signature}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Card */}
            {!isExpired && canSign && (
              <Card>
                <CardHeader>
                  <CardTitle>Take Action</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="signature" className="block text-sm font-medium mb-2">
                      Your Full Name (Digital Signature)
                    </label>
                    <Input
                      id="signature"
                      type="text"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      onClick={handleSign}
                      disabled={!signature.trim() || isSigning}
                      className="w-full"
                    >
                      {isSigning ? 'Signing...' : 'Accept & Sign Proposal'}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      className="w-full"
                    >
                      Reject Proposal
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    By signing, you agree to the terms outlined in this proposal.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Already Signed */}
            {proposal.status === ProposalStatus.SIGNED && (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-green-800 mb-1">Proposal Signed</h3>
                  <p className="text-sm text-green-600">
                    This proposal has been successfully signed.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Rejected */}
            {proposal.status === ProposalStatus.REJECTED && (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-red-800 mb-1">Proposal Rejected</h3>
                  <p className="text-sm text-red-600">
                    This proposal has been rejected.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Expired */}
            {isExpired && (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">Proposal Expired</h3>
                  <p className="text-sm text-gray-600">
                    This proposal has expired and can no longer be signed.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
