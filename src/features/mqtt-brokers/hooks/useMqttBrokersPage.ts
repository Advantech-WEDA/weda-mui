import { dataStreamBridgesApi } from '@features/data-stream-bridges';
import { fetchAllPages, MAX_PAGE_SIZE } from '@shared/api/fetchAllPages';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { usePageClamp } from '@shared/lib/usePageClamp';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { type SortOrder, useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { mqttBrokersApi } from '@/features/mqtt-brokers/api/mqttBrokers.api';
import type {
  IMqttBrokerDataStreamBridgeRef,
  IMqttBrokerListItem,
} from '@/features/mqtt-brokers/api/mqttBrokers.api.types';
import {
  getMqttBrokerSubmitErrorMessage,
  getMqttBrokerSubmitFieldErrors,
} from '@/features/mqtt-brokers/api/mqttBrokers.errors';
import {
  applyMqttBrokerChange,
  INITIAL_MQTT_BROKER_DATA,
  INITIAL_MQTT_BROKER_ERRORS,
  shouldSubmitMqttCredentials,
  validateMqttBrokerForm,
} from '@/features/mqtt-brokers/domain/mqttBroker.rules';
import type {
  MqttBrokerForm,
  MqttBrokerFormErrors,
  MqttProtocolVersion,
  TableHeaderSortKey,
} from '@/features/mqtt-brokers/domain/types';

const SEARCH_DEBOUNCE_MS = 300;

async function fetchBridgeRefsByBroker(
  orgId: string,
  brokers: IMqttBrokerListItem[],
  signal?: AbortSignal
): Promise<Map<string, IMqttBrokerDataStreamBridgeRef[]>> {
  const result = new Map<string, IMqttBrokerDataStreamBridgeRef[]>();
  const inUse = brokers.filter((broker) => broker.isInUse);

  if (inUse.length === 0) return result;

  const brokerIds = new Set(inUse.map((broker) => broker.mqttConfigId));
  const brokerNames = new Set(inUse.map((broker) => broker.name));

  const { items: bridges } = await fetchAllPages(
    (paging) =>
      dataStreamBridgesApi.getDataStreamBridgesList(
        { orgId, sorting: 'Name asc', ...paging },
        signal
      ),
    MAX_PAGE_SIZE
  );

  const details = await Promise.allSettled(
    bridges
      .filter(
        (bridge) =>
          bridge.mqttBrokerConfigName === null ||
          brokerNames.has(bridge.mqttBrokerConfigName)
      )
      .map((bridge) =>
        dataStreamBridgesApi.getDataStreamBridgeById(
          { orgId, bridgeId: bridge.bridgeId },
          signal
        )
      )
  );

  for (const detail of details) {
    if (detail.status !== 'fulfilled') continue;

    const mqttConfigId = detail.value.mqtt?.mqttConfigId;
    if (!mqttConfigId || !brokerIds.has(mqttConfigId)) continue;

    const refs = result.get(mqttConfigId) ?? [];
    refs.push({ bridgeId: detail.value.bridgeId, name: detail.value.name });
    result.set(mqttConfigId, refs);
  }

  return result;
}

async function resolveProtocolVersions(
  orgId: string,
  rows: IMqttBrokerListItem[],
  signal?: AbortSignal
): Promise<IMqttBrokerListItem[]> {
  const details = await Promise.allSettled(
    rows.map((row) =>
      mqttBrokersApi.getMqttBrokerById(
        { orgId, mqttConfigId: row.mqttConfigId },
        signal
      )
    )
  );

  return rows.map((row, index) => {
    const result = details[index];

    return {
      ...row,
      mqttProtocolVersion:
        result.status === 'fulfilled'
          ? result.value.mqttProtocolVersion
          : row.mqttProtocolVersion,
    };
  });
}

export function useMqttBrokersPage() {
  const navigate = useAppNavigate();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [sortKey, setSortKey] = useState<TableHeaderSortKey>('Name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [searchWord, setSearchWord] = useState('');
  const [debouncedSearchWord, setDebouncedSearchWord] = useState('');

  const [protocolVersionFilter, setProtocolVersionFilter] = useState<
    MqttProtocolVersion | ''
  >('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { showError, showSuccess } = useNotification();

  const hasPermission = useManagementPermission().canManageMqttBrokers;

  const { currentOrgId } = useOrgContentStore();

  const [selectedItem, setSelectedItem] = useState<IMqttBrokerListItem | null>(
    null
  );

  const [rows, setRows] = useState<IMqttBrokerListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchWord(searchWord.trim());
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchWord]);

  const fetchMqttBrokers = useCallback(
    async (signal?: AbortSignal): Promise<boolean> => {
      setLoading(true);
      setLoadError(false);

      const listParams = {
        orgId: currentOrgId,
        filter: debouncedSearchWord || undefined,
        sorting: `${sortKey} ${sortOrder}`,
      };

      try {
        let pageRows: IMqttBrokerListItem[];
        let total: number;
        let bridgesByBroker: Map<
          string,
          IMqttBrokerDataStreamBridgeRef[]
        > | null;

        if (protocolVersionFilter) {
          const { items } = await fetchAllPages(
            (paging) =>
              mqttBrokersApi.getMqttBrokersList(
                { ...listParams, ...paging },
                signal
              ),
            MAX_PAGE_SIZE
          );
          const matched = (
            await resolveProtocolVersions(currentOrgId, items, signal)
          ).filter((row) => row.mqttProtocolVersion === protocolVersionFilter);

          total = matched.length;
          pageRows = matched.slice(
            page * rowsPerPage,
            (page + 1) * rowsPerPage
          );
          bridgesByBroker = await fetchBridgeRefsByBroker(
            currentOrgId,
            pageRows,
            signal
          ).catch(() => null);
        } else {
          const data = await mqttBrokersApi.getMqttBrokersList(
            {
              ...listParams,
              skipCount: page * rowsPerPage,
              maxResultCount: rowsPerPage,
            },
            signal
          );

          total = data.totalCount;
          [pageRows, bridgesByBroker] = await Promise.all([
            resolveProtocolVersions(currentOrgId, data.items, signal),
            fetchBridgeRefsByBroker(currentOrgId, data.items, signal).catch(
              () => null
            ),
          ]);
        }

        if (signal?.aborted) return false;

        setRows(
          pageRows.map((row) => ({
            ...row,
            dataStreamBridges: bridgesByBroker
              ? (bridgesByBroker.get(row.mqttConfigId) ?? [])
              : row.dataStreamBridges,
          }))
        );
        setTotalCount(total);
        return true;
      } catch (error) {
        if (axios.isCancel(error)) return false;

        setRows([]);
        setTotalCount(0);
        setLoadError(true);
        showError(
          error instanceof Error ? error.message : 'Failed to load MQTT brokers'
        );
        return false;
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [
      currentOrgId,
      debouncedSearchWord,
      protocolVersionFilter,
      page,
      rowsPerPage,
      sortKey,
      sortOrder,
      showError,
    ]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchMqttBrokers(controller.signal);

    return () => controller.abort();
  }, [fetchMqttBrokers]);

  const isResolvingPage = usePageClamp({
    page,
    setPage,
    rowsPerPage,
    totalCount,
    itemCount: rows.length,
    loading,
  });

  const handleClearFilters = () => {
    setSearchWord('');
    setDebouncedSearchWord('');
    setProtocolVersionFilter('');
    setSortKey('Name');
    setSortOrder('asc');
    setPage(0);
  };

  const handleSort = (key: TableHeaderSortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      setPage(0);

      return;
    }

    setSortKey(key);
    setSortOrder('asc');
    setPage(0);
  };

  const handleProtocolVersionFilterChange = (
    value: MqttProtocolVersion | ''
  ) => {
    setProtocolVersionFilter(value);
    setPage(0);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedItem(null);
    setInputValue('');
  };

  const handleOpenDeleteDialog = (row: IMqttBrokerListItem) => {
    setSelectedItem(row);
    setInputValue('');
    setDialogOpen(true);
  };

  const canDelete = inputValue.trim() === (selectedItem?.name ?? '').trim();

  const handleAdd = () => {
    if (!hasPermission) return;

    navigate('/mqtt-brokers/add');
  };

  const handleEdit = useCallback(
    (mqttConfigId: string) => {
      if (!hasPermission) return;

      navigate(`/mqtt-brokers/${mqttConfigId}/edit`);
    },
    [hasPermission, navigate]
  );

  const handleRefresh = async () => {
    const isFetched = await fetchMqttBrokers();

    if (!isFetched) return;

    showSuccess('MQTT broker list refreshed');
    setPage(0);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem || !hasPermission || !canDelete) return;

    try {
      await mqttBrokersApi.deleteMqttBroker({
        orgId: currentOrgId,
        mqttConfigId: selectedItem.mqttConfigId,
      });

      showSuccess('MQTT broker deleted successfully');

      await fetchMqttBrokers();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Delete MQTT broker failed';

      showError(message);
      console.error('[Delete MQTT broker] failed:', message);
    } finally {
      handleClose();
    }
  };

  const tableSectionProps = {
    rows,
    totalCount,
    page,
    rowsPerPage,
    sortKey,
    sortOrder,
    loading: loading || isResolvingPage,
    hasError: loadError,
    hasFilter: !!debouncedSearchWord || !!protocolVersionFilter,
    hasPermission,
    onSort: handleSort,

    onRetry: () => {
      void fetchMqttBrokers();
    },
    onClearAll: handleClearFilters,
    onPageChange: (newPage: number) => setPage(newPage),
    onRowsPerPageChange: (rows: number) => {
      setRowsPerPage(rows);
      setPage(0);
    },
    onDelete: handleOpenDeleteDialog,
    onEdit: handleEdit,
    onAdd: handleAdd,
  };

  return {
    hasPermission,
    searchWord,
    setSearchWord,
    protocolVersionFilter,
    handleProtocolVersionFilterChange,
    handleAdd,
    handleClearFilters,
    tableSectionProps,
    dialogOpen,
    selectedItem,
    handleClose,
    handleConfirmDelete,
    loading,
    handleRefresh,
    inputValue,
    setInputValue,
    canDelete,
  };
}

export function useMqttBrokerEditorPage(mode: 'add' | 'edit') {
  const navigate = useAppNavigate();
  const { mqttConfigId } = useParams<{ mqttConfigId: string }>();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [errors, setErrors] = useState<MqttBrokerFormErrors>(
    INITIAL_MQTT_BROKER_ERRORS
  );
  const [formData, setFormData] = useState<MqttBrokerForm>(
    INITIAL_MQTT_BROKER_DATA
  );

  const [isChangingCredentials, setIsChangingCredentials] = useState(
    mode === 'add'
  );

  const { showError, showSuccess } = useNotification();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);

  useEffect(() => {
    if (mode !== 'edit') return;

    const controller = new AbortController();

    const fetchMqttBroker = async () => {
      if (!mqttConfigId || !currentOrgId) return;

      try {
        const result = await mqttBrokersApi.getMqttBrokerById(
          { orgId: currentOrgId, mqttConfigId },
          controller.signal
        );

        setFormData({
          name: result.name ?? '',
          brokerEndpoint: result.brokerEndpoint ?? '',
          mqttProtocolVersion:
            result.mqttProtocolVersion ??
            INITIAL_MQTT_BROKER_DATA.mqttProtocolVersion,
          credentials: { username: '', password: '' },
        });
      } catch (error) {
        if (axios.isCancel(error)) return;

        showError(
          error instanceof Error ? error.message : 'Failed to load MQTT broker'
        );
      }
    };

    fetchMqttBroker();

    return () => controller.abort();
  }, [mode, mqttConfigId, currentOrgId, showError]);

  const submitCredentials = shouldSubmitMqttCredentials(
    mode,
    formData,
    isChangingCredentials
  );

  const validate = () => {
    const { isValid, errors: newErrors } = validateMqttBrokerForm(
      formData,
      submitCredentials
    );
    setErrors(newErrors);
    return isValid;
  };

  const handleConfirmCancel = () => {
    setCancelOpen(false);
    setSubmitOpen(false);
  };

  const handleSubmitConfirmOpen = () => {
    if (!validate()) return;
    setSubmitOpen(true);
  };

  const handleCancel = () => {
    handleConfirmCancel();
    navigate('/mqtt-brokers');
  };

  const handleOnChange = (
    field:
      | 'name'
      | 'brokerEndpoint'
      | 'mqttProtocolVersion'
      | 'username'
      | 'password',
    value: string
  ) => {
    setFormData((prev) => applyMqttBrokerChange(prev, field, value));

    if (field !== 'mqttProtocolVersion') {
      setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
    }
  };

  const handleChangeCredentials = () => {
    setIsChangingCredentials(true);
  };

  const handleKeepSavedCredentials = () => {
    setIsChangingCredentials(false);
    setFormData((prev) => ({
      ...prev,
      credentials: { username: '', password: '' },
    }));
    setErrors((prev) => ({ ...prev, username: '', password: '' }));
  };

  const reportSubmitError = (error: unknown, fallback: string): string => {
    const submittedName = formData.name.trim();
    const message = getMqttBrokerSubmitErrorMessage(
      error,
      fallback,
      submittedName
    );
    const fieldErrors = getMqttBrokerSubmitFieldErrors(error, submittedName);

    if (Object.keys(fieldErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
    }
    showError(message);

    return message;
  };

  const handleSubmit = async () => {
    if (!currentOrgId) return;

    const name = formData.name.trim();
    const brokerEndpoint = formData.brokerEndpoint.trim();
    const username = formData.credentials.username.trim();
    const password = formData.credentials.password;

    try {
      if (mode === 'add') {
        await mqttBrokersApi.postMqttBroker({
          orgId: currentOrgId,
          data: {
            name,
            brokerEndpoint,
            authType: 'UsernamePassword',
            brokerCredentials: { username, password },

            mqttProtocolVersion: formData.mqttProtocolVersion,
            keepAliveInterval: '60s', // '60s' /null,
            reconnectInterval: '5s', //'5s'/null,
            checkConnection: false,
          },
        });
        showSuccess('Broker config created successfully');
      } else {
        if (!mqttConfigId) return;

        const [putResult, patchResult] = await Promise.allSettled([
          mqttBrokersApi.putMqttBroker({
            orgId: currentOrgId,
            mqttConfigId,
            data: {
              name,
              brokerEndpoint,

              mqttProtocolVersion: formData.mqttProtocolVersion,
              keepAliveInterval: '60s', // '60s' /null,
              reconnectInterval: '5s', //'5s'/null,
              checkConnection: false,
            },
          }),
          submitCredentials
            ? mqttBrokersApi.patchMqttBrokerCredentials({
                orgId: currentOrgId,
                mqttConfigId,
                data: {
                  authType: 'UsernamePassword',
                  checkConnection: false,
                  brokerCredentials: { username, password },
                },
              })
            : Promise.resolve(),
        ]);

        if (putResult.status === 'fulfilled') {
          showSuccess(`MQTT broker [${name}] updated successfully`);
        } else {
          reportSubmitError(putResult.reason, 'Update MQTT broker failed');
        }

        if (patchResult.status === 'rejected') {
          reportSubmitError(
            patchResult.reason,
            'Update MQTT broker credentials failed'
          );
        }

        if (
          putResult.status === 'rejected' ||
          patchResult.status === 'rejected'
        ) {
          return;
        }
      }

      handleConfirmCancel();
      navigate('/mqtt-brokers');
    } catch (err: unknown) {
      const fallback =
        mode === 'add'
          ? 'Create MQTT broker failed'
          : 'Update MQTT broker failed';

      const message = reportSubmitError(err, fallback);

      console.error(
        `[${mode === 'add' ? 'AddMqttBroker' : 'EditMqttBroker'}] Submit failed:`,
        message
      );
    } finally {
      handleConfirmCancel();
    }
  };

  return {
    cancelOpen,
    submitOpen,
    formData,
    errors,
    setCancelOpen,
    handleOnChange,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
    isChangingCredentials,
    handleChangeCredentials,
    handleKeepSavedCredentials,
  };
}
