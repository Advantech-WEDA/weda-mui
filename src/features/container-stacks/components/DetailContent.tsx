import { Button } from '@mui/material';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { DetailPageLayout, SvgIcon } from '@shared/ui';
import { useParams } from 'react-router-dom';

import type { ICreateStackConfigPayload } from '../api/stacks.api.types';
import Deployments from './Detail/Deployments/Index';
import Information from './Detail/Information/Index';

interface IProps {
  tab?: string;
  hasPermission: boolean;
  stackData: ICreateStackConfigPayload;
  onChangeTab: (tab: string) => void;
  onEdit: (stackConfigId?: string, stackRevisionId?: string) => void;
  onOpenDeleteDialog?: () => void | Promise<void>;
}

export default function DetailContent({
  tab,
  hasPermission,
  stackData,
  onChangeTab,
  onEdit,
  onOpenDeleteDialog,
}: IProps) {
  const tabs = [
    {
      label: 'Information',
      value: 'Information',
      component: (
        <Information key={stackData?.stackName} stackData={stackData} />
      ),
    },
    {
      label: 'Deployments',
      value: 'Deployments',
      component: <Deployments />,
    },
  ];

  const { stackRevisionId, stackConfigId } = useParams<{
    stackRevisionId: string;
    stackConfigId: string;
  }>();

  const navigate = useAppNavigate();

  const handleBack = () => {
    navigate('/container-stacks');
  };

  return (
    <DetailPageLayout
      title={stackData.stackName ?? '-'}
      onBack={handleBack}
      tabs={tabs}
      activeTab={tab ?? 'Information'}
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
            onClick={() => onEdit(stackConfigId, stackRevisionId)}
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
                name={'DeleteOutlined'}
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
