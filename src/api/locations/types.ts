export type Building = {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  latitude?: number ;
  longitude?: number ;
};

export type Room = {
  id: string;
  buildingId: string;
  name: string;
  code: string;
  floorName?: string | null;
  description?: string | null;
};

export type CreateBuildingPayload = {
  name: string;
  code: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};

export type CreateRoomPayload = {
  buildingId: string;
  name: string;
  code: string;
  floorName?: string;
  description?: string;
};

export type DeleteLocationResponse = {
  id: string;
  deleted: boolean;
};

export type UpdateBuildingInput = {
  name?: string;
  code?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};

export type UpdateRoomInput = {
  buildingId?: string;
  name?: string;
  code?: string;
  floorName?: string;
  description?: string;
};