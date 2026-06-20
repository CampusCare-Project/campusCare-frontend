import type { UserRole } from '@/constants/roles';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'DELETED';

export type AppUser = {
  id_user: string;
  username: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status?: UserStatus;
  avatarMediaId?: string | null;
  identityNumber?: string | null;
  department?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ListUsersQuery = {
  role?: UserRole;
  status?: UserStatus;
};

export type AddUserPayload = {
  username: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Exclude<UserRole, 'ADMIN'>;
};
