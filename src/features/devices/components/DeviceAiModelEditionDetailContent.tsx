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
  canRedeploy: boolean;
  onBack: () => void;
  onRedeploy: () => void;
  onOpenDeleteDialog: () => void;
}

export default function DeviceAiModelEditionDetailContent({
  hasPermission,
  modelItem,
  editionDetail,
  canRedeploy,
  onBack,
  onRedeploy,
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
          {canRedeploy && (
            <Button
              variant="outlined"
              disabled={!hasPermission}
              startIcon={
                <SvgIcon
                  name="RestartAltOutlined"
                  sx={{
                    color: hasPermission
                      ? 'var(--primary-main)'
                      : 'var(--action-disabled)',
                  }}
                />
              }
              onClick={onRedeploy}
            >
              Redeploy
            </Button>
          )}

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
