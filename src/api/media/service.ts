import { privateClient } from '@/api/client';
import type { ApiResponse } from '@/types/common';
import type { MediaAsset, UploadMediaPayload, UploadMediaInput,MediaTargetType,MediaUsageType,MediaSource} from './types';
import { Platform } from "react-native";

function getFileNameFromUri(uri: string) {
  const cleanUri = uri.split("?")[0];
  const fileName = cleanUri.split("/").pop();

  return fileName || `upload-${Date.now()}.jpg`;
}

function getMimeTypeFromFileName(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "pdf") return "application/pdf";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";

  return "image/jpeg";
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
};
