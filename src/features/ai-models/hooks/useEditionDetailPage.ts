import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import type {
  IAiModelEditionDetail,
  IAiModelItem,
} from '../api/aiModels.api.types';
import { useAIModelsStore } from '../store/useAIModelsStore';

const getTabFromParam = (tabParam?: string) =>
  tabParam === 'deployment' ? 'Deployments' : 'Information';

const TAB_TO_PATH: Record<string, string> = {
  Information: 'information',
  Deployments: 'deployment',
};

export function useEditionDetailPage() {
  const navigate = useAppNavigate();
  const { modelId, edition, tab } = useParams<{
    tenant: string;
    modelId: string;
    edition: string;
    tab: string;
  }>();
  const decodedEdition = edition ? decodeURIComponent(edition) : undefined;

  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const hasPermission = useManagementPermission().canManageAiModels;
  const { showError, showSuccess } = useNotification();

  const [activeTab, setActiveTab] = useState(() => getTabFromParam(tab));
  const [loading, setLoading] = useState(true);
  const [modelItem, setModelItem] = useState<IAiModelItem | null>(null);
  const [editionDetail, setEditionDetail] =
    useState<IAiModelEditionDetail | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const canDelete = inputValue.trim() === (editionDetail?.edition ?? '').trim();

  const GET_ALL_AI_MODELS = useAIModelsStore((s) => s.GET_ALL_AI_MODELS);
  const GET_AI_MODEL_EDITION = useAIModelsStore((s) => s.GET_AI_MODEL_EDITION);
  const DELETE_AI_MODEL_EDITION = useAIModelsStore(
    (s) => s.DELETE_AI_MODEL_EDITION
  );

  const fetchDetail = useCallback(
    async (ignore?: () => boolean) => {
      if (!currentOrgId || !modelId || !decodedEdition) return;

      setLoading(true);

      try {
        const [modelsData, editionData] = await Promise.all([
          GET_ALL_AI_MODELS({ orgId: currentOrgId }),
          GET_AI_MODEL_EDITION({
            orgId: currentOrgId,
            modelId,
            edition: decodedEdition,
          }),
        ]);

        if (ignore?.()) return;

        setModelItem(
          modelsData.items?.find((item) => item.modelId === modelId) ?? null
        );
        setEditionDetail(editionData);
      } catch (error) {
        if (ignore?.()) return;

        const message =
          error instanceof Error
            ? error.message
            : 'Fetch edition detail failed';

        showError(message);
        navigate('/ai-models');
      } finally {
        if (!ignore?.()) {
          setLoading(false);
        }
      }
    },
    [
      currentOrgId,
      modelId,
      decodedEdition,
      GET_ALL_AI_MODELS,
      GET_AI_MODEL_EDITION,
      navigate,
      showError,
    ]
  );

  useEffect(() => {
    let ignore = false;

    fetchDetail(() => ignore);

    return () => {
      ignore = true;
    };
  }, [fetchDetail]);

  useEffect(() => {
    setActiveTab(getTabFromParam(tab));
  }, [tab]);

  const handleChangeTab = (value: string) => {
    setActiveTab(value);

    if (!modelId || !decodedEdition) return;

    navigate(
      `/ai-models/${modelId}/editions/${encodeURIComponent(decodedEdition)}/${TAB_TO_PATH[value] ?? 'information'}`
    );
  };

  const handleBack = () => {
    navigate('/ai-models');
  };

  const handleEdit = () => {
    if (!hasPermission || !modelId || !decodedEdition) return;

    navigate(
      `/ai-models/${modelId}/editions/${encodeURIComponent(decodedEdition)}/edit`
    );
  };

  const handleDeleteConfirmOpen = () => setDeleteOpen(true);

  const handleCloseDialog = () => {
    setDeleteOpen(false);
    setInputValue('');
  };

  const handleConfirmDelete = async () => {
    if (
      !currentOrgId ||
      !modelId ||
      !decodedEdition ||
      !hasPermission ||
      !canDelete
    )
      return;

    try {
      await DELETE_AI_MODEL_EDITION({
        orgId: currentOrgId,
        modelId,
        edition: decodedEdition,
      });

      showSuccess('AI model edition deleted successfully');

      handleCloseDialog();
      navigate('/ai-models');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Delete AI model edition failed';

      showError(message);
      console.error('[EditionDetail] Delete edition failed:', err);
    } finally {
      handleCloseDialog();
    }
  };

  return {
    tab: activeTab,
    loading,
    hasPermission,
    modelItem,
    editionDetail,
    deleteOpen,
    inputValue,
    setInputValue,
    canDelete,
    handleChangeTab,
    handleBack,
    handleEdit,
    handleDeleteConfirmOpen,
    handleCloseDialog,
    handleConfirmDelete,
  };
}
