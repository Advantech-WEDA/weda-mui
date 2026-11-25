import { ApiError } from '@shared/api/ApiError';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { mqttBrokersApi } from '../api/mqttBrokers.api';
import type { IMqttBrokerDetail } from '../api/mqttBrokers.api.types';

export type MqttBrokerDetailLoadState =
  | 'loading'
  | 'loaded'
  | 'notFound'
  | 'error';

export function useMqttBrokerDetailPage() {
  const navigate = useAppNavigate();
  const { mqttConfigId } = useParams<{ mqttConfigId: string }>();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [brokerData, setBrokerData] = useState<IMqttBrokerDetail | null>(null);
  const [loadState, setLoadState] =
    useState<MqttBrokerDetailLoadState>('loading');

  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const { showError, showSuccess } = useNotification();
  const hasPermission = useManagementPermission().canManageMqttBrokers;

  const fetchMqttBroker = useCallback(
    async (signal?: AbortSignal) => {
      if (!mqttConfigId || !currentOrgId) return;

      setLoadState('loading');

      try {
        const result = await mqttBrokersApi.getMqttBrokerById(
          { orgId: currentOrgId, mqttConfigId },
          signal
        );

        setBrokerData(result);
        setLoadState('loaded');
      } catch (error) {
        if (axios.isCancel(error)) return;

        setBrokerData(null);
        setLoadState(
          error instanceof ApiError && error.status === 404
            ? 'notFound'
            : 'error'
        );
        showError(
          error instanceof Error ? error.message : 'Failed to load MQTT broker'
        );
      }
    },
    [mqttConfigId, currentOrgId, showError]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchMqttBroker(controller.signal);

    return () => controller.abort();
  }, [fetchMqttBroker]);

  const brokerName = brokerData?.name ?? '';
  const canDelete = inputValue.trim() === brokerName.trim();

  const handleBack = () => {
    navigate('/mqtt-brokers');
  };

  const isLoaded = loadState === 'loaded' && brokerData !== null;

  const handleEdit = () => {
    if (!hasPermission || !mqttConfigId || !isLoaded) return;

    navigate(`/mqtt-brokers/${mqttConfigId}/edit`);
  };

  const handleDeleteConfirmOpen = () => {
    if (!isLoaded) return;

    setInputValue('');
    setDeleteOpen(true);
  };

  const handleCloseDialog = () => {
    setDeleteOpen(false);
    setInputValue('');
  };

  const handleConfirmDelete = async () => {
    if (
      !mqttConfigId ||
      !currentOrgId ||
      !hasPermission ||
      !isLoaded ||
      !canDelete
    ) {
      return;
    }

    try {
      await mqttBrokersApi.deleteMqttBroker({
        orgId: currentOrgId,
        mqttConfigId,
      });

      showSuccess('MQTT broker deleted successfully');
      navigate('/mqtt-brokers');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Delete MQTT broker failed';

      showError(message);
      console.error('[Delete MQTT broker] failed:', message);
    } finally {
      handleCloseDialog();
    }
  };

  return {
    deleteOpen,
    inputValue,
    setInputValue,
    hasPermission,
    canDelete,
    brokerData,
    brokerName,
    loadState,
    isLoaded,
    handleRetry: () => {
      void fetchMqttBroker();
    },
    handleBack,
    handleEdit,
    handleDeleteConfirmOpen,
    handleCloseDialog,
    handleConfirmDelete,
  };
}
