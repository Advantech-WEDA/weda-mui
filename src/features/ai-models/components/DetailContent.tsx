import { Button } from '@mui/material';
import { DetailPageLayout, SvgIcon } from '@shared/ui';

import type {
  IAiModelEditionDetail,
  IAiModelItem,
} from '../api/aiModels.api.types';
import Deployments from './Detail/Deployments/Index';
import Information from './Detail/Information/Index';

interface IProps {
  tab: string;
  hasPermission: boolean;
  modelItem: IAiModelItem | null;
  editionDetail: IAiModelEditionDetail | null;
  onChangeTab: (tab: string) => void;
  onBack: () => void;
  onEdit: () => void;
  onOpenDeleteDialog: () => void;
}

export default function DetailContent({
  tab,
  hasPermission,
  modelItem,
  editionDetail,
  onChangeTab,
  onBack,
  onEdit,
  onOpenDeleteDialog,
}: IProps) {
  const tabs = [
    {
      label: 'Information',
      value: 'Information',
      component: (
        <Information
          key={`${editionDetail?.modelId}-${editionDetail?.edition}`}
          modelItem={modelItem}
          editionDetail={editionDetail}
        />
      ),
    },
    {
      label: 'Deployments',
      value: 'Deployments',
      component: <Deployments />,
    },
  ];

  return (
    <DetailPageLayout
      title={editionDetail?.edition ?? '-'}
      onBack={onBack}
      tabs={tabs}
      activeTab={tab}
      onChangeTab={onChangeTab}
      actions={
        <>
          <Button
            variant="outlined"
            disabled={!hasPermission}
            startIcon={
              <SvgIcon
                name="EditOutlined"
                sx={{
                  color: hasPermission
                    ? 'var(--primary-main)'
                    : 'var(--action-disabled)',
                }}
              />
            }
            onClick={onEdit}
          >
            Edit
          </Button>

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
