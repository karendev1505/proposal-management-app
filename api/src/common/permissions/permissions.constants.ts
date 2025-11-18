export enum Permission {
  // Proposal permissions
  PROPOSAL_CREATE = 'proposal:create',
  PROPOSAL_EDIT = 'proposal:edit',
  PROPOSAL_DELETE = 'proposal:delete',
  PROPOSAL_VIEW = 'proposal:view',

  // Template permissions
  TEMPLATE_CREATE = 'template:create',
  TEMPLATE_EDIT = 'template:edit',
  TEMPLATE_DELETE = 'template:delete',
  TEMPLATE_VIEW = 'template:view',

  // Workspace permissions
  WORKSPACE_MANAGE = 'workspace:manage',

  // Member permissions
  MEMBERS_MANAGE = 'members:manage',
  MEMBERS_VIEW = 'members:view',

  // Audit permissions
  AUDIT_VIEW = 'audit:view',
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  OWNER: [
    Permission.PROPOSAL_CREATE,
    Permission.PROPOSAL_EDIT,
    Permission.PROPOSAL_DELETE,
    Permission.PROPOSAL_VIEW,
    Permission.TEMPLATE_CREATE,
    Permission.TEMPLATE_EDIT,
    Permission.TEMPLATE_DELETE,
    Permission.TEMPLATE_VIEW,
    Permission.WORKSPACE_MANAGE,
    Permission.MEMBERS_MANAGE,
    Permission.MEMBERS_VIEW,
    Permission.AUDIT_VIEW,
  ],
  ADMIN: [
    Permission.PROPOSAL_CREATE,
    Permission.PROPOSAL_EDIT,
    Permission.PROPOSAL_DELETE,
    Permission.PROPOSAL_VIEW,
    Permission.TEMPLATE_CREATE,
    Permission.TEMPLATE_EDIT,
    Permission.TEMPLATE_DELETE,
    Permission.TEMPLATE_VIEW,
    Permission.MEMBERS_MANAGE,
    Permission.MEMBERS_VIEW,
    Permission.AUDIT_VIEW,
  ],
  MEMBER: [
    Permission.PROPOSAL_CREATE,
    Permission.PROPOSAL_EDIT,
    Permission.PROPOSAL_VIEW,
    Permission.TEMPLATE_CREATE,
    Permission.TEMPLATE_VIEW,
    Permission.MEMBERS_VIEW,
  ],
  VIEWER: [
    Permission.PROPOSAL_VIEW,
    Permission.TEMPLATE_VIEW,
    Permission.MEMBERS_VIEW,
  ],
};

