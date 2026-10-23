import { type SvgIcon } from '@shared/ui';
import type { ComponentProps } from 'react';

import type { EditionAction } from '@/features/ai-models/domain/editionActions';

type SvgIconName = ComponentProps<typeof SvgIcon>['name'];

export const EDITION_ACTION_LABEL_MAP: Record<EditionAction, string> = {
  pause: 'Pause',
  resume: 'Resume',
  reupload: 'Reupload',
  uploadAgain: 'Upload again',
  editEdition: 'Edit edition',
  deploy: 'Deploy',
  cancel: 'Cancel',
  delete: 'Delete',
};

export const EDITION_ACTION_ICON_MAP: Record<EditionAction, SvgIconName> = {
  pause: 'PauseCircleOutlined',
  resume: 'RestartAltOutlined',
  reupload: 'FileUploadOutlined',
  uploadAgain: 'FileUploadOutlined',
  editEdition: 'EditOutlined',
  deploy: 'InstallDesktopOutlined',
  cancel: 'CancelFilled',
  delete: 'DeleteOutlined',
};
