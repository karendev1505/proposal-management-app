'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getTemplateById } from '@/lib/mock-data';
import { Template } from '@/types/template';

export default function ViewTemplatePage() {
  const params = useParams();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const foundTemplate = getTemplateById(params.id as string);
      setTemplate(foundTemplate || null);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Template Not Found</h2>
          <p className="text-gray-600 mb-4">The template you're looking for doesn't exist.</p>
          <Link href="/templates">
            <Button>Back to Templates</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{template.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            {template.category && (
              <Badge variant="outline">{template.category}</Badge>
            )}
            {template.isDefault && (
              <Badge variant="default">Default Template</Badge>
            )}
            <span className="text-sm text-gray-600">
              Created {formatDate(template.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/templates/edit/${template.id}`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Link href={`/proposals/new?template=${template.id}`}>
            <Button>Use Template</Button>
          </Link>
          <Link href="/templates">
            <Button variant="outline">Back</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Template Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {template.content}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Info Sidebar */}
        <div className="space-y-6">
          {/* Template Details */}
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {template.description && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Description:</span>
                  <p className="text-sm">{template.description}</p>
                </div>
              )}
              
              <div>
                <span className="text-sm font-medium text-gray-600">Category:</span>
                <p className="text-sm">{template.category || 'Uncategorized'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Default Template:</span>
                <p className="text-sm">{template.isDefault ? 'Yes' : 'No'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Created:</span>
                <p className="text-sm">{formatDate(template.createdAt)}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Last Updated:</span>
                <p className="text-sm">{formatDate(template.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Variables Used */}
          <Card>
            <CardHeader>
              <CardTitle>Variables in Template</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const variables = template.content.match(/\{\{([^}]+)\}\}/g);
                const uniqueVariables = variables ? Array.from(new Set(variables)) : [];
                
                return uniqueVariables.length > 0 ? (
                  <div className="space-y-2">
                    {uniqueVariables.map((variable, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {variable}
                        </code>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No variables found in this template</p>
                );
              })()}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/proposals/new?template=${template.id}`}>
                <Button className="w-full">Create Proposal from Template</Button>
              </Link>
              <Link href={`/templates/edit/${template.id}`}>
                <Button variant="outline" className="w-full">Edit Template</Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(template.content);
                  // In a real app, you'd show a toast notification
                  alert('Template content copied to clipboard!');
                }}
              >
                Copy Content
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
