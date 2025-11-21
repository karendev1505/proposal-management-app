'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect to create proposal page with template ID
    if (params.id) {
      router.push(`/proposals/new?template=${params.id}`);
    } else {
      router.push('/templates');
    }
  }, [params.id, router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 mb-4">Redirecting to create proposal with template...</p>
            <Button onClick={() => router.push('/templates')} variant="outline">
              Back to Templates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

