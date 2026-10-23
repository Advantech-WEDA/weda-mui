import {
  getDeploymentStatusGroup,
  type IAiModelDeviceDeploymentItem,
  type IAiModelEditionDetail,
  type IAiModelItem,
  isDeployAgainSelectable,
  useAIModelsStore,
} from '@features/ai-models';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export function useDeviceAiModelEditionDetailPage() {
  const navigate = useAppNavigate();
  const { deviceId, deviceDeploymentId } = useParams<{
    tenant: string;
    deviceId: string;
    deviceDeploymentId: string;
  }>();

  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const hasPermission = useManagementPermission().canManageAiModels;
  const { showError, showSuccess } = useNotification();

  const [loading, setLoading] = useState(true);
  const [deploymentItem, setDeploymentItem] =
    useState<IAiModelDeviceDeploymentItem | null>(null);
  const [modelItem, setModelItem] = useState<IAiModelItem | null>(null);
  const [editionDetail, setEditionDetail] =
    useState<IAiModelEditionDetail | null>(null);

  const [redeployOpen, setRedeployOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const canDelete = inputValue.trim() === (modelItem?.modelName ?? '').trim();

  const canRedeploy = !!(
    deploymentItem?.state &&
    isDeployAgainSelectable(getDeploymentStatusGroup(deploymentItem.state))
  );

  const GET_ALL_AI_MODELS = useAIModelsStore((s) => s.GET_ALL_AI_MODELS);
  const GET_AI_MODEL_EDITION = useAIModelsStore((s) => s.GET_AI_MODEL_EDITION);
  const GET_ALL_DEVICE_AI_MODELS = useAIModelsStore(
    (s) => s.GET_ALL_DEVICE_AI_MODELS
  );
  const POST_AI_MODEL_DEPLOYMENT = useAIModelsStore(
    (s) => s.POST_AI_MODEL_DEPLOYMENT
  );
  const DELETE_AI_MODEL_FROM_DEVICE = useAIModelsStore(
    (s) => s.DELETE_AI_MODEL_FROM_DEVICE
  );

  const handleBack = useCallback(() => {
    navigate(`/devices/${deviceId}/ai-models`);
  }, [navigate, deviceId]);

  const fetchDetail = useCallback(
    async (ignore?: () => boolean) => {
      if (!currentOrgId || !deviceId || !deviceDeploymentId) return;

      setLoading(true);

      try {
        const deploymentsData = await GET_ALL_DEVICE_AI_MODELS({ deviceId });

        if (ignore?.()) return;

        const item =
          deploymentsData.items?.find(
            (i) => i.deviceDeploymentId === deviceDeploymentId
          ) ?? null;

        if (!item?.modelId || !item.edition) {
          showError('AI model deployment not found');
          handleBack();
          return;
        }

        setDeploymentItem(item);

        const [modelsData, editionData] = await Promise.all([
          GET_ALL_AI_MODELS({ orgId: currentOrgId }),
          GET_AI_MODEL_EDITION({
            orgId: currentOrgId,
            modelId: item.modelId,
            edition: item.edition,
          }),
        ]);

        if (ignore?.()) return;

        setModelItem(
          modelsData.items?.find((m) => m.modelId === item.modelId) ?? null
        );
        setEditionDetail(editionData);
      } catch (error) {
        if (ignore?.()) return;

        const message =
          error instanceof Error
            ? error.message
            : 'Fetch AI model deployment detail failed';

        showError(message);
        handleBack();
      } finally {
        if (!ignore?.()) {
          setLoading(false);
        }
      }
    },
    [
      currentOrgId,
      deviceId,
      deviceDeploymentId,
      GET_ALL_DEVICE_AI_MODELS,
      GET_ALL_AI_MODELS,
      GET_AI_MODEL_EDITION,
      showError,
      handleBack,
    ]
  );

  useEffect(() => {
    let ignore = false;

    fetchDetail(() => ignore);

    return () => {
      ignore = true;
    };
  }, [fetchDetail]);

  const handleRedeployConfirmOpen = () => setRedeployOpen(true);
  const handleCloseRedeployDialog = () => setRedeployOpen(false);

  const handleConfirmRedeploy = async () => {
    if (
      !hasPermission ||
      !currentOrgId ||
      !deviceId ||
      !deploymentItem?.modelId ||
      !deploymentItem.edition
    )
      return;

    try {
      await POST_AI_MODEL_DEPLOYMENT({
        orgId: currentOrgId,
        modelId: deploymentItem.modelId,
        edition: deploymentItem.edition,
        targets: [{ deviceIdList: [deviceId] }],
      });

      showSuccess('Deployment retried successfully');

      fetchDetail();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Retry deployment failed';

      showError(message);
      console.error('[Redeploy AI model] failed:', message);
    } finally {
      handleCloseRedeployDialog();
    }
  };

  const handleDeleteConfirmOpen = () => setDeleteOpen(true);

  const handleCloseDeleteDialog = () => {
    setDeleteOpen(false);
    setInputValue('');
  };

  const handleConfirmDelete = async () => {
    if (
      !hasPermission ||
      !deviceId ||
      !deploymentItem?.modelId ||
      !deploymentItem.edition ||
      !canDelete
    )
      return;

    try {
      await DELETE_AI_MODEL_FROM_DEVICE({
        deviceId,
        modelId: deploymentItem.modelId,
        edition: deploymentItem.edition,
      });

      showSuccess('AI model deleted from device successfully');

      handleCloseDeleteDialog();
      handleBack();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Delete AI model from device failed';

      showError(message);
      console.error('[Delete AI model from device] failed:', err);
    } finally {
      handleCloseDeleteDialog();
    }
  };

  return {
    loading,
    hasPermission,
    modelItem,
    editionDetail,
    redeployOpen,
    deleteOpen,
    inputValue,
    setInputValue,
    canDelete,
    canRedeploy,
    handleBack,
    handleRedeployConfirmOpen,
    handleCloseRedeployDialog,
    handleConfirmRedeploy,
    handleDeleteConfirmOpen,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  };
}
