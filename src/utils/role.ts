import type { UserRole } from '@/constants/roles';
export const isAdmin = (role?: UserRole) => role === 'ADMIN';
export const isTechnician = (role?: UserRole) => role === 'TECHNICIAN';
export const canCreateReport = (role?: UserRole) => role === 'STUDENT' || role === 'STAFF' || role === 'ADMIN';
