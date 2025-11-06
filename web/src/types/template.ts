export interface Template {
  id: string;
  name: string;
  description?: string;
  content: string;
  category?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  content: string;
  category?: string;
  isDefault?: boolean;
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  content?: string;
  category?: string;
  isDefault?: boolean;
}

export interface TemplateFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TemplateListResponse {
  templates: Template[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}