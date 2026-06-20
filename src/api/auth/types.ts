import type { UserRole } from '@/constants/roles';

export type User = {
  id_user: string;
  username: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status?: 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'DELETED';
  avatarMediaId?: string | null;
  identityNumber?: string | null;
  department?: string | null;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  name: string;
  email: string;
  passwordHash: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};
