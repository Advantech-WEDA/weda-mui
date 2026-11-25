import { Box, Button, Typography } from '@mui/material';
import { DetailPageLayout, SvgIcon } from '@shared/ui';

import type { IMqttBrokerDetail } from '../api/mqttBrokers.api.types';
import type { MqttBrokerDetailLoadState } from '../hooks/useMqttBrokerDetailPage';
import Information from './Detail/Information';

interface IProps {
  hasPermission: boolean;
  brokerData: IMqttBrokerDetail | null;
  loadState: MqttBrokerDetailLoadState;
  onBack: () => void;
  onRetry: () => void;
  onEdit: () => void;
  onOpenDeleteDialog?: () => void | Promise<void>;
}

function LoadFailedState({
  loadState,
  onBack,
  onRetry,
}: {
  loadState: 'notFound' | 'error';
  onBack: () => void;
  onRetry: () => void;
}) {
  const isNotFound = loadState === 'notFound';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        minHeight: 400,
        textAlign: 'center',
      }}
    >
      <Typography variant="h5">
        {isNotFound ? (
          <>MQTT broker not found</>
        ) : (
          <>Couldn't load MQTT broker</>
        )}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {isNotFound
          ? 'This broker config may have been deleted or the link is incorrect.'
          : 'Something went wrong while loading this broker. Please try again.'}
      </Typography>
      <Button
        variant="outlined"
        sx={{ mt: 1, textTransform: 'none' }}
        onClick={isNotFound ? onBack : onRetry}
      >
        {isNotFound ? 'Back to MQTT Brokers' : 'Retry'}
      </Button>
    </Box>
  );
}

export default function DetailContent({
  hasPermission,
  brokerData,
  loadState,
  onBack,
  onRetry,
  onEdit,
  onOpenDeleteDialog,
}: IProps) {
  const isLoaded = loadState === 'loaded' && brokerData !== null;
  const editEnabled = hasPermission && isLoaded;

  const isInUse = brokerData?.isInUse ?? false;
  const deleteEnabled = hasPermission && isLoaded && !isInUse;

  const tabs = [
    {
      label: 'Information',
      value: 'Information',
      component:
        loadState === 'notFound' || loadState === 'error' ? (
          <LoadFailedState
            loadState={loadState}
            onBack={onBack}
            onRetry={onRetry}
          />
        ) : (
          <Information brokerData={brokerData} />
        ),
    },
  ];

  return (
    <DetailPageLayout
      title={brokerData?.name || '-'}
      onBack={onBack}
      tabs={tabs}
      activeTab="Information"
      onChangeTab={() => {}}
      actions={
        <>
          <Button
            variant="outlined"
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
