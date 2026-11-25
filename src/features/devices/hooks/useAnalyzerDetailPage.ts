import {
  analyzersApi,
  getAnalyzerActions,
  type IAnalyzerItem,
} from '@features/analyzers';
import { dataStreamsApi, type IDataStreamItem } from '@features/data-streams';
import { getApiErrorMessage } from '@shared/api/ApiError';
import { fetchAllPages } from '@shared/api/fetchAllPages';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

export function useAnalyzerDetailPage() {
  const navigate = useAppNavigate();
  const { deviceId, analyzerId } = useParams<{
    tenant: string;
    deviceId: string;
    analyzerId: string;
  }>();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const hasPermission = useManagementPermission().canManageDevices;
  const { showError, showSuccess } = useNotification();

  const [analyzer, setAnalyzer] = useState<IAnalyzerItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataStreams, setDataStreams] = useState<IDataStreamItem[]>([]);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const listPath = `/devices/${deviceId}/analyzers`;

  useEffect(() => {
    if (!currentOrgId || !deviceId || !analyzerId) return;

    const controller = new AbortController();

    const fetchAnalyzer = async () => {
      setLoading(true);

      try {
        const data = await analyzersApi.getAnalyzerById(
          { orgId: currentOrgId, deviceId, analyzerId },
          controller.signal
        );

        setAnalyzer(data);
      } catch (error) {
        if (axios.isCancel(error)) return;

        setAnalyzer(null);
        showError(error instanceof Error ? error.message : String(error));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchAnalyzer();

    return () => controller.abort();
  }, [currentOrgId, deviceId, analyzerId, showError]);

  useEffect(() => {
    if (!currentOrgId || !deviceId) return;

    const controller = new AbortController();

    fetchAllPages((paging) =>
      dataStreamsApi.getDataStreamsList(
        { orgId: currentOrgId, deviceId, ...paging },
        controller.signal
      )
    )
      .then((result) => setDataStreams(result.items))
      .catch((error) => {
        if (axios.isCancel(error)) return;

        console.error('[Analyzer detail] data stream lookup failed:', error);
      });

    return () => controller.abort();
  }, [currentOrgId, deviceId]);

  const dataStreamsById = useMemo(
    () => new Map(dataStreams.map((s) => [s.dataStreamId, s])),
    [dataStreams]
  );

  const actions = analyzer
    ? getAnalyzerActions(analyzer, hasPermission)
    : {
        edit: { enabled: false },
        delete: { enabled: false },
      };

  const handleBack = () => navigate(listPath);

  const handleEdit = () => {
    if (!actions.edit.enabled || !analyzerId) return;
    navigate(`${listPath}/${analyzerId}/edit`);
  };

  const deleteTargetName = analyzer?.name ?? '';
  const canConfirmDelete =
    Boolean(deleteTargetName.trim()) &&
    inputValue.trim() === deleteTargetName.trim();

  const handleOpenDelete = () => {
    if (!actions.delete.enabled) return;
    setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteOpen(false);
    setInputValue('');
  };

  const handleConfirmDelete = async () => {
    if (!currentOrgId || !deviceId || !analyzerId || !canConfirmDelete) return;

    try {
      await analyzersApi.deleteAnalyzer({
        orgId: currentOrgId,
        deviceId,
        analyzerId,
      });

      showSuccess('Analyzer deleted successfully');
      handleCloseDelete();
      navigate(listPath);
    } catch (error) {
      showError(getApiErrorMessage(error, 'Delete analyzer failed'));
      handleCloseDelete();
    }
  };

  return {
    analyzer,
    loading,
    dataStreamsById,
    canEdit: actions.edit.enabled,
    canDelete: actions.delete.enabled,
    editDisabledReason: actions.edit.disabledReason,
    deleteDisabledReason: actions.delete.disabledReason,
    handleBack,
    handleEdit,
    deleteOpen,
    inputValue,
    deleteTargetName,
    canConfirmDelete,
    setInputValue,
    handleOpenDelete,
    handleCloseDelete,
    handleConfirmDelete,
  };
}
