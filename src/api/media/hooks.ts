import { useState } from 'react';
import { mediaService } from './service';
import type { UploadMediaPayload,UploadMediaInput } from './types';

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false);

  const upload = async (payload: UploadMediaInput) => {
    setUploading(true);
    try {
      return await mediaService.upload(payload);
    } finally {
      setUploading(false);
    }
  };

  return { uploading, upload };
}
