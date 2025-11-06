'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { getTemplates } from '@/lib/mock-data';

export default function TemplatesPage() {
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    page: 1,
    limit: 10,
  });

  const templatesData = useMemo(() => {
    return getTemplates({
      category: filters.category || undefined,
      search: filters.search || undefined,
      page: filters.page,
      limit: filters.limit,
    });
  }, [filters]);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (typeof value === 'number' ? value : 1),
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const categories = Array.from(new Set(templatesData.templates.map(t => t.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Templates</h1>
        <Link href="/templates/new">
          <Button>Create Template</Button>
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
                placeholder="Search templates..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templatesData.templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">
                    <Link 
                      href={`/templates/view/${template.id}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {template.name}
                    </Link>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {template.category && (
                      <Badge variant="outline">{template.category}</Badge>
                    )}
                    {template.isDefault && (
                      <Badge variant="default">Default</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {template.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {template.description}
                  </p>
                )}
                
                <div className="text-xs text-gray-500">
                  <p>Created: {formatDate(template.createdAt)}</p>
                  <p>Updated: {formatDate(template.updatedAt)}</p>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Link href={`/templates/view/${template.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                  <Link href={`/templates/edit/${template.id}`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                  <Link href={`/templates/editor/${template.id}`}>
                    <Button variant="outline" size="sm">Use Template</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {templatesData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((filters.page - 1) * filters.limit) + 1} to{' '}
            {Math.min(filters.page * filters.limit, templatesData.total)} of{' '}
            {templatesData.total} templates
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
              disabled={filters.page === templatesData.totalPages}
              onClick={() => handleFilterChange('page', filters.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {templatesData.templates.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.category 
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first template.'
              }
            </p>
            <Link href="/templates/new">
              <Button>Create Template</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
