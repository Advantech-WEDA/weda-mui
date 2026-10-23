import { AppChip } from '@shared/ui';

import type { UploadStatus } from '@/features/ai-models/api/aiModels.api.types';
import { uploadStatusChipProps } from '@/features/ai-models/components/uploadStatusDisplay';
import { useEditionUploadStatus } from '@/features/ai-models/hooks/useEditionUploadStatus';

interface IProps {
  orgId: string;
  modelId: string;
  edition: string | null;
  uploadId: string | null;
  initialStatus: UploadStatus | null;
  fileSize: number | null;
}

export default function EditionUploadStatusCell(props: IProps) {
  const { status, progress } = useEditionUploadStatus(props);

  if (!status) return '-';

  if (status === 'Uploading' && progress && progress.total > 0) {
    const percent = Math.round((progress.uploaded / progress.total) * 100);

    return (
      <AppChip
        {...uploadStatusChipProps('Uploading')}
        label={`Uploading... ${percent}%`}
      />
    );
  }

  return <AppChip {...uploadStatusChipProps(status)} />;
}
