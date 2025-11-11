export interface Signature {
  id: string;
  proposalId: string;
  signerName: string;
  signerEmail: string;
  signatureUrl?: string;
  ipAddress?: string;
  userAgent?: string;
  signedAt: string;
  createdAt: string;
  updatedAt: string;
  auditLogs?: SignatureAudit[];
}

export interface SignatureAudit {
  id: string;
  signatureId: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  createdAt: string;
}

export interface CreateSignatureDto {
  signerName: string;
  signerEmail: string;
  signatureData?: string; // base64 signature image
}

export interface SignTokenResponse {
  token: string;
  signUrl: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  proposal?: any;
  message?: string;
}

import { ProposalStatus } from './proposal';

export interface PublicProposal {
  id: string;
  title: string;
  content: string;
  status: ProposalStatus;
  createdAt: string;
  updatedAt: string;
  userId: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  template?: {
    id: string;
    name: string;
    content: string;
  };
  signatures: Signature[];
  pdfUrl?: string;
  signedPdfUrl?: string;
}
