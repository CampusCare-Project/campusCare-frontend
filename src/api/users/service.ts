import { privateClient } from "@/api/client";
import type { ApiResponse } from "@/types/common";
import type { AddUserPayload, AppUser, ListUsersQuery } from "./types";

function cleanParams(query?: ListUsersQuery) {
  return Object.fromEntries(
    Object.entries(query ?? {}).filter(([, value]) => Boolean(value))
  );
}

function unwrapData<T>(body: any): T {
  return body?.data ?? body;
}

export const userService = {
  async list(query?: ListUsersQuery) {
    const response = await privateClient.get<ApiResponse<AppUser[]>>(
      "/api/auth/users",
      {
        params: cleanParams(query),
      }
    );

    return unwrapData<AppUser[]>(response.data);
  },

  async getById(id: string) {
    const response = await privateClient.get<ApiResponse<AppUser | AppUser[]>>(
      `/api/auth/users/${id}`
    );

    const data = unwrapData<AppUser | AppUser[]>(response.data);

    return Array.isArray(data) ? data[0] : data;
  },

  async addUser(payload: AddUserPayload) {
    const response = await privateClient.post<ApiResponse<AppUser>>(
      "/api/auth/addusers",
      payload
    );

    return unwrapData<AppUser>(response.data);
  },

  async listTechnicians() {
    return this.list({ role: "TECHNICIAN", status: "ACTIVE" });
  },

  async addTechnician(payload: Omit<AddUserPayload, "role">) {
    return this.addUser({ ...payload, role: "TECHNICIAN" });
  },
};