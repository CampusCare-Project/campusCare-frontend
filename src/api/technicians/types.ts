import type { AppUser, AddUserPayload } from '@/api/users/types';

// export type Technician = AppUser & { role: 'TECHNICIAN' };

export type CreateTechnicianInput = Omit<AddUserPayload, 'role'>;

export type UserRole = "STUDENT" | "STAFF" | "TECHNICIAN" | "ADMIN";

export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED" | "DELETED";

export type Technician = {
  id_user: string;
  username: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "TECHNICIAN";
  status?: UserStatus;
  avatarMediaId?: string | null;
  identityNumber?: string | null;
  department?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type TechnicianResponse = {
  success: boolean;
  message: string;
  data: Technician[];
};