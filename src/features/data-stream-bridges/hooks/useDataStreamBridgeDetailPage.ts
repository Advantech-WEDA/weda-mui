import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { dataStreamBridgesApi } from '../api/dataStreamBridges.api';
import type { IDataStreamBridgeDetail } from '../api/dataStreamBridges.api.types';
import { fillBridgeErrorPlaceholders } from '../api/dataStreamBridges.errors';
import { bridgeToggleDialogContent } from '../components/bridgeToggleDialog';

export type BridgeDetailTab = 'Information' | 'DataStreams';

const TAB_TO_PATH: Record<BridgeDetailTab, string> = {
  Information: 'information',
  DataStreams: 'data-streams',
};

const getTabFromParam = (tabParam?: string): BridgeDetailTab =>
  tabParam === TAB_TO_PATH.DataStreams ? 'DataStreams' : 'Information';

const LIST_PATH = '/data-stream-bridges';

export function useDataStreamBridgeDetailPage() {
  const navigate = useAppNavigate();
  const { bridgeId, tab } = useParams<{ bridgeId: string; tab: string }>();

  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const { showError, showSuccess } = useNotification();
  const hasPermission = useManagementPermission().canManageDataStreamBridges;

  const [bridgeData, setBridgeData] = useState<IDataStreamBridgeDetail | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [toggleOpen, setToggleOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  const fetchBridge = useCallback(
    async (options?: { signal?: AbortSignal; silent?: boolean }) => {
      if (!bridgeId || !currentOrgId) return false;

      if (!options?.silent) setLoading(true);

      try {
        const result = await dataStreamBridgesApi.getDataStreamBridgeById(
          { orgId: currentOrgId, bridgeId },
          options?.signal
        );

        setBridgeData(result);
        setLastUpdated(new Date());
        return true;
      } catch (error) {
        if (axios.isCancel(error)) return false;

        if (!options?.silent) {
          showError(
            error instanceof Error
              ? error.message
              : 'Failed to load DataStream bridge'
          );
        }
        return false;
      } finally {
        if (!options?.silent && !options?.signal?.aborted) setLoading(false);
      }
    },
    [bridgeId, currentOrgId, showError]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchBridge({ signal: controller.signal });

    return () => controller.abort();
  }, [fetchBridge]);

  const activeTab = getTabFromParam(tab);

  const handleChangeTab = (value: string) => {
    if (!bridgeId) return;

    navigate(
      `${LIST_PATH}/${bridgeId}/${TAB_TO_PATH[value as BridgeDetailTab] ?? TAB_TO_PATH.Information}`
    );
  };

  const handleBack = () => navigate(LIST_PATH);

  const handleEdit = () => {
    if (!hasPermission || !bridgeId) return;

    navigate(`${LIST_PATH}/${bridgeId}/edit`);
  };

  const bridgeName = bridgeData?.name ?? '';
  const canDelete = inputValue.trim() === bridgeName.trim();

  const handleDeleteConfirmOpen = () => {
    setInputValue('');
    setDeleteOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteOpen(false);
    setInputValue('');
  };

  const handleConfirmDelete = async () => {
    if (!bridgeId || !currentOrgId || !hasPermission || !canDelete) return;

    try {
      await dataStreamBridgesApi.deleteDataStreamBridge({
        orgId: currentOrgId,
        bridgeId,
      });

      showSuccess('DataStream bridge deleted successfully');
      navigate(LIST_PATH);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Delete DataStream bridge failed';

      showError(message);
      console.error('[Delete DataStream bridge] failed:', message);
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleOpenToggleDialog = () => {
    if (!hasPermission || !bridgeData) return;

    setToggleOpen(true);
  };

  const handleCloseToggleDialog = () => setToggleOpen(false);

  const handleConfirmToggle = async () => {
    if (!bridgeId || !currentOrgId || !bridgeData || !hasPermission) return;

    const action = bridgeData.isEnabled ? 'disable' : 'enable';

    setToggleOpen(false);
    setToggling(true);

    try {
      await dataStreamBridgesApi.postDataStreamBridgeAction({
        orgId: currentOrgId,
        bridgeId,
        action,
      });

      showSuccess(
        `DataStream bridge [${bridgeData.name ?? bridgeId}] ${action}d successfully`
      );

      await fetchBridge();
    } catch (err: unknown) {
      showError(
        err instanceof Error
          ? fillBridgeErrorPlaceholders(
              err.message,
              bridgeData.mqtt?.brokerEndpoint
            )
          : `Failed to ${action} DataStream bridge`
      );
    } finally {
      setToggling(false);
    }
  };

  const toggleDialogContent = bridgeToggleDialogContent(
    bridgeName,
    bridgeData?.isEnabled ?? false
  );

  return {
    bridgeId,
    activeTab,
    loading,
    hasPermission,
    bridgeData,
    bridgeName,
    lastUpdated,
    fetchBridge,
    handleChangeTab,
    handleBack,
    handleEdit,

    deleteOpen,
    inputValue,
    setInputValue,
    canDelete,
    handleDeleteConfirmOpen,
    handleCloseDeleteDialog,
    handleConfirmDelete,

    toggleOpen,
    toggling,
    toggleDialogContent,
    handleOpenToggleDialog,
    handleCloseToggleDialog,
    handleConfirmToggle,
  };
}
