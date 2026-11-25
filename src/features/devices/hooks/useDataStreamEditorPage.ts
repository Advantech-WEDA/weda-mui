import {
  type DataStreamDataType,
  type DataStreamFormErrors,
  type DataStreamFormValues,
  type DataStreamManagedBy,
  dataStreamsApi,
  getDataStreamActions,
  validateDataStreamForm,
} from '@features/data-streams';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export interface DataStreamEditorValues extends DataStreamFormValues {
  recordToDataLake: boolean;
}

const EMPTY_VALUES: DataStreamEditorValues = {
  dataStreamName: '',
  displayName: '',
  description: '',
  unitDisplay: '',
  dataType: '',

  recordToDataLake: true,
};

const orNull = (value: string) => value.trim() || null;

export function useDataStreamEditorPage(mode: 'add' | 'edit') {
  const navigate = useAppNavigate();
  const { deviceId, dataStreamId } = useParams<{
    tenant: string;
    deviceId: string;
    dataStreamId: string;
  }>();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const hasPermission = useManagementPermission().canManageDevices;
  const { showError, showSuccess } = useNotification();

  const [values, setValues] = useState<DataStreamEditorValues>(EMPTY_VALUES);
  const [managedBy, setManagedBy] = useState<DataStreamManagedBy>('User');

  const [originalDisplayName, setOriginalDisplayName] = useState('');
  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<DataStreamFormErrors>({});
  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const listPath = `/devices/${deviceId}/data-streams`;
  const isSystemManaged = managedBy === 'System';

  const canSubmit =
    mode === 'add'
      ? hasPermission
      : getDataStreamActions({ managedBy }, hasPermission).edit.enabled;

  useEffect(() => {
    if (mode !== 'edit' || !currentOrgId || !deviceId || !dataStreamId) return;

    const controller = new AbortController();

    const fetchDataStream = async () => {
      setLoading(true);

      try {
        const data = await dataStreamsApi.getDataStreamById(
          { orgId: currentOrgId, deviceId, dataStreamId },
          controller.signal
        );

        setValues({
          dataStreamName: data.dataStreamName ?? '',
          displayName: data.displayName ?? '',
          description: data.description ?? '',
          unitDisplay: data.unitDisplay ?? '',
          dataType: data.dataType ?? '',
          recordToDataLake: data.recordToDataLake,
        });
        setManagedBy(data.managedBy);
        setOriginalDisplayName(data.displayName ?? '');

        if (data.managedBy === 'System') {
          showError('System-managed DataStreams cannot be edited');
        }
      } catch (error) {
        if (axios.isCancel(error)) return;

        showError(error instanceof Error ? error.message : String(error));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchDataStream();

    return () => controller.abort();
  }, [mode, currentOrgId, deviceId, dataStreamId, showError]);

  const handleChange = <K extends keyof DataStreamEditorValues>(
    field: K,
    value: DataStreamEditorValues[K]
  ) => {
    const next = { ...values, [field]: value };

    setValues(next);

    if (submitted) {
      setErrors(validateDataStreamForm(next));
    }
  };

  const handleOpenSubmitDialog = () => {
    if (!canSubmit) return;

    setSubmitted(true);

    const nextErrors = validateDataStreamForm(values);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setSubmitOpen(true);
    }
  };

  const handleCloseDialogs = () => {
    setCancelOpen(false);
    setSubmitOpen(false);
  };

  const handleLeave = () => {
    handleCloseDialogs();
    navigate(listPath);
  };

  const handleSubmit = async () => {
    if (!canSubmit || !currentOrgId || !deviceId || submitting) return;

    const payload = {
      displayName: values.displayName.trim(),
      description: orNull(values.description),
      unitDisplay: orNull(values.unitDisplay),
      recordToDataLake: values.recordToDataLake,
    };

    setSubmitting(true);

    try {
      if (mode === 'add') {
        await dataStreamsApi.postDataStream({
          orgId: currentOrgId,
          deviceId,
          data: {
            ...payload,
            dataStreamName: values.dataStreamName.trim(),
            dataType: values.dataType as DataStreamDataType,
          },
        });

        showSuccess('DataStream created successfully');
      } else {
        if (!dataStreamId) return;

        await dataStreamsApi.putDataStream({
          orgId: currentOrgId,
          deviceId,
          dataStreamId,
          data: {
            ...payload,
            dataStreamName: values.dataStreamName.trim(),
            dataType: values.dataType as DataStreamDataType,
          },
        });

        showSuccess(`DataStream [${payload.displayName}] updated successfully`);
      }

      handleCloseDialogs();
      navigate(listPath);
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : mode === 'add'
            ? 'Create DataStream failed'
            : 'Update DataStream failed'
      );
      handleCloseDialogs();
    } finally {
      setSubmitting(false);
    }
  };

  return {
    mode,
    canSubmit,
    loading,
    submitting,
    values,
    errors,
    originalDisplayName,
    isSystemManaged,
    cancelOpen,
    submitOpen,
    handleChange,
    handleOpenCancelDialog: () => setCancelOpen(true),
    handleOpenSubmitDialog,
    handleCloseDialogs,
    handleLeave,
    handleSubmit,
  };
}
