import { useNotification } from '@shared/ui';
import { type ChangeEvent, useRef } from 'react';

import type {
  AiModelEditionWithDeviceCount,
  AiModelWithEditions,
  IAiModelEditionListItem,
} from '@/features/ai-models/api/aiModels.api.types';
import {
  clearUploadFileFingerprint,
  readUploadFileFingerprint,
} from '@/features/ai-models/api/uploadFingerprint.storage';
import type { EditionAction } from '@/features/ai-models/domain/editionActions';
import type { Status } from '@/features/ai-models/domain/types';
import { isSameUploadFile } from '@/features/ai-models/domain/uploadFileFingerprint';
import { getUploadKey } from '@/features/ai-models/domain/uploadKey';
import { decideRestartUpload } from '@/features/ai-models/domain/uploadLifecycle';
import { useAIModelsStore } from '@/features/ai-models/store/useAIModelsStore';
import {
  getEffectiveEditionStatus,
  useEditionStatusStore,
} from '@/features/ai-models/store/useEditionStatusStore';
import { useLastSelectedFileStore } from '@/features/ai-models/store/useLastSelectedFileStore';
import { usePendingUploadsStore } from '@/features/ai-models/store/usePendingUploadsStore';
import { useUploadControlsStore } from '@/features/ai-models/store/useUploadControlsStore';

export interface IUseAiModelTableRowParams {
  row: AiModelWithEditions;
  onEditEdition: (modelId: string, edition: string) => void;
  onDeploy: (modelId: string, edition: string) => void;
  onDeleteEdition: (edition: IAiModelEditionListItem) => void;
}

export function useAiModelTableRow({
  row,
  onEditEdition,
  onDeploy,
  onDeleteEdition,
}: IUseAiModelTableRowParams) {
  const { showError } = useNotification();

  const editionStatusUpdates = useEditionStatusStore((s) => s.statusUpdates);
  const pausedEditions = useUploadControlsStore((s) => s.pausedEditions);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const reuploadTargetRef = useRef<AiModelEditionWithDeviceCount | null>(null);
  const reuploadModeRef = useRef<'resume' | 'replace'>('replace');

  const getEffectiveStatus = (
    editionRow: AiModelEditionWithDeviceCount
  ): Status | null =>
    getEffectiveEditionStatus(editionRow, editionStatusUpdates);

  const isEditionPaused = (
    editionRow: AiModelEditionWithDeviceCount
  ): boolean => {
    if (!editionRow.edition) return false;

    const key = getUploadKey(editionRow.modelId, editionRow.edition);

    return Boolean(pausedEditions[key]);
  };

  const handleReuploadFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const target = reuploadTargetRef.current;
    const mode = reuploadModeRef.current;
    const file = e.target.files?.[0] ?? null;

    e.target.value = '';

    if (!target?.edition || !target.uploadId || !file) return;

    const savedFingerprint = readUploadFileFingerprint(
      target.modelId,
      target.edition,
      target.uploadId
    );

    if (mode === 'resume' && !isSameUploadFile(savedFingerprint, file)) {
      showError(
        'Please select the same file to resume this upload. Use "Upload again" to start over with a different file.'
      );
      return;
    }

    usePendingUploadsStore.getState().ADD_PENDING_UPLOAD({
      orgId: target.orgId,
      modelId: target.modelId,
      edition: target.edition,
      file,
    });
  };

  const handleEditionAction = (
    action: EditionAction,
    edition: AiModelEditionWithDeviceCount
  ) => {
    switch (action) {
      case 'deploy':
        onDeploy(row.modelId, edition.edition!);
        return;
      case 'editEdition':
        onEditEdition(row.modelId, edition.edition!);
        return;
      case 'delete':
        onDeleteEdition(edition);
        return;
      case 'pause': {
        if (!edition.edition) return;

        const key = getUploadKey(edition.modelId, edition.edition);

        useUploadControlsStore
          .getState()
          .uploadControls[key]?.pause()
          .catch((error: unknown) => {
            const message =
              error instanceof Error
                ? error.message
                : 'Failed to refresh upload status';

            showError(message);
          });
        useUploadControlsStore
          .getState()
          .SET_UPLOAD_PAUSED(edition.modelId, edition.edition, true);
        return;
      }
      case 'cancel': {
        if (!edition.edition || !edition.uploadId) return;

        const { modelId, edition: editionName, uploadId, orgId } = edition;
        const key = getUploadKey(modelId, editionName);

        useUploadControlsStore.getState().uploadControls[key]?.pause();
        useUploadControlsStore
          .getState()
          .UNREGISTER_UPLOAD_CONTROLS(modelId, editionName);
        useUploadControlsStore
          .getState()
          .SET_UPLOAD_PAUSED(modelId, editionName, false);

        useAIModelsStore
          .getState()
          .DELETE_AI_MODEL_UPLOAD({
            orgId,
            modelId,
            edition: editionName,
            uploadId,
          })
          .then(() =>
            useAIModelsStore.getState().GET_AI_MODEL_UPLOAD_STATUS({
              orgId,
              modelId,
              edition: editionName,
              uploadId,
            })
          )
          .then(({ status }) => {
            useEditionStatusStore
              .getState()
              .SET_EDITION_STATUS(modelId, editionName, status);
            clearUploadFileFingerprint(modelId, editionName, uploadId);
          })
          .catch((error: unknown) => {
            const message =
              error instanceof Error ? error.message : 'Cancel upload failed';

            showError(message);
          });
        return;
      }

      case 'uploadAgain': {
        if (!edition.edition || !edition.uploadId) return;

        reuploadTargetRef.current = edition;
        reuploadModeRef.current = 'replace';
        fileInputRef.current?.click();
        return;
      }

      case 'reupload':
      case 'resume': {
        if (!edition.edition || !edition.uploadId) return;

        const { orgId, modelId, edition: editionName } = edition;
        const key = getUploadKey(modelId, editionName);
        const controls = useUploadControlsStore.getState().uploadControls[key];
        const cachedFile =
          useLastSelectedFileStore.getState().lastSelectedFiles[key];

        switch (
          decideRestartUpload({
            hasLiveControls: Boolean(controls),
            hasCachedFile: Boolean(cachedFile),
          })
        ) {
          case 'resume-live-transfer':
            controls?.resume();
            useUploadControlsStore
              .getState()
              .SET_UPLOAD_PAUSED(modelId, editionName, false);
            useEditionStatusStore
              .getState()
              .SET_EDITION_STATUS(modelId, editionName, 'Uploading');
            return;

          case 'enqueue-cached-file':
            useUploadControlsStore
              .getState()
              .SET_UPLOAD_PAUSED(modelId, editionName, false);
            usePendingUploadsStore.getState().ADD_PENDING_UPLOAD({
              orgId,
              modelId,
              edition: editionName,
              file: cachedFile,
            });
            return;

          case 'ask-for-file':
            reuploadTargetRef.current = edition;
            reuploadModeRef.current =
              action === 'resume' ? 'resume' : 'replace';
            fileInputRef.current?.click();
            return;
        }
      }
    }
  };

  return {
    fileInputRef,
    getEffectiveStatus,
    isEditionPaused,
    handleReuploadFileSelected,
    handleEditionAction,
  };
}
