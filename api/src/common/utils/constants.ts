export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export const PROPOSAL_STATUS = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  VIEWED: 'VIEWED',
  SIGNED: 'SIGNED',
  REJECTED: 'REJECTED',
} as const;

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;
