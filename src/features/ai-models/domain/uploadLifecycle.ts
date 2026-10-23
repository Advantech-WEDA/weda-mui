import type { Status } from './types';

export type UploadBootstrapAction =
  | 'idle'
  | 'drive-pending-file'
  | 'create-session'
  | 'mark-interrupted'
  | 'poll-once';

export interface IUploadBootstrapInput {
  initialStatus: Status | null;

  hasPendingFile: boolean;

  hasCachedFile: boolean;

  fileSize: number | null;
}

export function decideUploadBootstrap({
  initialStatus,
  hasPendingFile,
  hasCachedFile,
  fileSize,
}: IUploadBootstrapInput): UploadBootstrapAction {
  if (!initialStatus || initialStatus === 'Uploaded') return 'idle';

  if (hasPendingFile) return 'drive-pending-file';

  if (initialStatus === 'Pending' && fileSize != null) return 'create-session';

  if (initialStatus === 'Uploading') {
    return hasCachedFile ? 'poll-once' : 'mark-interrupted';
  }

  return 'poll-once';
}

export type UploadPollOutcome = 'complete' | 'failed' | 'in-progress';

export function classifyUploadPollStatus(status: Status): UploadPollOutcome {
  if (status === 'Uploaded') return 'complete';
  if (status === 'UploadFailed' || status === 'VerifyFailed') return 'failed';

  return 'in-progress';
}

export interface INeedsNewUploadSessionInput {
  status: Status;

  uploadExpiresAt: string | null | undefined;

  now: number;
}

export function needsNewUploadSession({
  status,
  uploadExpiresAt,
  now,
}: INeedsNewUploadSessionInput): boolean {
  if (status === 'UploadFailed' || status === 'VerifyFailed') return true;

  return uploadExpiresAt != null && new Date(uploadExpiresAt).getTime() <= now;
}

export type RestartUploadAction =
  | 'resume-live-transfer'
  | 'enqueue-cached-file'
  | 'ask-for-file';

export interface IRestartUploadInput {
  hasLiveControls: boolean;

  hasCachedFile: boolean;
}

export function decideRestartUpload({
  hasLiveControls,
  hasCachedFile,
}: IRestartUploadInput): RestartUploadAction {
  if (hasLiveControls) return 'resume-live-transfer';
  if (hasCachedFile) return 'enqueue-cached-file';

  return 'ask-for-file';
}
