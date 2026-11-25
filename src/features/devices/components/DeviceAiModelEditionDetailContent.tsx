import {
  AiModelEditionInformation,
  type IAiModelEditionDetail,
  type IAiModelItem,
} from '@features/ai-models';
import { Button } from '@mui/material';
import { DetailPageLayout, SvgIcon } from '@shared/ui';

interface IProps {
  hasPermission: boolean;
  modelItem: IAiModelItem | null;
  editionDetail: IAiModelEditionDetail | null;
  onBack: () => void;
  onOpenDeleteDialog: () => void;
}

export default function DeviceAiModelEditionDetailContent({
  hasPermission,
  modelItem,
  editionDetail,
  onBack,
  onOpenDeleteDialog,
}: IProps) {
  const title = `${editionDetail?.modelName ?? modelItem?.modelName ?? '-'} / ${editionDetail?.edition ?? '-'}`;

  return (
    <DetailPageLayout
      title={title}
      onBack={onBack}
      tabs={[
        {
          label: 'Information',
          value: 'Information',
          component: (
            <AiModelEditionInformation
              key={`${editionDetail?.modelId}-${editionDetail?.edition}`}
              modelItem={modelItem}
              editionDetail={editionDetail}
            />
          ),
        },
      ]}
      activeTab="Information"
      onChangeTab={() => {}}
      actions={
        <>
          <Button
            variant="outlined"
            className="detail-page__header-actions-btn-submit"
            onClick={onOpenDeleteDialog}
            disabled={!hasPermission}
            startIcon={
              <SvgIcon
                name="DeleteOutlined"
                sx={{
                  color: hasPermission
                    ? 'var(--primary-main)'
                    : 'var(--action-disabled)',
                }}
              />
            }
          >
            Delete
          </Button>
        </>
      }
    />
  );
}
