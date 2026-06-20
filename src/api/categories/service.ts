import { privateClient } from '@/api/client';
import type { ApiResponse } from '@/types/common';
import type { Category, CreateCategoryPayload, UpdateCategoryPayload,UpdateCategoryInput } from './types';

export const categoryService = {
  async list() {
    const res = await privateClient.get<ApiResponse<Category[]>>('/api/categories');
    return res.data.data;
  },
  async create(payload: CreateCategoryPayload) {
    const res = await privateClient.post<ApiResponse<Category>>('/api/categories', payload);
    return res.data.data;
  },
 async update(id: string, payload: UpdateCategoryInput) {
    const response = await privateClient.patch<{
      success: boolean;
      message: string;
      data: Category;
    }>(`/api/categories/${id}`, payload);

    return response.data.data;
  },

  async delete(id: string) {
    const response = await privateClient.delete<{
      success: boolean;
      message: string;
      data: Category;
    }>(`/api/categories/${id}`);

    return response.data.data;
  },
  
  async remove(id: string) {
    const res = await privateClient.delete<ApiResponse<boolean>>(`/api/categories/${id}`);
    return res.data.data;
  },
};
