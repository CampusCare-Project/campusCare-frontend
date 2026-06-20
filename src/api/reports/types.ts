export type ReportStatus = 'PENDING' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'CANCELLED';
export type ReportPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ReportMediaType = 'DAMAGE_PHOTO' | 'REPAIR_PROOF' | 'ADDITIONAL_EVIDENCE';
export type NoteVisibility = 'PUBLIC' | 'INTERNAL';

export type IssueCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  defaultSlaHours: number;
  isActive: boolean;
};

export type Building = {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
};

export type Room = {
  id: string;
  buildingId: string;
  name: string;
  code: string;
  floorName?: string | null;
  description?: string | null;
};

export type ReportMedia = {
  id: string;
  reportId: string;
  repairNoteId?: string | null;
  mediaId: string;
  type: ReportMediaType;
  caption?: string | null;
  uploadedById: string;
  createdAt: string;
};

export type RepairNote = {
  id: string;
  reportId: string;
  authorId: string;
  note: string;
  visibility: NoteVisibility;
  createdAt: string;
  updatedAt: string;
  media?: ReportMedia[];
};

export type ReportFeedback = {
  id: string;
  reportId: string;
  userId: string;
  rating: number;
  comment?: string | null;
};

export type Report = {
  id: string;
  clientLocalId?: string | null;
  reporterId: string;
  assignedTechnicianId?: string | null;
  categoryId: string;
  buildingId?: string | null;
  roomId?: string | null;
  title: string;
  description: string;
  status: ReportStatus;
  priority: ReportPriority;
  source?: 'ONLINE' | 'OFFLINE_SYNC';
  locationText?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  rejectionReason?: string | null;
  resolvedNote?: string | null;
  verifiedAt?: string | null;
  assignedAt?: string | null;
  startedAt?: string | null;
  resolvedAt?: string | null;
  rejectedAt?: string | null;
  cancelledAt?: string | null;
  dueAt?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: IssueCategory;
  building?: Building | null;
  room?: Room | null;
  repairNotes?: RepairNote[];
  media?: ReportMedia[];
  feedback?: ReportFeedback | null;
};

export type CreateReportPayload = {
  clientLocalId?: string;
  categoryId: string;
  buildingId?: string;
  roomId?: string;
  title: string;
  description: string;
  priority: ReportPriority;
  locationText?: string;
  latitude?: number;
  longitude?: number;
};

export type VerifyReportPayload = { note?: string };
export type RejectReportPayload = { reason: string };
export type AssignReportPayload = { technicianId: string; note?: string };
export type UpdateReportStatusPayload = { status: ReportStatus; note?: string; resolvedNote?: string };
export type CreateRepairNotePayload = { note: string; visibility: NoteVisibility };
export type AddReportMediaPayload = { mediaId: string; type: ReportMediaType; caption?: string; repairNoteId?: string };
export type CreateFeedbackPayload = { rating: number; comment?: string };
