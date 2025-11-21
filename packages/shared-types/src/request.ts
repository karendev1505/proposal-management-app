export interface AuthenticatedRequest {
  user: {
    id: string;
    userId?: string;
    email: string;
    name: string;
    role: string;
    activeWorkspaceId?: string | null;
  };
  correlationId?: string;
  workspaceId?: string;
  workspaceRole?: string;
}

