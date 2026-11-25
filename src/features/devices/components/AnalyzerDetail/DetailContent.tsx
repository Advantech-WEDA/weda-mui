import { Box, Button, Tooltip } from '@mui/material';
import {
  DetailPageLayout,
  PageTableLoadingIndicator,
  SvgIcon,
} from '@shared/ui';

import type { useAnalyzerDetailPage } from '@/features/devices/hooks/useAnalyzerDetailPage';

import AnalyzerDetailBody from './AnalyzerDetailBody';

type IProps = Pick<
  ReturnType<typeof useAnalyzerDetailPage>,
  | 'analyzer'
  | 'loading'
  | 'dataStreamsById'
  | 'canEdit'
  | 'canDelete'
  | 'editDisabledReason'
  | 'deleteDisabledReason'
  | 'handleBack'
  | 'handleEdit'
  | 'handleOpenDelete'
>;

const actionIconColor = (enabled: boolean) =>
  enabled ? 'var(--primary-main)' : 'var(--action-disabled)';

export default function DetailContent({
  analyzer,
  loading,
  dataStreamsById,
  canEdit,
  canDelete,
  editDisabledReason,
  deleteDisabledReason,
  handleBack,
  handleEdit,
  handleOpenDelete,
}: IProps) {
  const renderBody = () => {
    if (loading) {
      return (
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
          <PageTableLoadingIndicator />
        </Box>
      );
    }

    if (!analyzer) return null;

    return (
      <AnalyzerDetailBody
        analyzer={analyzer}
        dataStreamsById={dataStreamsById}
      />
    );
  };

  const tabs = [
    { label: 'Information', value: 'Information', component: renderBody() },
  ];

  return (
    <DetailPageLayout
      title={analyzer?.name || '-'}
      onBack={handleBack}
      tabs={tabs}
      activeTab="Information"
      onChangeTab={() => {}}
      contentKey={analyzer?.analyzerId}
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
