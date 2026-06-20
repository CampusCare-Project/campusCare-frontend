import { privateClient } from '@/api/client';
import type { ApiResponse, Paginated } from '@/types/common';
import type {
  AddReportMediaPayload,
  AssignReportPayload,
  CreateFeedbackPayload,
  CreateRepairNotePayload,
  CreateReportPayload,
  RejectReportPayload,
  Report,
  UpdateReportStatusPayload,
  VerifyReportPayload,
} from './types';

export type ReportQuery = {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  categoryId?: string;
  buildingId?: string;
  roomId?: string;
  q?: string;
};

export const reportService = {
  async list(params?: ReportQuery) {
    const res = await privateClient.get<ApiResponse<Paginated<Report>>>('/api/reports', { params });
    return res.data.data;
  },
  async detail(id: string) {
    const res = await privateClient.get<ApiResponse<Report>>(`/api/reports/${id}`);
    return res.data.data;
  },
  async create(payload: CreateReportPayload) {
    const res = await privateClient.post<ApiResponse<Report>>('/api/reports', payload);
    return res.data.data;
  },
  async verify(id: string, payload: VerifyReportPayload) {
    const res = await privateClient.patch<ApiResponse<Report>>(`/api/reports/${id}/verify`, payload);
    return res.data.data;
  },
  async reject(id: string, payload: RejectReportPayload) {
    const res = await privateClient.patch<ApiResponse<Report>>(`/api/reports/${id}/reject`, payload);
    return res.data.data;
  },
  async assign(id: string, payload: AssignReportPayload) {
    const res = await privateClient.patch<ApiResponse<Report>>(`/api/reports/${id}/assign`, payload);
    return res.data.data;
  },
  async updateStatus(id: string, payload: UpdateReportStatusPayload) {
    const res = await privateClient.patch<ApiResponse<Report>>(`/api/reports/${id}/status`, payload);
    return res.data.data;
  },
  async addNote(id: string, payload: CreateRepairNotePayload) {
    const res = await privateClient.post(`/api/reports/${id}/notes`, payload);
    return res.data.data;
  },
  async addMedia(id: string, payload: AddReportMediaPayload) {
    const res = await privateClient.post(`/api/reports/${id}/media`, payload);
    return res.data.data;
  },
  async feedback(id: string, payload: CreateFeedbackPayload) {
    const res = await privateClient.post(`/api/reports/${id}/feedback`, payload);
    return res.data.data;
  },
};
