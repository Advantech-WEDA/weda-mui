import { Button, Tooltip } from '@mui/material';
import { DetailPageLayout, SvgIcon } from '@shared/ui';

import type { useDataStreamDetailPage } from '@/features/devices/hooks/useDataStreamDetailPage';

import Information from './Information';
import RelatedAnalyzer from './RelatedAnalyzer';

type IProps = Pick<
  ReturnType<typeof useDataStreamDetailPage>,
  | 'dataStream'
  | 'loading'
  | 'activeTab'
  | 'canEdit'
  | 'canDelete'
  | 'editDisabledReason'
  | 'deleteDisabledReason'
  | 'handleBack'
  | 'handleChangeTab'
  | 'handleEdit'
  | 'handleOpenDelete'
>;

const actionIconColor = (enabled: boolean) =>
  enabled ? 'var(--primary-main)' : 'var(--action-disabled)';

export default function DetailContent({
  dataStream,
  loading,
  activeTab,
  canEdit,
  canDelete,
  editDisabledReason,
  deleteDisabledReason,
  handleBack,
  handleChangeTab,
  handleEdit,
  handleOpenDelete,
}: IProps) {
  const tabs = [
    {
      label: 'Information',
      value: 'Information',
      component: <Information dataStream={dataStream} loading={loading} />,
    },
    {
      label: 'Related analyzer',
      value: 'RelatedAnalyzer',
      component: <RelatedAnalyzer dataStream={dataStream} loading={loading} />,
    },
  ];

  return (
    <DetailPageLayout
      title={dataStream?.displayName || dataStream?.dataStreamName || '-'}
      onBack={handleBack}
      tabs={tabs}
      activeTab={activeTab}
      onChangeTab={handleChangeTab}
      contentKey={dataStream?.dataStreamId}
      actions={
        <>
          <Tooltip title={editDisabledReason ?? ''}>
            <span style={{ display: 'inline-flex' }}>
              <Button
                variant="outlined"
                disabled={!canEdit}
                startIcon={
                  <SvgIcon
                    name="EditOutlined"
                    sx={{ color: actionIconColor(canEdit) }}
                  />
                }
                onClick={handleEdit}
              >
                Edit
              </Button>
            </span>
          </Tooltip>

          <Tooltip title={deleteDisabledReason ?? ''}>
            <span style={{ display: 'inline-flex' }}>
              <Button
                variant="outlined"
                className="detail-page__header-actions-btn-submit"
                disabled={!canDelete}
                startIcon={
                  <SvgIcon
                    name="DeleteOutlined"
                    sx={{ color: actionIconColor(canDelete) }}
                  />
                }
                onClick={handleOpenDelete}
              >
                Delete
              </Button>
            </span>
          </Tooltip>
        </>
      }
    />
  );
}
