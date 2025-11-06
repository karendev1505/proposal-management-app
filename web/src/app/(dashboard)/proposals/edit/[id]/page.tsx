'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { getProposalById, mockTemplates } from '@/lib/mock-data';
import { Proposal, UpdateProposalData } from '@/types/proposal';

export default function EditProposalPage() {
  const params = useParams();
  const router = useRouter();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [formData, setFormData] = useState<UpdateProposalData>({
    title: '',
    content: '',
    clientEmail: '',
    clientName: '',
    templateId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const foundProposal = getProposalById(params.id as string);
      if (foundProposal) {
        setProposal(foundProposal);
        setFormData({
          title: foundProposal.title,
          content: foundProposal.content || '',
          clientEmail: foundProposal.clientEmail || '',
          clientName: foundProposal.clientName || '',
          templateId: foundProposal.templateId || '',
        });
      }
      setIsLoading(false);
    }
  }, [params.id]);

  const handleInputChange = (field: keyof UpdateProposalData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateChange = (templateId: string) => {
    const template = mockTemplates.find(t => t.id === templateId);
    setFormData(prev => ({
      ...prev,
      templateId,
      content: template ? template.content : prev.content,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would make an API call here
      console.log('Updating proposal:', { id: params.id, ...formData });
      
      // Redirect to proposal view
      router.push(`/proposals/view/${params.id}`);
    } catch (error) {
      console.error('Error updating proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Proposal Not Found</h2>
          <p className="text-gray-600 mb-4">The proposal you're trying to edit doesn't exist.</p>
          <Link href="/proposals">
            <Button>Back to Proposals</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Proposal</h1>
        <div className="flex gap-2">
          <Link href={`/proposals/view/${proposal.id}`}>
            <Button variant="outline">View Proposal</Button>
          </Link>
          <Link href="/proposals">
            <Button variant="outline">Back to Proposals</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proposal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Proposal Title *
              </label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter proposal title"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="clientName" className="block text-sm font-medium mb-2">
                  Client Name
                </label>
                <Input
                  id="clientName"
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label htmlFor="clientEmail" className="block text-sm font-medium mb-2">
                  Client Email
                </label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  placeholder="Enter client email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="template" className="block text-sm font-medium mb-2">
                Template (Optional)
              </label>
              <Select
                id="template"
                value={formData.templateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
              >
                <option value="">Select a template</option>
                {mockTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </Select>
              <p className="text-sm text-gray-600 mt-1">
                Selecting a template will replace the current content
              </p>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-2">
                Proposal Content
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Enter proposal content"
                rows={12}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              />
              <p className="text-sm text-gray-600 mt-1">
                You can use Markdown formatting in your proposal content
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={!formData.title || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Updating...' : 'Update Proposal'}
              </Button>
              <Link href={`/proposals/view/${proposal.id}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
