export const ROLES = {
  STUDENT: 'STUDENT',
  STAFF: 'STAFF',
  TECHNICIAN: 'TECHNICIAN',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = keyof typeof ROLES;

export const REPORT_STATUSES = [
  'PENDING',
  'VERIFIED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
  'CANCELLED',
] as const;

export const REPORT_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
