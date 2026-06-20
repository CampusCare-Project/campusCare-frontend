import { privateClient } from '@/api/client';
import type { ApiResponse } from '@/types/common';
import type { Building, CreateBuildingPayload, CreateRoomPayload, Room,DeleteLocationResponse,UpdateBuildingInput,UpdateRoomInput } from './types';

export const locationService = {
  async buildings() {
    const res = await privateClient.get<ApiResponse<Building[]>>('/api/locations/buildings');
    return res.data.data;
  },
  async createBuilding(payload: CreateBuildingPayload) {
    const res = await privateClient.post<ApiResponse<Building>>('/api/locations/buildings', payload);
    return res.data.data;
  },
async updateBuilding(id: string, payload: UpdateBuildingInput) {
  const response = await privateClient.patch<{
    success: boolean;
    message: string;
    data: Building;
  }>(`/api/locations/buildings/${id}`, payload);

  return response.data.data;
},
  async rooms(buildingId?: string) {
    const url = buildingId ? `/api/locations/buildings/${buildingId}/rooms` : '/api/locations/rooms';
    const res = await privateClient.get<ApiResponse<Room[]>>(url);
    return res.data.data;
  },
  async createRoom(payload: CreateRoomPayload) {
    const res = await privateClient.post<ApiResponse<Room>>('/api/locations/rooms', payload);
    return res.data.data;
  },
 async updateRoom(id: string, payload: UpdateRoomInput) {
  const response = await privateClient.patch<{
    success: boolean;
    message: string;
    data: Room;
  }>(`/api/locations/rooms/${id}`, payload);

  return response.data.data;
  },
  async deleteBuilding(id: string) {
    const response = await privateClient.delete<{
      success: boolean;
      message: string;
      data: DeleteLocationResponse;
    }>(`/api/locations/buildings/${id}`);

    return response.data.data;
  },

  async deleteRoom(id: string) {
    const response = await privateClient.delete<{
      success: boolean;
      message: string;
      data: DeleteLocationResponse;
    }>(`/api/locations/rooms/${id}`);

    return response.data.data;
  },
  
};
