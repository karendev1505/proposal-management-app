'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { mockTemplates, mockProposals } from '@/lib/mock-data';
import { EmailType } from '@/types/email';

export default function ComposeEmailPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    subject: '',
    recipientEmail: '',
    recipientName: '',
    content: '',
    type: EmailType.CUSTOM,
    templateId: '',
    proposalId: '',
  });
  const [isPreview, setIsPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateChange = (templateId: string) => {
    const template = mockTemplates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        templateId,
        subject: template.name,
        content: template.content,
      }));
    }
  };

  const handleProposalChange = (proposalId: string) => {
    const proposal = mockProposals.find(p => p.id === proposalId);
    if (proposal) {
      setFormData(prev => ({
        ...prev,
        proposalId,
        subject: `Proposal: ${proposal.title}`,
        recipientEmail: proposal.clientEmail || '',
        recipientName: proposal.clientName || '',
        type: EmailType.PROPOSAL,
      }));
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + `{{${variable}}}` + after;
      
      setFormData(prev => ({ ...prev, content: newText }));
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Sending email:', formData);
      
      // Redirect to emails list
      router.push('/emails');
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      // Simulate saving draft
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Saving draft:', formData);
      
      // Show success message or redirect
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const commonVariables = [
    'recipient_name',
    'sender_name',
    'company_name',
    'proposal_title',
    'proposal_link',
    'signature_link',
    'current_date',
    'due_date',
  ];

  const processContent = (content: string) => {
    // Replace variables with sample values for preview
    return content
      .replace(/\{\{recipient_name\}\}/g, formData.recipientName || 'John Doe')
      .replace(/\{\{sender_name\}\}/g, 'Demo User')
      .replace(/\{\{company_name\}\}/g, 'Your Company')
      .replace(/\{\{proposal_title\}\}/g, 'Sample Proposal')
      .replace(/\{\{proposal_link\}\}/g, 'https://example.com/proposal/123')
      .replace(/\{\{signature_link\}\}/g, 'https://example.com/sign/abc123')
      .replace(/\{\{current_date\}\}/g, new Date().toLocaleDateString())
      .replace(/\{\{due_date\}\}/g, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString());
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compose Email</h1>
          <p className="text-gray-600">Create and send professional emails</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPreview(!isPreview)}
          >
            {isPreview ? 'Edit' : 'Preview'}
          </Button>
          <Link href="/emails">
            <Button variant="outline">Back to Emails</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Variables Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Email Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Click to insert variables into your email
              </p>
              <div className="space-y-2">
                {commonVariables.map((variable) => (
                  <Button
                    key={variable}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left"
                    onClick={() => insertVariable(variable)}
                  >
                    {`{{${variable}}}`}
                  </Button>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-xs text-blue-800">
                  <strong>Tip:</strong> Variables will be replaced with actual values when the email is sent.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Templates */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Use Template</label>
                <Select
                  value={formData.templateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                >
                  <option value="">Select template</option>
                  {mockTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Link to Proposal</label>
                <Select
                  value={formData.proposalId}
                  onChange={(e) => handleProposalChange(e.target.value)}
                >
                  <option value="">Select proposal</option>
                  {mockProposals.map((proposal) => (
                    <option key={proposal.id} value={proposal.id}>
                      {proposal.title}
                    </option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Email Composer */}
        <div className="lg:col-span-3">
          {!isPreview ? (
            <Card>
              <CardHeader>
                <CardTitle>Email Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="recipientEmail" className="block text-sm font-medium mb-2">
                        Recipient Email *
                      </label>
                      <Input
                        id="recipientEmail"
                        type="email"
                        value={formData.recipientEmail}
                        onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
                        placeholder="recipient@example.com"
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
                        value={formData.recipientName}
                        onChange={(e) => handleInputChange('recipientName', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="Email subject"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="type" className="block text-sm font-medium mb-2">
                        Email Type
                      </label>
                      <Select
                        id="type"
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                      >
                        <option value={EmailType.CUSTOM}>Custom</option>
                        <option value={EmailType.PROPOSAL}>Proposal</option>
                        <option value={EmailType.REMINDER}>Reminder</option>
                        <option value={EmailType.NOTIFICATION}>Notification</option>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="content" className="block text-sm font-medium mb-2">
                      Email Content *
                    </label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder="Write your email content here. Use variables like {{recipient_name}} for personalization."
                      rows={15}
                      className="font-mono"
                      required
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      You can use variables and basic formatting in your email content
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handleSend}
                      disabled={!formData.subject || !formData.recipientEmail || !formData.content || isSending}
                      className="flex-1"
                    >
                      {isSending ? 'Sending...' : 'Send Email'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSaveDraft}
                      className="flex-1"
                    >
                      Save Draft
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Email Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">To:</span> {formData.recipientName} &lt;{formData.recipientEmail}&gt;
                      </div>
                      <div>
                        <span className="font-medium">From:</span> Demo User &lt;demo@example.com&gt;
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium">Subject:</span> {formData.subject}
                      </div>
                    </div>
                  </div>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {processContent(formData.content)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
