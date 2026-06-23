import { privateClient } from '@/api/client';
import type { ApiResponse } from '@/types/common';
import type {
  MediaAsset,
  MediaSource,
  MediaTargetType,
  MediaUsageType,
  UploadMediaInput,
} from "./types";
import { Platform } from "react-native";

function getFileNameFromUri(uri: string) {
  const cleanUri = uri.split("?")[0];
  const fileName = cleanUri.split("/").pop();

  return fileName || `upload-${Date.now()}.jpg`;
}

function getMimeTypeFromFileName(fileName: string) {
   const ext = fileName.split(".").pop()?.toLowerCase();

  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "heic") return "image/heic";

  if (ext === "pdf") return "application/pdf";
  if (ext === "txt") return "text/plain";
  if (ext === "csv") return "text/csv";

  if (ext === "doc") return "application/msword";
  if (ext === "docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  if (ext === "xls") return "application/vnd.ms-excel";
  if (ext === "xlsx") {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  if (ext === "ppt") return "application/vnd.ms-powerpoint";
  if (ext === "pptx") {
    return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  }

  return "application/octet-stream";
}

type UploadableAttachment = {
  uri: string;
  name?: string;
  fileName?: string;
  mimeType?: string;
  source?: "camera" | "gallery" | "document" | MediaSource;
};

function mapAttachmentSourceToMediaSource(
  source?: UploadableAttachment["source"]
): MediaSource {
  if (source === "camera") return "CAMERA";
  if (source === "gallery") return "GALLERY";
  if (source === "document") return "UPLOAD";

  if (source === "CAMERA") return "CAMERA";
  if (source === "GALLERY") return "GALLERY";
  if (source === "UPLOAD") return "UPLOAD";

  return "UPLOAD";
}
async function appendFileToFormData(
  formData: FormData,
  input: UploadMediaInput
) {
  const fileName = input.fileName || getFileNameFromUri(input.uri);
  const mimeType = input.mimeType || getMimeTypeFromFileName(fileName);

  if (Platform.OS === "web") {
    const response = await fetch(input.uri);
    const blob = await response.blob();

    const file = new File([blob], fileName, {
      type: mimeType || blob.type || "image/jpeg",
    });

    formData.append("file", file);
    return;
  }

  formData.append("file", {
    uri: input.uri,
    name: fileName,
    type: mimeType,
  } as any);
}

export const mediaService = {
  async upload(input: UploadMediaInput) {
    const formData = new FormData();

    await appendFileToFormData(formData, input);

    formData.append("source", input.source);

    if (input.targetType) {
      formData.append("targetType", input.targetType);
    }

    if (input.targetId) {
      formData.append("targetId", input.targetId);
    }

    if (input.usageType) {
      formData.append("usageType", input.usageType);
    }

    const response = await privateClient.post<{
      success: boolean;
      message: string;
      data: MediaAsset;
    }>("/api/media/upload", formData, {
      transformRequest: (data) => data,
    });

    return response.data.data;
  },
  async detail(id: string) {
    const res = await privateClient.get<ApiResponse<MediaAsset>>(`/api/media/${id}`);
    return res.data.data;
  },
  async remove(id: string) {
    const res = await privateClient.delete<ApiResponse<boolean>>(`/api/media/${id}`);
    return res.data.data;
  },
   async getById(id: string) {
    const response = await privateClient.get<{
      success: boolean;
      message: string;
      data: MediaAsset;
    }>(`/api/media/${id}`);

    return response.data.data;
  },

  async uploadAttachment(
  attachment: UploadableAttachment,
  options: {
    source?: MediaSource;
    targetType?: MediaTargetType;
    targetId?: string;
    usageType?: MediaUsageType;
  }
) {
  return this.upload({
    uri: attachment.uri,
    fileName: attachment.fileName || attachment.name,
    mimeType: attachment.mimeType,
    source: options.source || mapAttachmentSourceToMediaSource(attachment.source),
    targetType: options.targetType,
    targetId: options.targetId,
    usageType: options.usageType,
  });
},

async uploadMany(
  attachments: UploadableAttachment[],
  options: {
    source?: MediaSource;
    targetType?: MediaTargetType;
    targetId?: string;
    usageType?: MediaUsageType;
  }
) {
  const results: MediaAsset[] = [];

  for (const attachment of attachments) {
    const uploaded = await this.uploadAttachment(attachment, options);
    results.push(uploaded);
  }

  return results;
},
};
