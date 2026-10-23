import { create } from 'zustand';

import type { UploadStatus } from '@/features/ai-models/api/aiModels.api.types';
import type { Status } from '@/features/ai-models/domain/types';
import { getUploadKey } from '@/features/ai-models/domain/uploadKey';

interface IEditionStatusState {
  statusUpdates: Record<string, Status>;

  SET_EDITION_STATUS: (
    modelId: string,
    edition: string,
    status: Status
  ) => void;
}

export function getEffectiveEditionStatus<
  T extends {
    modelId: string;
    edition: string | null;
    status: UploadStatus | null;
  },
>(editionRow: T, statusUpdates: Record<string, Status>): Status | null {
  return (
    (editionRow.edition &&
      statusUpdates[getUploadKey(editionRow.modelId, editionRow.edition)]) ||
    editionRow.status
  );
}

export const useEditionStatusStore = create<IEditionStatusState>()((set) => ({
  statusUpdates: {},

  SET_EDITION_STATUS(modelId, edition, status) {
    set((state) => ({
      statusUpdates: {
        ...state.statusUpdates,
        [getUploadKey(modelId, edition)]: status,
      },
    }));
  },
}));
