import {
  DEFAULT_STACK_TYPE,
  type DeploymentAction,
  type ICreateStackConfigPayload,
  isDeploymentApiAction,
  isRedeployAction,
  isRemoveAction,
  useDeploymentsStore,
} from '@features/container-stacks';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useHasManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export function useDeviceStackDetailPage() {
  const navigate = useAppNavigate();
  const { deviceId, stackConfigId, stackRevisionId } = useParams<{
    tenant: string;
    deviceId: string;
    stackConfigId: string;
    stackRevisionId: string;
  }>();

  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const hasPermission = useHasManagementPermission();
  const { showError, showSuccess } = useNotification();

  const [loading, setLoading] = useState(true);
  const [stackData, setStackData] = useState<ICreateStackConfigPayload>({
    orgId: currentOrgId ?? '',
    stackName: '',
    type: DEFAULT_STACK_TYPE,
    composeFileContent: '',
    environment: {},
    description: '',
  });
  const [deploymentStatus, setDeploymentStatus] = useState<string>();

  const [dialogOpenDeleteStack, setDialogOpenDeleteStack] = useState(false);

  const GET_STACK_CONFIG_BY_ID = useDeploymentsStore(
    (s) => s.GET_STACK_CONFIG_BY_ID
  );
  const GET_LIST_STACKS_IN_DEVICE = useDeploymentsStore(
    (s) => s.GET_LIST_STACKS_IN_DEVICE
  );
  const POST_STACK_ACTION = useDeploymentsStore((s) => s.POST_STACK_ACTION);
  const POST_DEPLOY_STACK_TO_DEVICES = useDeploymentsStore(
    (s) => s.POST_DEPLOY_STACK_TO_DEVICES
  );
  const DELETE_STACK_FROM_DEVICE = useDeploymentsStore(
    (s) => s.DELETE_STACK_FROM_DEVICE
  );

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const fetchStackConfigById = useCallback(
    async (ignore?: () => boolean) => {
      if (!stackConfigId || !stackRevisionId || !currentOrgId) return;

      setLoading(true);

      try {
        const result = await GET_STACK_CONFIG_BY_ID({
          orgId: currentOrgId,
          stackConfigId,
          stackRevisionId,
        });

        if (ignore?.()) return;

        setStackData({
          orgId: result?.orgId ?? '',
          stackName: result?.stackName ?? '',
          type: result?.type ?? DEFAULT_STACK_TYPE,
          composeFileContent: result?.composeFileContent ?? '',
          environment: result?.environment ?? {},
          description: result?.description ?? '',
        });
      } catch (error) {
        if (ignore?.()) return;

        showError(
          error instanceof Error ? error.message : 'Failed to load stack config'
        );
      } finally {
        if (!ignore?.()) {
          setLoading(false);
        }
      }
    },
    [
      stackConfigId,
      stackRevisionId,
      currentOrgId,
      GET_STACK_CONFIG_BY_ID,
      showError,
    ]
  );

  const fetchDeploymentStatus = useCallback(
    async (ignore?: () => boolean) => {
      if (!deviceId || !stackConfigId) return;

      try {
        const result = await GET_LIST_STACKS_IN_DEVICE({
          deviceId,
          stackConfigId,
        });

        if (ignore?.()) return;

        setDeploymentStatus(result.items[0]?.status);
      } catch (error) {
        if (ignore?.()) return;

        showError(
          error instanceof Error
            ? error.message
            : 'Failed to load deployment status'
        );
      }
    },
    [deviceId, stackConfigId, GET_LIST_STACKS_IN_DEVICE, showError]
  );

  useEffect(() => {
    let ignore = false;

    fetchStackConfigById(() => ignore);

    return () => {
      ignore = true;
    };
  }, [fetchStackConfigById]);

  useEffect(() => {
    let ignore = false;

    fetchDeploymentStatus(() => ignore);

    return () => {
      ignore = true;
    };
  }, [fetchDeploymentStatus]);

  const handleOpenDeleteStack = () => setDialogOpenDeleteStack(true);
  const handleCloseDeleteStack = () => setDialogOpenDeleteStack(false);

  const handleConfirmDeleteStack = async () => {
    if (!deviceId || !stackConfigId || !hasPermission) return;

    try {
      await DELETE_STACK_FROM_DEVICE({ deviceId, stackConfigId });

      showSuccess('Stack deleted successfully');

      navigate(`/devices/${deviceId}/container-stacks`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Delete Container Stack failed';

      showError(message);
      console.error('[Delete Container Stack] failed:', message);
    } finally {
      handleCloseDeleteStack();
    }
  };

  const handleDeploymentAction = async (action: DeploymentAction) => {
    if (!hasPermission || !deviceId || !stackConfigId) return;

    if (isRemoveAction(action)) {
      handleOpenDeleteStack();

      return;
    }

    if (isRedeployAction(action)) {
      if (!currentOrgId || !stackRevisionId) return;

      try {
        await POST_DEPLOY_STACK_TO_DEVICES({
          orgId: currentOrgId,
          stackConfigId,
          stackRevisionId,
          deviceIds: [deviceId],
        });

        showSuccess('Stack deployed successfully');

        fetchDeploymentStatus();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Stack deploy failed';

        showError(message);
        console.error('[Stack deploy] failed:', message);
      }

      return;
    }

    if (isDeploymentApiAction(action)) {
      try {
        await POST_STACK_ACTION({ deviceId, stackConfigId, action });

        showSuccess('Stack action performed successfully');

        fetchDeploymentStatus();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Stack action failed';

        showError(message);
        console.error('[Stack action] failed:', message);
      }
    }
  };

  return {
    loading,
    stackData,
    hasPermission,
    deploymentStatus,
    dialogOpenDeleteStack,
    handleBack,
    handleDeploymentAction,
    handleCloseDeleteStack,
    handleConfirmDeleteStack,
  };
}
