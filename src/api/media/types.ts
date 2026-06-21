export type UploadMediaPayload = {
  uri: string;
  name?: string;
  mimeType?: string;
  source?: MediaSource;
  targetType?: MediaTargetType;
  targetId?: string;
  usageType?: MediaUsageType;
};

export type UploadMediaInput = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  source: MediaSource;
  targetType?: MediaTargetType;
  targetId?: string;
  usageType?: MediaUsageType;
};

export type MediaType = "IMAGE" | "DOCUMENT";

export type MediaSource = "CAMERA" | "GALLERY" | "UPLOAD";


export type MediaUsageType =
  | "PROFILE_AVATAR"
  | "REPORT_DAMAGE_PHOTO"
  | "REPORT_REPAIR_PROOF"
  | "REPORT_ADDITIONAL_EVIDENCE";

export type MediaTargetType = "USER" | "REPORT" | "REPAIR_NOTE";

export type MediaAssetType = "IMAGE" | "DOCUMENT";

export type MediaStatus = "READY" | "DELETED" | "FAILED";

export type MediaAsset = {
  id: string;
  uploaderId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  type: MediaAssetType;
  source: MediaSource;
  status: MediaStatus;
  storageKey: string;
  url: string;
  checksum?: string | null;
  exifStripped?: boolean;
  createdAt?: string;
  updatedAt?: string;
  usages?: MediaUsage[];
};

export type MediaUsage = {
  id: string;
  mediaId: string;
  targetType: MediaTargetType;
  targetId: string;
  usageType: MediaUsageType;
  createdAt?: string;
};

