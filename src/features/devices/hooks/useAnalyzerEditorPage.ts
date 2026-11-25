import {
  analyzersApi,
  getAnalyzerActions,
  isTransferFunctionFormComplete,
  TRANSFER_FUNCTION_PARAMETER_NAME,
  type TransferFunctionFormErrors,
  type TransferFunctionFormValues,
  validateTransferFunctionForm,
} from '@features/analyzers';
import { dataStreamsApi, type IDataStreamItem } from '@features/data-streams';
import { getApiErrorMessage } from '@shared/api/ApiError';
import { fetchAllPages } from '@shared/api/fetchAllPages';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import axios from 'axios';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

const EMPTY_VALUES: TransferFunctionFormValues = {
  name: '',
  description: '',
  expression: '',
  inputDataStreamId: '',
  outputDataStreamId: '',
};

export function useAnalyzerEditorPage(mode: 'add' | 'edit') {
  const navigate = useAppNavigate();
  const { deviceId, analyzerId } = useParams<{
    tenant: string;
    deviceId: string;
    analyzerId: string;
  }>();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const hasPermission = useManagementPermission().canManageDevices;
  const { showError, showSuccess } = useNotification();

  const [values, setValues] =
    useState<TransferFunctionFormValues>(EMPTY_VALUES);

  const [analyzerName, setAnalyzerName] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);

  const [isSupportedType, setIsSupportedType] = useState(true);

  const [savedOutputId, setSavedOutputId] = useState('');
  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);

  const [dataStreams, setDataStreams] = useState<IDataStreamItem[]>([]);
  const [dataStreamsLoading, setDataStreamsLoading] = useState(true);

  const createdDataStreamIds = useRef<string[]>([]);

  const [submitted, setSubmitted] = useState(false);
  const [expressionTouched, setExpressionTouched] = useState(false);
  const [errors, setErrors] = useState<TransferFunctionFormErrors>({});
  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const listPath = `/devices/${deviceId}/analyzers`;

  const canSubmit =
    mode === 'add'
      ? hasPermission
      : isSupportedType &&
        getAnalyzerActions({ isEnabled }, hasPermission).edit.enabled;

  useEffect(() => {
    if (!currentOrgId || !deviceId) return;

    const controller = new AbortController();

    const fetchDataStreams = async () => {
      setDataStreamsLoading(true);

      try {
        const result = await fetchAllPages((paging) =>
          dataStreamsApi.getDataStreamsList(
            { orgId: currentOrgId, deviceId, ...paging },
            controller.signal
          )
        );

        setDataStreams(result.items);
      } catch (error) {
        if (axios.isCancel(error)) return;

        setDataStreams([]);
        showError(error instanceof Error ? error.message : String(error));
      } finally {
        if (!controller.signal.aborted) {
          setDataStreamsLoading(false);
        }
      }
    };

    fetchDataStreams();

    return () => controller.abort();
  }, [currentOrgId, deviceId, showError]);

  useEffect(() => {
    if (mode !== 'edit' || !currentOrgId || !deviceId || !analyzerId) return;

    const controller = new AbortController();

    const fetchAnalyzer = async () => {
      setLoading(true);

      try {
        const data = await analyzersApi.getAnalyzerById(
          { orgId: currentOrgId, deviceId, analyzerId },
          controller.signal
        );

        setValues({
          name: data.name ?? '',
          description: data.description ?? '',
          expression:
            typeof data.config?.expression === 'string'
              ? data.config.expression
              : '',
          inputDataStreamId: data.inputParameters?.[0]?.dataStreamId ?? '',
          outputDataStreamId: data.outputs?.[0]?.dataStreamId ?? '',
        });
        setAnalyzerName(data.name ?? '');
        setIsEnabled(data.isEnabled);
        setSavedOutputId(data.outputs?.[0]?.dataStreamId ?? '');

        setIsSupportedType(data.type === 'TransferFunction');

        if (data.type !== 'TransferFunction') {
          showError(`${data.type} analyzers cannot be edited here`);
        } else if (data.isEnabled) {
          showError('Disable the analyzer before editing it');
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

    fetchAnalyzer();

    return () => controller.abort();
  }, [mode, currentOrgId, deviceId, analyzerId, showError]);

  const outputOptions = useMemo(
    () =>
      dataStreams.filter(
        (s) => !s.dataSource || s.dataStreamId === savedOutputId
      ),
    [dataStreams, savedOutputId]
  );

  const handleChange = <K extends keyof TransferFunctionFormValues>(
    field: K,
    value: TransferFunctionFormValues[K]
  ) => {
    const next = { ...values, [field]: value };

    setValues(next);

    if (submitted) {
      setErrors(validateTransferFunctionForm(next));
    } else if (field === 'expression' && expressionTouched) {
      setErrors((prev) => ({
        ...prev,
        expression: validateTransferFunctionForm(next).expression,
      }));
    }
  };

  const handleExpressionBlur = () => {
    setExpressionTouched(true);
    setErrors((prev) => ({
      ...prev,
      expression: validateTransferFunctionForm(values).expression,
    }));
  };

  const handleDataStreamCreated = (dataStream: IDataStreamItem) => {
    createdDataStreamIds.current.push(dataStream.dataStreamId);
    setDataStreams((prev) => [...prev, dataStream]);
    setValues((prev) => {
      const next = { ...prev, outputDataStreamId: dataStream.dataStreamId };

      if (submitted) setErrors(validateTransferFunctionForm(next));

      return next;
    });
  };

  const rollbackCreatedDataStreams = async () => {
    const ids = createdDataStreamIds.current;

    if (!ids.length || !currentOrgId || !deviceId) return;

    createdDataStreamIds.current = [];

    const results = await Promise.allSettled(
      ids.map((dataStreamId) =>
        dataStreamsApi.deleteDataStream({
          orgId: currentOrgId,
          deviceId,
          dataStreamId,
        })
      )
    );

    const removed = new Set(
      ids.filter((_, index) => results[index].status === 'fulfilled')
    );

    createdDataStreamIds.current = ids.filter((id) => !removed.has(id));

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `[Add analyzer] rollback of DataStream ${ids[index]} failed:`,
          result.reason
        );
      }
    });

    setDataStreams((prev) => prev.filter((s) => !removed.has(s.dataStreamId)));
    setValues((prev) =>
      removed.has(prev.outputDataStreamId)
        ? { ...prev, outputDataStreamId: '' }
        : prev
    );
  };

  const handleOpenSubmitDialog = () => {
    if (!canSubmit) return;

    setSubmitted(true);

    const nextErrors = validateTransferFunctionForm(values);

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

    const name = values.name.trim();
    const payload = {
      name,
      description: values.description.trim() || null,
      inputParameters: [
        {
          parameterName: TRANSFER_FUNCTION_PARAMETER_NAME,
          dataStreamId: values.inputDataStreamId,
        },
      ],
      config: { expression: values.expression.trim() },
      outputs: [{ dataStreamId: values.outputDataStreamId }] as [
        { dataStreamId: string },
      ],
    };

    setSubmitting(true);

    try {
      if (mode === 'add') {
        await analyzersApi.postAnalyzer({
          orgId: currentOrgId,
          deviceId,
          data: { ...payload, type: 'TransferFunction' },
        });

        showSuccess('Analyzer created successfully');
      } else {
        if (!analyzerId) return;

        await analyzersApi.patchAnalyzer({
          orgId: currentOrgId,
          deviceId,
          analyzerId,

          data: { ...payload, description: values.description.trim() },
        });

        showSuccess(`Analyzer [${name}] updated successfully`);
      }

      handleCloseDialogs();
      navigate(listPath);
    } catch (error) {
      showError(
        getApiErrorMessage(
          error,
          mode === 'add' ? 'Create analyzer failed' : 'Update analyzer failed'
        )
      );
      handleCloseDialogs();

      if (mode === 'add') {
        await rollbackCreatedDataStreams();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    mode,
    analyzerName,
    canSubmit,
    isComplete: isTransferFunctionFormComplete(values),
    loading,
    submitting,
    dataStreamsLoading,
    inputOptions: dataStreams,
    outputOptions,
    values,
    errors,
    cancelOpen,
    submitOpen,
    handleChange,
    handleExpressionBlur,
    handleDataStreamCreated,
    handleOpenCancelDialog: () => setCancelOpen(true),
    handleOpenSubmitDialog,
    handleCloseDialogs,
    handleLeave,
    handleSubmit,
  };
}
