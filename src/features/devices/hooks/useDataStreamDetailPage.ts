import {
  dataStreamsApi,
  getDataStreamActions,
  getDeleteConfirmation,
  type IDataStreamItem,
} from '@features/data-streams';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export type DataStreamDetailTab = 'Information' | 'RelatedAnalyzer';

const TAB_TO_PATH: Record<DataStreamDetailTab, string> = {
  Information: 'Information',
  RelatedAnalyzer: 'RelatedAnalyzer',
};

const getTabFromParam = (tabParam?: string): DataStreamDetailTab =>
  tabParam === TAB_TO_PATH.RelatedAnalyzer ? 'RelatedAnalyzer' : 'Information';

export function useDataStreamDetailPage() {
  const navigate = useAppNavigate();
  const {
    deviceId,
    dataStreamId,
    tab: tabParam,
  } = useParams<{
    tenant: string;
    deviceId: string;
    dataStreamId: string;
    tab: string;
  }>();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const hasPermission = useManagementPermission().canManageDevices;
  const { showError, showSuccess } = useNotification();

  const [dataStream, setDataStream] = useState<IDataStreamItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const listPath = `/devices/${deviceId}/data-streams`;
  const activeTab = getTabFromParam(tabParam);

  useEffect(() => {
    if (!currentOrgId || !deviceId || !dataStreamId) return;

    const controller = new AbortController();

    const fetchDataStream = async () => {
      setLoading(true);

      try {
        const data = await dataStreamsApi.getDataStreamById(
          { orgId: currentOrgId, deviceId, dataStreamId },
          controller.signal
        );

        setDataStream(data);
      } catch (error) {
        if (axios.isCancel(error)) return;

        setDataStream(null);
        showError(error instanceof Error ? error.message : String(error));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchDataStream();

    return () => controller.abort();
  }, [currentOrgId, deviceId, dataStreamId, showError]);

  const handleBack = () => navigate(listPath);

  const handleChangeTab = (value: string) => {
    navigate(
      `${listPath}/${dataStreamId}/${TAB_TO_PATH[value as DataStreamDetailTab] ?? TAB_TO_PATH.Information}`
    );
  };

  const actions = dataStream
    ? getDataStreamActions(dataStream, hasPermission)
    : null;
  const canEdit = actions?.edit.enabled ?? false;
  const canDelete = actions?.delete.enabled ?? false;

  const handleEdit = () => {
    if (!canEdit) return;
    navigate(`${listPath}/${dataStreamId}/edit`);
  };

  const {
    targetName: deleteTargetName,
    confirmName: deleteConfirmName,
    canConfirm: canConfirmDelete,
  } = getDeleteConfirmation(dataStream, inputValue);

  const handleOpenDelete = () => {
    if (canDelete) setDeleteOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteOpen(false);
    setInputValue('');
  };

  const handleConfirmDelete = async () => {
    if (
      !canDelete ||
      !canConfirmDelete ||
      !currentOrgId ||
      !deviceId ||
      !dataStreamId
    )
      return;

    try {
      await dataStreamsApi.deleteDataStream({
        orgId: currentOrgId,
        deviceId,
        dataStreamId,
      });

      showSuccess('DataStream deleted successfully');
      handleCloseDelete();
      navigate(listPath);
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Delete DataStream failed'
      );
      handleCloseDelete();
    }
  };

  return {
    dataStream,
    loading,
    activeTab,
    hasPermission,
    canEdit,
    canDelete,
    editDisabledReason: actions?.edit.disabledReason,
    deleteDisabledReason: actions?.delete.disabledReason,
    deleteOpen,
    inputValue,
    deleteTargetName,
    deleteConfirmName,
    canConfirmDelete,
    setInputValue,
    handleBack,
    handleChangeTab,
    handleEdit,
    handleOpenDelete,
    handleCloseDelete,
    handleConfirmDelete,
  };
}
