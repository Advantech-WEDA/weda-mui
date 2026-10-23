import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useHasManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { ICreateStackConfigPayload } from '../api/stacks.api.types';
import { DEFAULT_STACK_TYPE } from '../domain/types';
import { useDeploymentsStore } from '../store/useDeploymentsStore';

const getTabFromParam = (tabParam?: string) =>
  tabParam === 'deployment' ? 'Deployments' : 'Information';

const TAB_TO_PATH: Record<string, string> = {
  Information: 'information',
  Deployments: 'deployment',
};

export function useStackDetailPage() {
  const navigate = useAppNavigate();
  const { stackConfigId, stackRevisionId, tab } = useParams<{
    stackConfigId: string;
    stackRevisionId: string;
    tab: string;
  }>();

  const [activeTab, setActiveTab] = useState(() => getTabFromParam(tab));

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const { currentOrgId } = useOrgContentStore();

  const { showError, showSuccess } = useNotification();
  const hasPermission = useHasManagementPermission();

  const [stackData, setStackData] = useState<ICreateStackConfigPayload>({
    orgId: currentOrgId ?? '',
    stackName: '',
    type: DEFAULT_STACK_TYPE,
    composeFileContent: '',
    environment: {},
    description: '',
  });

  const DELETE_STACK_CONFIG_BY_ID = useDeploymentsStore(
    (s) => s.DELETE_STACK_CONFIG_BY_ID
  );

  const GET_STACK_CONFIG_BY_ID = useDeploymentsStore(
    (s) => s.GET_STACK_CONFIG_BY_ID
  );

  const fetchStackConfigById = useCallback(
    async (signal?: AbortSignal) => {
      if (!stackConfigId || !stackRevisionId || !currentOrgId) {
        return;
      }

      try {
        const result = await GET_STACK_CONFIG_BY_ID(
          {
            orgId: currentOrgId,
            stackConfigId: stackConfigId,
            stackRevisionId: stackRevisionId,
          },
          signal
        );

        setStackData({
          orgId: result?.orgId ?? '',
          stackName: result?.stackName ?? '',
          type: result?.type ?? DEFAULT_STACK_TYPE,
          composeFileContent: result?.composeFileContent ?? '',
          environment: result?.environment ?? {},
          description: result?.description ?? '',
        });
      } catch (error) {
        if (axios.isCancel(error)) return;

        showError(
          error instanceof Error ? error.message : 'Failed to load stack config'
        );
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

  useEffect(() => {
    const controller = new AbortController();

    fetchStackConfigById(controller.signal);

    return () => controller.abort();
  }, [fetchStackConfigById]);

  useEffect(() => {
    setActiveTab(getTabFromParam(tab));
  }, [tab]);

  const handleEdit = useCallback(
    (editStackConfigId?: string, editStackRevisionId?: string) => {
      if (!hasPermission || !editStackConfigId || !editStackRevisionId) return;

      navigate(
        `/container-stacks/${editStackConfigId}/${editStackRevisionId}/edit`
      );
    },
    [navigate, hasPermission]
  );

  const handleChangeTab = (value: string) => {
    setActiveTab(value);

    if (!stackConfigId || !stackRevisionId) return;

    navigate(
      `/container-stacks/${stackConfigId}/${stackRevisionId}/${TAB_TO_PATH[value] ?? 'information'}`
    );
  };

  const handleDeleteConfirmOpen = () => {
    setDeleteOpen(true);
  };

  const handleCloseDialog = () => {
    setDeleteOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!stackConfigId || !stackRevisionId || !currentOrgId || !hasPermission) {
      return;
    }

    try {
      await DELETE_STACK_CONFIG_BY_ID({
        orgId: currentOrgId,
        stackConfigId: stackConfigId,
        stackRevisionId: stackRevisionId,
      });

      showSuccess('Stack deleted successfully');

      handleCloseDialog();
      navigate('/container-stacks');
    } catch (err: unknown) {
      let message = 'Delete Container Stack failed';

      if (err instanceof Error) {
        message = err.message;
      }

      showError(message);
      console.error('[Delete Container Stack] failed:', message);
    } finally {
      handleCloseDialog();
    }
  };

  return {
    tab: activeTab,
    deleteOpen,
    inputValue,
    setInputValue,
    hasPermission,
    stackData,
    handleChangeTab,
    handleEdit,
    handleDeleteConfirmOpen,
    handleCloseDialog,
    handleConfirmDelete,
  };
}
