import { create } from 'zustand';

import { getUploadKey } from '@/features/ai-models/domain/uploadKey';

interface ILastSelectedFileState {
  lastSelectedFiles: Record<string, File>;

  SET_LAST_SELECTED_FILE: (
    modelId: string,
    edition: string,
    file: File
  ) => void;
  CLEAR_LAST_SELECTED_FILE: (modelId: string, edition: string) => void;
}

export const useLastSelectedFileStore = create<ILastSelectedFileState>()(
  (set) => ({
    lastSelectedFiles: {},

    SET_LAST_SELECTED_FILE(modelId, edition, file) {
      set((state) => ({
        lastSelectedFiles: {
          ...state.lastSelectedFiles,
          [getUploadKey(modelId, edition)]: file,
        },
      }));
    },

    CLEAR_LAST_SELECTED_FILE(modelId, edition) {
      set((state) => {
        const key = getUploadKey(modelId, edition);
        const { [key]: _removed, ...rest } = state.lastSelectedFiles;

        return { lastSelectedFiles: rest };
      });
    },
  })
);
