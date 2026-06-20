import { userService } from '@/api/users/service';
import type { CreateTechnicianInput, Technician, TechnicianResponse } from './types';
import { privateClient } from "../client";

export const technicianService = {
  async list() {
    const users = await userService.list({ role: 'TECHNICIAN', status: 'ACTIVE' });
    return users as Technician[];
  },

  async create(payload: CreateTechnicianInput) {
    const user = await userService.addUser({ ...payload, role: 'TECHNICIAN' });
    return user as Technician;
  },
  

  async getTechnicians(): Promise<Technician[]> {
    const response = await privateClient.get<TechnicianResponse>(
      "/api/auth/technician"
    );

    return response.data.data;
  },
};

