import { create } from 'zustand';

import { getUploadKey } from '@/features/ai-models/domain/uploadKey';

export interface IPendingUpload {
  orgId: string;
  modelId: string;
  edition: string;
  file: File;
}

interface IPendingUploadsState {
  pendingUploads: Record<string, IPendingUpload>;

  ADD_PENDING_UPLOAD: (upload: IPendingUpload) => void;
  REMOVE_PENDING_UPLOAD: (modelId: string, edition: string) => void;
}

export const usePendingUploadsStore = create<IPendingUploadsState>()((set) => ({
  pendingUploads: {},

  ADD_PENDING_UPLOAD(upload) {
    set((state) => ({
      pendingUploads: {
        ...state.pendingUploads,
        [getUploadKey(upload.modelId, upload.edition)]: upload,
      },
    }));
  },

  REMOVE_PENDING_UPLOAD(modelId, edition) {
    set((state) => {
      const key = getUploadKey(modelId, edition);
      const { [key]: _removed, ...rest } = state.pendingUploads;

      return { pendingUploads: rest };
    });
  },
}));
