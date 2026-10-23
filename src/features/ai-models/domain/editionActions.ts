import type { Status } from '@/features/ai-models/domain/types';

export type EditionAction =
  | 'pause'
  | 'resume'
  | 'reupload'
  | 'uploadAgain'
  | 'editEdition'
  | 'deploy'
  | 'cancel'
  | 'delete';

export const EDITION_STATUS_ACTION_MAP: Record<
  Status,
  Record<EditionAction, boolean>
> = {
  Pending: {
    pause: false,
    resume: false,
    reupload: true,
    uploadAgain: false,
    editEdition: false,
    deploy: false,
    cancel: false,
    delete: true,
  },
  Uploading: {
    pause: true,
    resume: true,
    reupload: false,
    uploadAgain: false,
    editEdition: false,
    deploy: false,
    cancel: true,
    delete: false,
  },
  Verifying: {
    pause: false,
    resume: false,
    reupload: false,
    uploadAgain: false,
    editEdition: false,
    deploy: false,
    cancel: false,
    delete: false,
  },
  Uploaded: {
    pause: false,
    resume: false,
    reupload: false,
    uploadAgain: false,
    editEdition: true,
    deploy: true,
    cancel: false,
    delete: true,
  },
  UploadFailed: {
    pause: false,
    resume: false,
    reupload: false,
    uploadAgain: true,
    editEdition: false,
    deploy: false,
    cancel: false,
    delete: true,
  },
  VerifyFailed: {
    pause: false,
    resume: false,
    reupload: false,
    uploadAgain: true,
    editEdition: false,
    deploy: false,
    cancel: false,
    delete: true,
  },
  Interrupted: {
    pause: false,
    resume: true,
    reupload: false,
    uploadAgain: false,
    editEdition: false,
    deploy: false,
    cancel: false,
    delete: true,
  },
};

export const getVisibleEditionActions = (
  status: Status | null
): EditionAction[] => {
  if (!status) return [];

  const permissions = EDITION_STATUS_ACTION_MAP[status];

  return (Object.keys(permissions) as EditionAction[]).filter(
    (action) => permissions[action]
  );
};
