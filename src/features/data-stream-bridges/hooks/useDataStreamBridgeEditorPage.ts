import { dataStreamsApi, type IDataStreamItem } from '@features/data-streams';
import { devicesApi, type IDeviceItem } from '@features/devices';
import {
  type IMqttBrokerListItem,
  mqttBrokersApi,
} from '@features/mqtt-brokers';
import { fetchAllPages, MAX_PAGE_SIZE } from '@shared/api/fetchAllPages';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { dataStreamBridgesApi } from '@/features/data-stream-bridges/api/dataStreamBridges.api';
import type { IDataStreamBridgeAssemblyPolicy } from '@/features/data-stream-bridges/api/dataStreamBridges.api.types';
import {
  getBridgeSubmitErrorMessage,
  getBridgeSubmitFieldErrors,
  getRawApiErrorMessage,
} from '@/features/data-stream-bridges/api/dataStreamBridges.errors';
import {
  bridgeDetailToForm,
  formToBridgeRequest,
} from '@/features/data-stream-bridges/api/dataStreamBridges.mapper';
import {
  createEmptyBindingRow,
  createInitialBridgeForm,
  hasBridgeFormErrors,
  INITIAL_BRIDGE_ERRORS,
  isBridgeFormComplete,
  syncBindingCollisionErrors,
  validateBridgeForm,
} from '@/features/data-stream-bridges/domain/dataStreamBridge.rules';
import type {
  BasicField,
  BindingField,
  DataStreamBridgeForm,
  DataStreamBridgeFormErrors,
  MqttQos,
} from '@/features/data-stream-bridges/domain/types';

const LIST_PATH = '/data-stream-bridges';

export function useDataStreamBridgeEditorPage(mode: 'add' | 'edit') {
  const navigate = useAppNavigate();
  const { bridgeId } = useParams<{ bridgeId: string }>();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const { showError, showSuccess } = useNotification();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<DataStreamBridgeForm>(
    mode === 'add'
      ? createInitialBridgeForm
      : () => ({ ...createInitialBridgeForm(), bindings: [] })
  );
  const [errors, setErrors] = useState<DataStreamBridgeFormErrors>(
    INITIAL_BRIDGE_ERRORS
  );

  const [assemblyPolicy, setAssemblyPolicy] =
    useState<IDataStreamBridgeAssemblyPolicy>();

  const [brokers, setBrokers] = useState<IMqttBrokerListItem[]>([]);
  const [brokersLoading, setBrokersLoading] = useState(false);
  const [devices, setDevices] = useState<IDeviceItem[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);

  const [streamsByDevice, setStreamsByDevice] = useState<
    Record<string, IDataStreamItem[]>
  >({});
  const [streamsLoadingIds, setStreamsLoadingIds] = useState<Set<string>>(
    new Set()
  );
  const requestedDeviceIds = useRef(new Set<string>());

  useEffect(() => {
    if (!currentOrgId) return;

    const controller = new AbortController();

    const load = async () => {
      setBrokersLoading(true);
      setDevicesLoading(true);

      const [brokerResult, deviceResult] = await Promise.allSettled([
        fetchAllPages(
          (paging) =>
            mqttBrokersApi.getMqttBrokersList(
              { orgId: currentOrgId, sorting: 'Name asc', ...paging },
              controller.signal
            ),
          MAX_PAGE_SIZE
        ),
        fetchAllPages(
          (paging) =>
            devicesApi.getDevices(
              { orgId: currentOrgId, ...paging },
              controller.signal
            ),
          MAX_PAGE_SIZE
        ),
      ]);

      if (controller.signal.aborted) return;

      if (brokerResult.status === 'fulfilled') {
        setBrokers(brokerResult.value.items);
      } else if (!axios.isCancel(brokerResult.reason)) {
        showError('Failed to load MQTT brokers');
      }

      if (deviceResult.status === 'fulfilled') {
        setDevices(
          [...deviceResult.value.items].sort((a, b) =>
            (a.deviceName ?? '').localeCompare(b.deviceName ?? '')
          )
        );
      } else if (!axios.isCancel(deviceResult.reason)) {
        showError('Failed to load devices');
      }

      setBrokersLoading(false);
      setDevicesLoading(false);
    };

    load();

    return () => controller.abort();
  }, [currentOrgId, showError]);

  const loadDataStreams = useCallback(
    async (deviceId: string) => {
      if (!deviceId || !currentOrgId) return;
      if (requestedDeviceIds.current.has(deviceId)) return;

      requestedDeviceIds.current.add(deviceId);
      setStreamsLoadingIds((prev) => new Set(prev).add(deviceId));

      try {
        const data = await fetchAllPages(
          (paging) =>
            dataStreamsApi.getDataStreamsList({
              orgId: currentOrgId,
              deviceId,
              ...paging,
            }),
          MAX_PAGE_SIZE
        );

        const streams = [...data.items].sort((a, b) =>
          (a.dataStreamName ?? '').localeCompare(b.dataStreamName ?? '')
        );

        setStreamsByDevice((prev) => ({ ...prev, [deviceId]: streams }));
      } catch (error) {
        requestedDeviceIds.current.delete(deviceId);
        showError(
          error instanceof Error ? error.message : 'Failed to load data streams'
        );
      } finally {
        setStreamsLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(deviceId);
          return next;
        });
      }
    },
    [currentOrgId, showError]
  );

  useEffect(() => {
    if (mode !== 'edit' || !bridgeId || !currentOrgId) return;

    const controller = new AbortController();

    const fetchBridge = async () => {
      try {
        const detail = await dataStreamBridgesApi.getDataStreamBridgeById(
          { orgId: currentOrgId, bridgeId },
          controller.signal
        );

        const form = bridgeDetailToForm(detail);
        setFormData(form);
        setAssemblyPolicy(detail.assemblyPolicy ?? undefined);

        new Set(form.bindings.map((row) => row.deviceId)).forEach(
          (deviceId) => void loadDataStreams(deviceId)
        );
      } catch (error) {
        if (axios.isCancel(error)) return;

        showError(
          error instanceof Error
            ? error.message
            : 'Failed to load DataStream bridge'
        );
      }
    };

    fetchBridge();

    return () => controller.abort();
  }, [mode, bridgeId, currentOrgId, loadDataStreams, showError]);

  const clearRowError = (rowId: string, field?: BindingField) =>
    setErrors((prev) => {
      const rowErrors = prev.bindingRows[rowId];
      if (!rowErrors) return prev;

      const nextRows = { ...prev.bindingRows };
      if (field) nextRows[rowId] = { ...rowErrors, [field]: '' };
      else delete nextRows[rowId];

      return { ...prev, bindingRows: nextRows };
    });

  useEffect(() => {
    setErrors((prev) => syncBindingCollisionErrors(formData, prev));
  }, [formData]);

  const clearBindingsError = () =>
    setErrors((prev) => (prev.bindings ? { ...prev, bindings: '' } : prev));

  const handleBasicChange = (field: BasicField, value: string) => {
    setFormData((prev) =>
      field === 'qos'
        ? { ...prev, qos: Number(value) as MqttQos }
        : { ...prev, [field]: value }
    );

    if (field !== 'qos') setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleBindingChange = (
    rowId: string,
    field: BindingField,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      bindings: prev.bindings.map((row) => {
        if (row.rowId !== rowId) return row;

        if (field === 'deviceId') {
          return value === row.deviceId
            ? row
            : { ...row, deviceId: value, dataStreamId: '' };
        }

        return { ...row, [field]: value };
      }),
    }));

    clearRowError(rowId, field);
    clearBindingsError();

    if (field === 'deviceId') void loadDataStreams(value);
  };

  const handleAddBinding = () => {
    setFormData((prev) => ({
      ...prev,
      bindings: [...prev.bindings, createEmptyBindingRow()],
    }));
    setErrors((prev) => ({ ...prev, bindings: '' }));
  };

  const handleRemoveBindings = (rowIds: string[]) => {
    const ids = new Set(rowIds);

    setFormData((prev) => ({
      ...prev,
      bindings: prev.bindings.filter((row) => !ids.has(row.rowId)),
    }));
    rowIds.forEach((rowId) => clearRowError(rowId));
    clearBindingsError();
  };

  const handleConfirmCancel = () => {
    setCancelOpen(false);
    setSubmitOpen(false);
  };

  const handleCancel = () => {
    handleConfirmCancel();
    navigate(LIST_PATH);
  };

  const handleSubmitConfirmOpen = () => {
    const { isValid, errors: nextErrors } = validateBridgeForm(formData);

    setErrors(nextErrors);
    if (!isValid) return;

    setSubmitOpen(true);
  };

  const handleSubmit = async () => {
    if (!currentOrgId || submitting) return;

    setSubmitting(true);
    try {
      if (mode === 'add') {
        await dataStreamBridgesApi.postDataStreamBridge({
          orgId: currentOrgId,
          data: formToBridgeRequest(formData),
        });

        showSuccess('DataStream bridge created successfully');
      } else {
        if (!bridgeId) return;

        await dataStreamBridgesApi.putDataStreamBridge({
          orgId: currentOrgId,
          bridgeId,
          data: formToBridgeRequest(formData, assemblyPolicy),
        });

        showSuccess(
          `DataStream bridge [${formData.name.trim()}] updated successfully`
        );
      }

      handleConfirmCancel();
      navigate(LIST_PATH);
    } catch (err: unknown) {
      const fallback =
        mode === 'add'
          ? 'Create DataStream bridge failed'
          : 'Update DataStream bridge failed';

      const ctx = { form: formData, brokers, devices, streamsByDevice };
      const fieldErrors = getBridgeSubmitFieldErrors(err, ctx);
      const hasFieldError = Object.keys(fieldErrors).length > 0;

      const message = hasFieldError
        ? getBridgeSubmitErrorMessage(err, fallback, ctx)
        : getRawApiErrorMessage(err, fallback);

      if (hasFieldError) {
        setErrors((prev) => ({
          ...prev,
          ...fieldErrors,
          bindingRows: {
            ...prev.bindingRows,
            ...fieldErrors.bindingRows,
          },
        }));
      }
      showError(message);

      console.error(
        `[${mode === 'add' ? 'AddDataStreamBridge' : 'EditDataStreamBridge'}] Submit failed:`,
        message
      );
    } finally {
      setSubmitting(false);
      handleConfirmCancel();
    }
  };

  return {
    cancelOpen,
    submitOpen,
    submitting,
    formData,
    errors,

    canSubmit: isBridgeFormComplete(formData) && !hasBridgeFormErrors(errors),
    brokers,
    brokersLoading,
    devices,
    devicesLoading,
    streamsByDevice,
    streamsLoadingIds,
    setCancelOpen,
    handleBasicChange,
    handleBindingChange,
    handleAddBinding,
    handleRemoveBindings,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
  };
}

export type DataStreamBridgeEditorState = ReturnType<
  typeof useDataStreamBridgeEditorPage
>;
