import type {
  IAiModelDeviceDeploymentsResponse,
  IGetAiModelDeviceDeploymentsParams,
} from '@features/ai-models';
import type { IGetListStacksInDeviceParams } from '@features/container-stacks';
import { Button } from '@mui/material';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { DetailPageLayout, SvgIcon } from '@shared/ui';
import { useParams } from 'react-router-dom';

import type {
  IDataStreamsLatestResponse,
  IDeviceCapabilityItem,
  IDeviceItem,
} from '../api/devices.api.types';
import {
  ACTIVATION_ACTION_LABEL_MAP,
  canDeleteDevice,
  getActivationAction,
} from '../domain/devicePolicy';
import { ACTIVATION_ACTION_ICON_MAP } from './activationActionDisplay';
import AiModels from './Detail/AiModels/Index';
import Deployments from './Detail/Deployments/Index';
import Information from './Detail/Information/Index';
import Overview from './Detail/Overview/Index';
import Telemetry from './Detail/Telemetry/Index';

interface IProps {
  tab?: string;
  deviceData?: IDeviceItem;
  hasPermission: boolean;
  hasDeletePermission: boolean;
  canChangeActivation: boolean;
  isNodeTabDisabled: boolean;
  isTelemetryTabDisabled: boolean;
  deviceLatestData: IDataStreamsLatestResponse | null;
  capabilityItems: IDeviceCapabilityItem | null;
  latestLoading: boolean;
  deploymentItems: Parameters<typeof Deployments>[0]['deploymentItems'];
  deploymentLoading: boolean;
  deploymentTotalCount: number;
  telemetryTableLoading: boolean;
  aiModelDeviceDeploymentsList: IAiModelDeviceDeploymentsResponse | null;
  aiModelsLoading: boolean;
  deploymentsRowsPerPage: number;
  setDeploymentsRowsPerPage: (rows: number) => void;
  aiModelsRowsPerPage: number;
  setAiModelsRowsPerPage: (rows: number) => void;
  fetchDeployments: (
    params: Omit<IGetListStacksInDeviceParams, 'deviceId'>,
    signal?: AbortSignal
  ) => Promise<unknown>;
  fetchTelemetryTable: (
    latestData?: IDataStreamsLatestResponse
  ) => Promise<unknown>;
  fetchDeviceAiModels: (
    params: Omit<IGetAiModelDeviceDeploymentsParams, 'deviceId'>,
    signal?: AbortSignal
  ) => Promise<unknown>;
  onChangeTab: (tab: string) => void;
  onEdit: (device: IDeviceItem | undefined) => void;
  onOpenStatusDialog?: () => void | Promise<void>;
  onOpenDeleteDialog?: () => void | Promise<void>;
}

export default function DetailContent({
  tab,
  deviceData,
  hasPermission,
  hasDeletePermission,
  canChangeActivation,
  isNodeTabDisabled,
  isTelemetryTabDisabled,
  deviceLatestData,
  capabilityItems,
  latestLoading,
  deploymentItems,
  deploymentLoading,
  deploymentTotalCount,
  telemetryTableLoading,
  aiModelDeviceDeploymentsList,
  aiModelsLoading,
  deploymentsRowsPerPage,
  setDeploymentsRowsPerPage,
  aiModelsRowsPerPage,
  setAiModelsRowsPerPage,
  fetchDeployments,
  fetchTelemetryTable,
  fetchDeviceAiModels,
  onChangeTab,
  onEdit,
  onOpenStatusDialog,
  onOpenDeleteDialog,
}: IProps) {
  const navigate = useAppNavigate();
  const canDelete = hasDeletePermission && canDeleteDevice(deviceData?.status);
  const activationAction = getActivationAction(deviceData?.status);

  const { deviceId } = useParams<{
    tenant: string;
    deviceId: string;
  }>();

  const tabs = [
    {
      label: 'Overview',
      value: 'Overview',
      component: (
        <Overview deviceLatestData={deviceLatestData} loading={latestLoading} />
      ),
    },
    {
      label: 'Information',
      value: 'Information',
      component: (
        <Information
          deviceData={deviceData}
          deviceLatestData={deviceLatestData}
          capabilityItems={capabilityItems}
        />
      ),
    },
    {
      label: 'Telemetry',
      value: 'Telemetry',
      disabled: isTelemetryTabDisabled,
      component: (
        <Telemetry
          loading={telemetryTableLoading || latestLoading}
          onFetchTelemetryTable={fetchTelemetryTable}
        />
      ),
    },
    {
      label: 'Container Stacks',
      value: 'ContainerStacks',
      disabled: isNodeTabDisabled,
      component: (
        <Deployments
          deploymentItems={deploymentItems}
          loading={deploymentLoading}
          totalCount={deploymentTotalCount}
          rowsPerPage={deploymentsRowsPerPage}
          onRowsPerPageChange={setDeploymentsRowsPerPage}
          onFetchDeployments={fetchDeployments}
        />
      ),
    },
    {
      label: 'AI Models',
      value: 'AiModels',
      disabled: isNodeTabDisabled,
      component: (
        <AiModels
          aiModelDeviceDeploymentsList={aiModelDeviceDeploymentsList}
          loading={aiModelsLoading}
          rowsPerPage={aiModelsRowsPerPage}
          onRowsPerPageChange={setAiModelsRowsPerPage}
          onFetchDeviceAiModels={fetchDeviceAiModels}
        />
      ),
    },
  ];

  const getActionIconColor = (enabled: boolean) =>
    enabled ? 'var(--primary-main)' : 'var(--action-disabled)';

  const handleBack = () => {
    navigate('/devices');
  };

  const handleChangeTab = (value: string) => {
    onChangeTab(value);
  };

  return (
    <DetailPageLayout
      title={deviceData?.deviceName ?? '-'}
      onBack={handleBack}
      tabs={tabs}
      activeTab={tab ?? 'Overview'}
      onChangeTab={handleChangeTab}
      contentKey={deviceId}
      actions={
        <>
          <Button
            variant="outlined"
            disabled={!hasPermission}
            startIcon={
              <SvgIcon
                name="EditOutlined"
                fillOpacity={1}
                sx={{
                  color: getActionIconColor(hasPermission),
                }}
              />
            }
            onClick={() => onEdit(deviceData)}
          >
            Edit
          </Button>

          {canChangeActivation && (
            <Button
              variant="outlined"
              className="detail-page__header-actions-btn-submit"
              disabled={!hasPermission}
              startIcon={
                <SvgIcon
                  name={ACTIVATION_ACTION_ICON_MAP[activationAction]}
                  sx={{
                    color: getActionIconColor(hasPermission),
                  }}
                />
              }
              onClick={onOpenStatusDialog}
            >
              {ACTIVATION_ACTION_LABEL_MAP[activationAction]}
            </Button>
          )}

          <Button
            variant="outlined"
            className="detail-page__header-actions-btn-submit"
            onClick={onOpenDeleteDialog}
            disabled={!canDelete}
            startIcon={
              <SvgIcon
                name={'DeleteOutlined'}
                sx={{
                  color: getActionIconColor(canDelete),
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
