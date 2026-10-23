import { apiPath } from '@shared/api/apiPath';
import { useIAmStore } from '@shared/session/useIAmStore';
import { isAxiosError } from 'axios';
import { Upload } from 'tus-js-client';

import { aiModelsApi } from '@/features/ai-models/api/aiModels.api';
import type {
  IAiModelUploadSessionResult,
  UploadStatus,
} from '@/features/ai-models/api/aiModels.api.types';
import {
  classifyUploadPollStatus,
  needsNewUploadSession,
} from '@/features/ai-models/domain/uploadLifecycle';
import { useAIModelsStore } from '@/features/ai-models/store/useAIModelsStore';
import { useUploadControlsStore } from '@/features/ai-models/store/useUploadControlsStore';

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 150; // ~5 minutes

const CHUNK_SIZE = 8 * 1024 * 1024;

export class UploadCancelledError extends Error {
  constructor() {
    super('Upload cancelled');
    this.name = 'UploadCancelledError';
  }
}

function sleepUnlessAborted(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new UploadCancelledError());
      return;
    }

    const timer = setTimeout(resolve, ms);

    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new UploadCancelledError());
      },
      { once: true }
    );
  });
}

export interface IUploadEditionFileParams {
  orgId: string;
  modelId: string;
  edition: string;
  uploadId: string;
  file: File;
  onProgress?: (bytesUploaded: number, bytesTotal: number) => void;
  onStatusChange?: (status: UploadStatus) => void;

  signal?: AbortSignal;
}

function getAuthHeaders(): Record<string, string> {
  const accessToken = useIAmStore.getState().userIAmToken?.accessToken;

  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

interface IPatchChunksViaTusParams {
  file: File;
  uploadUrl: string;
  orgId: string;
  modelId: string;
  edition: string;
  uploadId: string;
  onProgress?: (bytesSent: number, bytesTotal: number) => void;
  onStatusChange?: (status: UploadStatus) => void;
  signal?: AbortSignal;
}

function patchChunksViaTus({
  file,
  uploadUrl,
  orgId,
  modelId,
  edition,
  uploadId,
  onProgress,
  onStatusChange,
  signal,
}: IPatchChunksViaTusParams): Promise<void> {
  const { REGISTER_UPLOAD_CONTROLS, UNREGISTER_UPLOAD_CONTROLS } =
    useUploadControlsStore.getState();

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new UploadCancelledError());
      return;
    }

    const upload = new Upload(file, {
      uploadUrl,
      chunkSize: CHUNK_SIZE,
      retryDelays: [0, 1000, 3000, 5000],
      headers: getAuthHeaders(),
      onProgress,
      onError: (error) => {
        signal?.removeEventListener('abort', onAbort);
        UNREGISTER_UPLOAD_CONTROLS(modelId, edition);
        reject(error);
      },
      onSuccess: () => {
        signal?.removeEventListener('abort', onAbort);
        UNREGISTER_UPLOAD_CONTROLS(modelId, edition);
        resolve();
      },
    });

    const onAbort = () => {
      upload.abort();
      UNREGISTER_UPLOAD_CONTROLS(modelId, edition);
      reject(new UploadCancelledError());
    };

    signal?.addEventListener('abort', onAbort, { once: true });

    REGISTER_UPLOAD_CONTROLS(modelId, edition, {
      pause: async () => {
        upload.abort();

        const { status } = await useAIModelsStore
          .getState()
          .GET_AI_MODEL_UPLOAD_STATUS({ orgId, modelId, edition, uploadId });

        onStatusChange?.(status);
      },
      resume: () => upload.start(),
    });

    upload.start();
  });
}

interface IEnsureUploadSessionParams {
  orgId: string;
  modelId: string;
  edition: string;
  uploadId: string;
  fileSize: number;
  file: File;
}

async function ensureUploadSession({
  orgId,
  modelId,
  edition,
  uploadId,
  fileSize,
  file,
}: IEnsureUploadSessionParams): Promise<void> {
  let needsCreate = true;

  try {
    const { uploadOffset } = await aiModelsApi.getAiModelUploadOffset({
      orgId,
      modelId,
      edition,
      uploadId,
    });

    if (uploadOffset != null) {
      await aiModelsApi.patchAiModelUploadChunk({
        orgId,
        modelId,
        edition,
        uploadId,
        uploadOffset,
        chunk: file.slice(uploadOffset, uploadOffset + CHUNK_SIZE),
      });
    }

    const { status, uploadExpiresAt } =
      await aiModelsApi.getAiModelUploadStatus({
        orgId,
        modelId,
        edition,
        uploadId,
      });

    needsCreate = needsNewUploadSession({
      status,
      uploadExpiresAt,
      now: Date.now(),
    });
  } catch (error) {
    if (!isAxiosError(error) || error.response?.status !== 404) throw error;
  }

  if (needsCreate) {
    await useAIModelsStore.getState().POST_AI_MODEL_UPLOAD({
      orgId,
      modelId,
      edition,
      uploadId,
      uploadLength: fileSize,
    });
  }
}

interface ICreateUploadSessionParams {
  orgId: string;
  modelId: string;
  edition: string;
  uploadId: string;
  fileSize: number;
}

export async function createUploadSession({
  orgId,
  modelId,
  edition,
  uploadId,
  fileSize,
}: ICreateUploadSessionParams): Promise<IAiModelUploadSessionResult> {
  return useAIModelsStore.getState().POST_AI_MODEL_UPLOAD({
    orgId,
    modelId,
    edition,
    uploadId,
    uploadLength: fileSize,
  });
}

export async function uploadEditionFile({
  orgId,
  modelId,
  edition,
  uploadId,
  file,
  onProgress,
  onStatusChange,
  signal,
}: IUploadEditionFileParams): Promise<void> {
  if (signal?.aborted) throw new UploadCancelledError();

  const { GET_AI_MODEL_UPLOAD_STATUS } = useAIModelsStore.getState();

  await ensureUploadSession({
    orgId,
    modelId,
    edition,
    uploadId,
    fileSize: file.size,
    file,
  });

  if (signal?.aborted) throw new UploadCancelledError();

  const uploadUrl = apiPath(
    `/api/v1/orgs/${orgId}/ai-models/${modelId}/editions/${edition}/uploads/${uploadId}`
  );

  await patchChunksViaTus({
    file,
    uploadUrl,
    orgId,
    modelId,
    edition,
    uploadId,
    onProgress,
    onStatusChange,
    signal,
  });

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    if (signal?.aborted) throw new UploadCancelledError();

    const { status } = await GET_AI_MODEL_UPLOAD_STATUS({
      orgId,
      modelId,
      edition,
      uploadId,
    });

    onStatusChange?.(status);

    const outcome = classifyUploadPollStatus(status);

    if (outcome === 'complete') return;

    if (outcome === 'failed') {
      throw new Error(`File upload failed (${status}).`);
    }

    await sleepUnlessAborted(POLL_INTERVAL_MS, signal);
  }

  throw new Error('Timed out waiting for file upload to complete.');
}
