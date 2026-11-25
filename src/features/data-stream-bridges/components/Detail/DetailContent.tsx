import { Button } from '@mui/material';
import { DetailPageLayout, SvgIcon } from '@shared/ui';

import type { IDataStreamBridgeDetail } from '../../api/dataStreamBridges.api.types';
import DataStreams from './DataStreams';
import Information from './Information';

interface IProps {
  bridgeId?: string;
  activeTab: string;
  loading: boolean;
  hasPermission: boolean;
  bridgeData: IDataStreamBridgeDetail | null;
  lastUpdated: Date | null;
  toggling: boolean;
  fetchBridge: (options?: {
    signal?: AbortSignal;
    silent?: boolean;
  }) => Promise<boolean>;
  onChangeTab: (tab: string) => void;
  onBack: () => void;
  onEdit: () => void;
  onOpenDeleteDialog: () => void;
  onToggleEnabled: () => void;
}

export default function DetailContent({
  bridgeId,
  activeTab,
  loading,
  hasPermission,
  bridgeData,
  lastUpdated,
  toggling,
  fetchBridge,
  onChangeTab,
  onBack,
  onEdit,
  onOpenDeleteDialog,
  onToggleEnabled,
}: IProps) {
  const editEnabled = hasPermission && !!bridgeData && !bridgeData.isEnabled;
  const deleteEnabled = editEnabled;

  const tabs = [
    {
      label: 'Information',
      value: 'Information',
      component: (
        <Information
          bridgeData={bridgeData}
          hasPermission={hasPermission}
          toggling={toggling}
          onToggleEnabled={onToggleEnabled}
        />
      ),
    },
    {
      label: 'DataStreams',
      value: 'DataStreams',
      component: (
        <DataStreams
          bridgeId={bridgeId}
          bridgeData={bridgeData}
          loading={loading}
          hasPermission={hasPermission}
          lastUpdated={lastUpdated}
          fetchBridge={fetchBridge}
        />
      ),
    },
  ];

  return (
    <DetailPageLayout
      title={bridgeData?.name || '-'}
      onBack={onBack}
      tabs={tabs}
      activeTab={activeTab}
      onChangeTab={onChangeTab}
      actions={
        <>
          <Button
            variant="outlined"
            title={
              bridgeData?.isEnabled
                ? 'Disable the bridge before editing'
                : undefined
            }
            disabled={!editEnabled}
            startIcon={
              <SvgIcon
                name="EditOutlined"
                sx={{
                  color: editEnabled
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
            title={
              bridgeData?.isEnabled
                ? 'Disable the bridge before deleting'
                : undefined
            }
            onClick={onOpenDeleteDialog}
            disabled={!deleteEnabled}
            startIcon={
              <SvgIcon
                name="DeleteOutlined"
                sx={{
                  color: deleteEnabled
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
