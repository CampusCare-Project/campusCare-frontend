import { privateClient } from '@/api/client';
import type { ApiResponse, Paginated } from '@/types/common';
import type { NotificationItem } from './types';

export const notificationService = {
  async list(params?: { page?: number; limit?: number; isRead?: boolean }) {
    const res = await privateClient.get<ApiResponse<Paginated<NotificationItem>>>('/api/notifications', {
      params: params ? { ...params, isRead: params.isRead === undefined ? undefined : String(params.isRead) } : undefined,
    });
    return res.data.data;
  },
  async unreadCount() {
    const res = await privateClient.get<ApiResponse<{ count: number }>>('/api/notifications/unread-count');
    return res.data.data;
  },
  async markRead(id: string) {
    const res = await privateClient.patch<ApiResponse<NotificationItem>>(`/api/notifications/${id}/read`);
    return res.data.data;
  },
  async markAllRead() {
    const res = await privateClient.patch<ApiResponse<{ updated: number }>>('/api/notifications/read-all');
    return res.data.data;
  },
};
