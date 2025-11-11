export enum ProposalStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  SIGNED = 'SIGNED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export interface Proposal {
  id: string;
  title: string;
  content?: string;
  status: ProposalStatus;
  clientEmail?: string;
  clientName?: string;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  viewedAt?: string;
  signedAt?: string;
  expiresAt?: string;
  publicToken?: string;
  signature?: string;
  userId: string;
  pdfUrl?: string;
  signedPdfUrl?: string;
}

export interface CreateProposalData {
  title: string;
  content?: string;
  clientEmail?: string;
  clientName?: string;
  templateId?: string;
}

export interface UpdateProposalData {
  title?: string;
  content?: string;
  clientEmail?: string;
  clientName?: string;
  templateId?: string;
}

export interface SendProposalData {
  proposalId: string;
  recipientEmail: string;
  recipientName?: string;
  message?: string;
}

export interface ProposalFilters {
  status?: ProposalStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProposalListResponse {
  proposals: Proposal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProposalStats {
  total: number;
  draft: number;
  sent: number;
  viewed: number;
  signed: number;
  rejected: number;
  expired: number;
}