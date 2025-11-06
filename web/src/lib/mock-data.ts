import { Proposal, ProposalStatus, CreateProposalData, UpdateProposalData } from '@/types/proposal';
import { Template, CreateTemplateData, UpdateTemplateData } from '@/types/template';

export const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Basic Service Proposal',
    description: 'A simple template for service proposals',
    content: `# Service Proposal

## Project Overview
{{project_description}}

## Scope of Work
{{scope_of_work}}

## Timeline
{{timeline}}

## Investment
{{investment}}

## Next Steps
{{next_steps}}

Best regards,
{{company_name}}`,
    category: 'Service',
    isDefault: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    userId: 'user1'
  },
  {
    id: '2',
    name: 'Web Development Proposal',
    description: 'Template for web development projects',
    content: `# Web Development Proposal

## Project Requirements
{{project_requirements}}

## Technical Approach
{{technical_approach}}

## Deliverables
{{deliverables}}

## Timeline & Milestones
{{timeline_milestones}}

## Investment & Payment Terms
{{investment_payment}}

## About Our Team
{{team_info}}`,
    category: 'Development',
    isDefault: false,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    userId: 'user1'
  },
  {
    id: '3',
    name: 'Marketing Campaign Proposal',
    description: 'Template for marketing campaign proposals',
    content: `# Marketing Campaign Proposal

## Campaign Overview
{{campaign_overview}}

## Target Audience
{{target_audience}}

## Strategy & Tactics
{{strategy_tactics}}

## Budget Breakdown
{{budget_breakdown}}

## Expected Results
{{expected_results}}

## Timeline
{{timeline}}`,
    category: 'Marketing',
    isDefault: false,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
    userId: 'user1'
  }
];

export const mockProposals: Proposal[] = [
  {
    id: '1',
    title: 'E-commerce Website Development',
    content: `# E-commerce Website Development Proposal

## Project Overview
We propose to develop a modern, responsive e-commerce website for your business that will help you reach more customers and increase sales.

## Scope of Work
- Custom website design
- Shopping cart functionality
- Payment gateway integration
- Admin dashboard
- Mobile optimization
- SEO optimization

## Timeline
The project will be completed in 8-10 weeks from the start date.

## Investment
Total project cost: $15,000

## Next Steps
Upon approval, we will begin with the design phase and provide regular updates throughout the development process.

Best regards,
TechCorp Solutions`,
    status: ProposalStatus.SENT,
    clientEmail: 'john@example.com',
    clientName: 'John Smith',
    templateId: '2',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    sentAt: '2024-01-15T14:00:00Z',
    viewedAt: '2024-01-16T09:00:00Z',
    expiresAt: '2024-02-15T23:59:59Z',
    publicToken: 'abc123def456',
    userId: 'user1'
  },
  {
    id: '2',
    title: 'Marketing Campaign for Q2',
    content: `# Q2 Marketing Campaign Proposal

## Campaign Overview
A comprehensive digital marketing campaign to boost brand awareness and drive sales for Q2 2024.

## Target Audience
- Age: 25-45
- Income: $50k+
- Interests: Technology, lifestyle

## Strategy & Tactics
- Social media advertising
- Content marketing
- Email campaigns
- Influencer partnerships

## Budget Breakdown
- Social Media Ads: $5,000
- Content Creation: $3,000
- Influencer Partnerships: $2,000
- Management Fee: $2,000

Total: $12,000

## Expected Results
- 25% increase in brand awareness
- 15% increase in website traffic
- 10% increase in conversions

## Timeline
Campaign duration: 3 months (April - June 2024)`,
    status: ProposalStatus.SIGNED,
    clientEmail: 'sarah@company.com',
    clientName: 'Sarah Johnson',
    templateId: '3',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-20T16:00:00Z',
    sentAt: '2024-01-12T10:00:00Z',
    viewedAt: '2024-01-12T15:30:00Z',
    signedAt: '2024-01-20T16:00:00Z',
    signature: 'Sarah Johnson',
    publicToken: 'xyz789abc123',
    userId: 'user1'
  },
  {
    id: '3',
    title: 'Mobile App Development',
    content: `# Mobile App Development Proposal

## Project Overview
Development of a cross-platform mobile application for iOS and Android.

## Scope of Work
- Native iOS and Android apps
- Backend API development
- User authentication
- Push notifications
- In-app purchases
- Analytics integration

## Timeline
Development will take 12-14 weeks.

## Investment
Total cost: $25,000
- 50% upfront
- 25% at milestone
- 25% upon completion`,
    status: ProposalStatus.DRAFT,
    clientEmail: 'mike@startup.com',
    clientName: 'Mike Chen',
    templateId: '2',
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-01-22T09:00:00Z',
    userId: 'user1'
  },
  {
    id: '4',
    title: 'Brand Identity Design',
    content: `# Brand Identity Design Proposal

## Project Overview
Complete brand identity design including logo, color palette, typography, and brand guidelines.

## Deliverables
- Logo design (3 concepts)
- Color palette
- Typography selection
- Business card design
- Letterhead design
- Brand guidelines document

## Timeline
4-6 weeks from project start

## Investment
$8,000 total investment`,
    status: ProposalStatus.VIEWED,
    clientEmail: 'lisa@newbiz.com',
    clientName: 'Lisa Williams',
    templateId: '1',
    createdAt: '2024-01-18T14:00:00Z',
    updatedAt: '2024-01-19T11:00:00Z',
    sentAt: '2024-01-19T11:00:00Z',
    viewedAt: '2024-01-19T16:45:00Z',
    expiresAt: '2024-02-19T23:59:59Z',
    publicToken: 'def456ghi789',
    userId: 'user1'
  },
  {
    id: '5',
    title: 'SEO Optimization Service',
    content: `# SEO Optimization Service Proposal

## Service Overview
Comprehensive SEO optimization to improve your website's search engine rankings.

## What's Included
- Website audit
- Keyword research
- On-page optimization
- Content optimization
- Link building
- Monthly reporting

## Timeline
Ongoing service with monthly optimization

## Investment
$2,500/month for 6-month minimum contract`,
    status: ProposalStatus.EXPIRED,
    clientEmail: 'david@oldsite.com',
    clientName: 'David Brown',
    templateId: '1',
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-05T09:00:00Z',
    sentAt: '2024-01-05T10:00:00Z',
    expiresAt: '2024-01-20T23:59:59Z',
    publicToken: 'ghi789jkl012',
    userId: 'user1'
  }
];

// Helper functions for mock API simulation
export const getProposals = (filters?: {
  status?: ProposalStatus;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  let filtered = [...mockProposals];
  
  if (filters?.status) {
    filtered = filtered.filter(p => p.status === filters.status);
  }
  
  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(search) ||
      p.clientName?.toLowerCase().includes(search) ||
      p.clientEmail?.toLowerCase().includes(search)
    );
  }
  
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return {
    proposals: filtered.slice(start, end),
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit)
  };
};

export const getTemplates = (filters?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  let filtered = [...mockTemplates];
  
  if (filters?.category) {
    filtered = filtered.filter(t => t.category === filters.category);
  }
  
  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(t => 
      t.name.toLowerCase().includes(search) ||
      t.description?.toLowerCase().includes(search)
    );
  }
  
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return {
    templates: filtered.slice(start, end),
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit)
  };
};

export const getProposalById = (id: string) => {
  return mockProposals.find(p => p.id === id);
};

export const getTemplateById = (id: string) => {
  return mockTemplates.find(t => t.id === id);
};

export const getProposalByToken = (token: string) => {
  return mockProposals.find(p => p.publicToken === token);
};

// Additional utility functions for better mock API simulation
export const createProposal = (data: CreateProposalData) => {
  const newProposal: Proposal = {
    id: (mockProposals.length + 1).toString(),
    ...data,
    status: ProposalStatus.DRAFT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'user1',
  };
  mockProposals.push(newProposal);
  return newProposal;
};

export const updateProposal = (id: string, data: UpdateProposalData) => {
  const index = mockProposals.findIndex(p => p.id === id);
  if (index !== -1) {
    mockProposals[index] = {
      ...mockProposals[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockProposals[index];
  }
  return null;
};

export const deleteProposal = (id: string) => {
  const index = mockProposals.findIndex(p => p.id === id);
  if (index !== -1) {
    return mockProposals.splice(index, 1)[0];
  }
  return null;
};

export const createTemplate = (data: CreateTemplateData) => {
  const newTemplate: Template = {
    id: (mockTemplates.length + 1).toString(),
    ...data,
    isDefault: data.isDefault || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'user1',
  };
  mockTemplates.push(newTemplate);
  return newTemplate;
};

export const updateTemplate = (id: string, data: UpdateTemplateData) => {
  const index = mockTemplates.findIndex(t => t.id === id);
  if (index !== -1) {
    mockTemplates[index] = {
      ...mockTemplates[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockTemplates[index];
  }
  return null;
};

export const deleteTemplate = (id: string) => {
  const index = mockTemplates.findIndex(t => t.id === id);
  if (index !== -1) {
    return mockTemplates.splice(index, 1)[0];
  }
  return null;
};

// Statistics for dashboard
export const getProposalStats = () => {
  const total = mockProposals.length;
  const draft = mockProposals.filter(p => p.status === ProposalStatus.DRAFT).length;
  const sent = mockProposals.filter(p => p.status === ProposalStatus.SENT).length;
  const viewed = mockProposals.filter(p => p.status === ProposalStatus.VIEWED).length;
  const signed = mockProposals.filter(p => p.status === ProposalStatus.SIGNED).length;
  const rejected = mockProposals.filter(p => p.status === ProposalStatus.REJECTED).length;
  const expired = mockProposals.filter(p => p.status === ProposalStatus.EXPIRED).length;

  return {
    total,
    draft,
    sent,
    viewed,
    signed,
    rejected,
    expired,
    conversionRate: total > 0 ? Math.round((signed / total) * 100) : 0,
  };
};
