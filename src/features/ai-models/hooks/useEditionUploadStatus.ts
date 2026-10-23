import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';

import { aiModelsApi } from '@/features/ai-models/api/aiModels.api';
import type { UploadStatus } from '@/features/ai-models/api/aiModels.api.types';
import {
  createUploadSession,
  UploadCancelledError,
  uploadEditionFile,
} from '@/features/ai-models/api/uploadEdition';
import {
  clearUploadFileFingerprint,
  saveUploadFileFingerprint,
} from '@/features/ai-models/api/uploadFingerprint.storage';
import type { Status } from '@/features/ai-models/domain/types';
import { getUploadKey } from '@/features/ai-models/domain/uploadKey';
import { decideUploadBootstrap } from '@/features/ai-models/domain/uploadLifecycle';
import { useEditionStatusStore } from '@/features/ai-models/store/useEditionStatusStore';
import { useLastSelectedFileStore } from '@/features/ai-models/store/useLastSelectedFileStore';
import {
  type IPendingUpload,
  usePendingUploadsStore,
} from '@/features/ai-models/store/usePendingUploadsStore';

export interface IEditionUploadProgress {
  uploaded: number;
  total: number;
}

export interface IUseEditionUploadStatusParams {
  orgId: string;
  modelId: string;
  edition: string | null;
  uploadId: string | null;
  initialStatus: UploadStatus | null;
  fileSize: number | null;
}

export interface IEditionUploadStatus {
  status: Status | null;
  progress: IEditionUploadProgress | null;
}

export function useEditionUploadStatus({
  orgId,
  modelId,
  edition,
  uploadId,
  initialStatus,
  fileSize,
}: IUseEditionUploadStatusParams): IEditionUploadStatus {
  const [status, setStatus] = useState<Status | null>(initialStatus);
  const [progress, setProgress] = useState<IEditionUploadProgress | null>(null);

  const epochRef = useRef(0);

  useEffect(() => {
    if (
      !initialStatus ||
      initialStatus === 'Uploaded' ||
      !edition ||
      !uploadId
    ) {
      return;
    }

    let active = true;

    let currentUploadController: AbortController | null = null;

    const key = getUploadKey(modelId, edition);

    const updateStatus = (next: Status) => {
      setStatus(next);
      useEditionStatusStore
        .getState()
        .SET_EDITION_STATUS(modelId, edition, next);
    };

    const resolvePendingUpload = (): IPendingUpload | null =>
      usePendingUploadsStore.getState().pendingUploads[key] ?? null;

    const drive = (pendingUpload: IPendingUpload) => {
      const epoch = ++epochRef.current;
      const isCurrent = () => active && epochRef.current === epoch;

      currentUploadController?.abort();

      const controller = new AbortController();
      currentUploadController = controller;

      usePendingUploadsStore.getState().REMOVE_PENDING_UPLOAD(modelId, edition);

      useLastSelectedFileStore
        .getState()
        .SET_LAST_SELECTED_FILE(modelId, edition, pendingUpload.file);

      saveUploadFileFingerprint(modelId, edition, uploadId, pendingUpload.file);

      (async () => {
        updateStatus('Uploading');

        setProgress((prev) =>
          prev && prev.total === pendingUpload.file.size
            ? prev
            : { uploaded: 0, total: pendingUpload.file.size }
        );

        try {
          await uploadEditionFile({
            orgId,
            modelId,
            edition,
            uploadId,
            file: pendingUpload.file,
            signal: controller.signal,
            onProgress: (uploaded, total) => {
              if (isCurrent()) setProgress({ uploaded, total });
            },
            onStatusChange: (nextStatus) => {
              if (isCurrent()) updateStatus(nextStatus);
            },
          });

          useLastSelectedFileStore
            .getState()
            .CLEAR_LAST_SELECTED_FILE(modelId, edition);

          clearUploadFileFingerprint(modelId, edition, uploadId);

          if (isCurrent()) updateStatus('Uploaded');
        } catch (error) {
          if (error instanceof UploadCancelledError) return;

          console.error(
            `[Upload AI model edition] modelId=${modelId} edition=${edition} failed`,
            error
          );

          if (isCurrent()) updateStatus('UploadFailed');
        }
      })();
    };

    const poll = () => {
      const epoch = ++epochRef.current;
      const isCurrent = () => active && epochRef.current === epoch;

      (async () => {
        try {
          const [offset, uploadStatus] = await Promise.all([
            aiModelsApi.getAiModelUploadOffset({
              orgId,
              modelId,
              edition,
              uploadId,
            }),
            aiModelsApi.getAiModelUploadStatus({
              orgId,
              modelId,
              edition,
              uploadId,
            }),
          ]);

          if (!isCurrent()) return;

          if (offset.uploadOffset != null && offset.uploadLength != null) {
            setProgress({
              uploaded: offset.uploadOffset,
              total: offset.uploadLength,
            });
          }

          updateStatus(uploadStatus.status);
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 404) {
            return;
          }

          console.error(
            `[Poll AI model upload] modelId=${modelId} edition=${edition} failed`,
            error
          );
        }
      })();
    };

    const createSession = (size: number) => {
      const epoch = ++epochRef.current;
      const isCurrent = () => active && epochRef.current === epoch;

      (async () => {
        try {
          await createUploadSession({
            orgId,
            modelId,
            edition,
            uploadId,
            fileSize: size,
          });
        } catch (error) {
          if (!isCurrent()) return;

          console.error(
            `[Create AI model upload session] modelId=${modelId} edition=${edition} failed`,
            error
          );
        }
      })();
    };

    queueMicrotask(() => {
      if (!active) return;

      const pendingUpload = resolvePendingUpload();

      const hasCachedFile = Boolean(
        useLastSelectedFileStore.getState().lastSelectedFiles[key]
      );

      const action = decideUploadBootstrap({
        initialStatus,
        hasPendingFile: pendingUpload !== null,
        hasCachedFile,
        fileSize,
      });

      if (pendingUpload && action === 'drive-pending-file') {
        drive(pendingUpload);
      } else if (fileSize != null && action === 'create-session') {
        createSession(fileSize);
      } else if (action === 'mark-interrupted') {
        updateStatus('Interrupted');
      } else if (action === 'poll-once') {
        poll();
      }
    });

    const unsubscribe = usePendingUploadsStore.subscribe((state) => {
      if (!active) return;

      const pendingUpload = state.pendingUploads[key];

      if (pendingUpload) drive(pendingUpload);
    });

    const unsubscribeStatus = useEditionStatusStore.subscribe((state) => {
      if (!active) return;

      const nextStatus = state.statusUpdates[key];

      if (nextStatus) setStatus(nextStatus);
    });

    return () => {
      active = false;
      epochRef.current += 1;
      currentUploadController?.abort();
      unsubscribe();
      unsubscribeStatus();
    };
  }, [orgId, modelId, edition, uploadId, initialStatus, fileSize]);

  return { status, progress };
}
