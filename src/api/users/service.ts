import { privateClient } from '@/api/client';
import type { ApiResponse } from '@/types/common';
import type { AddUserPayload, AppUser, ListUsersQuery } from './types';

function cleanParams(query?: ListUsersQuery) {
  return Object.fromEntries(Object.entries(query ?? {}).filter(([, value]) => Boolean(value)));
}

export const userService = {
  async list(query?: ListUsersQuery) {
    const response = await privateClient.get<ApiResponse<AppUser[]>>('/api/auth/users', {
      params: cleanParams(query),
    });

    return response.data.data;
  },

  async addUser(payload: AddUserPayload) {
    const response = await privateClient.post<ApiResponse<AppUser>>('/api/auth/addusers', payload);
    return response.data.data;
  },

  async listTechnicians() {
    return this.list({ role: 'TECHNICIAN', status: 'ACTIVE' });
  },

  async addTechnician(payload: Omit<AddUserPayload, 'role'>) {
    return this.addUser({ ...payload, role: 'TECHNICIAN' });
  },
};
