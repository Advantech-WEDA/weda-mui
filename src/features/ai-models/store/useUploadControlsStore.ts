import { create } from 'zustand';

import { getUploadKey } from '@/features/ai-models/domain/uploadKey';

interface IUploadControls {
  pause: () => Promise<void>;
  resume: () => void;
}

interface IUploadControlsState {
  uploadControls: Record<string, IUploadControls>;

  pausedEditions: Record<string, boolean>;

  REGISTER_UPLOAD_CONTROLS: (
    modelId: string,
    edition: string,
    controls: IUploadControls
  ) => void;
  UNREGISTER_UPLOAD_CONTROLS: (modelId: string, edition: string) => void;
  SET_UPLOAD_PAUSED: (
    modelId: string,
    edition: string,
    paused: boolean
  ) => void;
}

export const useUploadControlsStore = create<IUploadControlsState>()((set) => ({
  uploadControls: {},
  pausedEditions: {},

  REGISTER_UPLOAD_CONTROLS(modelId, edition, controls) {
    set((state) => ({
      uploadControls: {
        ...state.uploadControls,
        [getUploadKey(modelId, edition)]: controls,
      },
    }));
  },

  UNREGISTER_UPLOAD_CONTROLS(modelId, edition) {
    set((state) => {
      const key = getUploadKey(modelId, edition);
      const { [key]: _removedControls, ...restControls } = state.uploadControls;

      return { uploadControls: restControls };
    });
  },

  SET_UPLOAD_PAUSED(modelId, edition, paused) {
    set((state) => ({
      pausedEditions: {
        ...state.pausedEditions,
        [getUploadKey(modelId, edition)]: paused,
      },
    }));
  },
}));
