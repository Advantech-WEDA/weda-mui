import {
  analyzersApi,
  fromJsonPath,
  getAnalyzerActions,
  hasJavaScriptFormErrors,
  type IAnalyzerItem,
  isJavaScriptFormComplete,
  JAVASCRIPT_LIMITS,
  type JavaScriptFormErrors,
  type JavaScriptFormValues,
  type JavaScriptInputRow,
  type JavaScriptOutputRow,
  toJsonPath,
  validateJavaScriptForm,
} from '@features/analyzers';
import { dataStreamsApi, type IDataStreamItem } from '@features/data-streams';
import { getApiErrorMessage } from '@shared/api/ApiError';
import { fetchAllPages } from '@shared/api/fetchAllPages';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

export type AnalyzerListKind = 'input' | 'output';

export interface DataStreamPickerState {
  list: AnalyzerListKind;
  rowKey?: string;
}

let rowSeq = 0;
const nextKey = () => `row-${++rowSeq}`;

const newInputRow = (dataStreamId = ''): JavaScriptInputRow => ({
  key: nextKey(),
  dataStreamId,
  parameterName: '',
});

const newOutputRow = (dataStreamId = ''): JavaScriptOutputRow => ({
  key: nextKey(),
  dataStreamId,
  valueJsonPath: '',
  timeJsonPath: '',
});

const emptyValues = (): JavaScriptFormValues => ({
  name: '',
  description: '',
  script: '',
  inputs: [newInputRow()],
  outputs: [newOutputRow()],
});

const valuesFromAnalyzer = (analyzer: IAnalyzerItem): JavaScriptFormValues => ({
  name: analyzer.name ?? '',
  description: analyzer.description ?? '',
  script:
    typeof analyzer.config?.script === 'string' ? analyzer.config.script : '',
  inputs: (analyzer.inputParameters ?? []).map((p) => ({
    key: nextKey(),
    dataStreamId: p.dataStreamId,
    parameterName: p.parameterName,
  })),
  outputs: (analyzer.outputs ?? []).map((o) => ({
    key: nextKey(),
    dataStreamId: o.dataStreamId,
    valueJsonPath: fromJsonPath(o.valueJsonPath),
    timeJsonPath: fromJsonPath(o.timeJsonPath),
  })),
});

export function useJavaScriptAnalyzerEditorPage(analyzer?: IAnalyzerItem) {
  const mode = analyzer ? 'edit' : 'add';
  const navigate = useAppNavigate();
  const { deviceId } = useParams<{ tenant: string; deviceId: string }>();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const hasPermission = useManagementPermission().canManageDevices;
  const { showError, showSuccess } = useNotification();

  const canSubmit = analyzer
    ? getAnalyzerActions(analyzer, hasPermission).edit.enabled
    : hasPermission;

  const savedOutputIds = new Set(
    (analyzer?.outputs ?? []).map((o) => o.dataStreamId)
  );

  const [values, setValues] = useState<JavaScriptFormValues>(() =>
    analyzer ? valuesFromAnalyzer(analyzer) : emptyValues()
  );
  const [submitting, setSubmitting] = useState(false);

  const [dataStreams, setDataStreams] = useState<IDataStreamItem[]>([]);
  const [dataStreamsLoading, setDataStreamsLoading] = useState(true);

  const createdDataStreamIds = useRef<string[]>([]);

  const [picker, setPicker] = useState<DataStreamPickerState | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<JavaScriptFormErrors>({});
  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const listPath = `/devices/${deviceId}/analyzers`;

  useEffect(() => {
    if (analyzer?.isEnabled) {
      showError('Disable the analyzer before editing it');
    }
  }, [analyzer, showError]);

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

  const update = (
    updater: (prev: JavaScriptFormValues) => JavaScriptFormValues
  ) => {
    setValues((prev) => {
      const next = updater(prev);

      if (submitted) setErrors(validateJavaScriptForm(next));

      return next;
    });
  };

  const handleChange = <K extends 'name' | 'description' | 'script'>(
    field: K,
    value: JavaScriptFormValues[K]
  ) => update((prev) => ({ ...prev, [field]: value }));

  const handleInputRowChange = (
    key: string,
    field: 'dataStreamId' | 'parameterName',
    value: string
  ) =>
    update((prev) => ({
      ...prev,
      inputs: prev.inputs.map((r) =>
        r.key === key ? { ...r, [field]: value } : r
      ),
    }));

  const handleOutputRowChange = (
    key: string,
    field: 'dataStreamId' | 'valueJsonPath' | 'timeJsonPath',
    value: string
  ) =>
    update((prev) => ({
      ...prev,
      outputs: prev.outputs.map((r) =>
        r.key === key ? { ...r, [field]: value } : r
      ),
    }));

  const handleRemoveRow = (list: AnalyzerListKind, key: string) =>
    update((prev) =>
      list === 'input'
        ? { ...prev, inputs: prev.inputs.filter((r) => r.key !== key) }
        : { ...prev, outputs: prev.outputs.filter((r) => r.key !== key) }
    );

  const usedIds = (
    rows: { key: string; dataStreamId: string }[],
    skip?: string
  ) =>
    new Set(
      rows
        .filter((r) => r.key !== skip && r.dataStreamId)
        .map((r) => r.dataStreamId)
    );

  const pickerOptions = (() => {
    if (!picker) return [];

    const taken = new Set([
      ...usedIds(values.inputs, picker.rowKey),
      ...usedIds(values.outputs, picker.rowKey),
    ]);

    return dataStreams.filter(
      (s) =>
        !taken.has(s.dataStreamId) &&
        (picker.list === 'input' ||
          !s.dataSource ||
          savedOutputIds.has(s.dataStreamId))
    );
  })();

  const pickerRows = picker
    ? picker.list === 'input'
      ? values.inputs
      : values.outputs
    : [];

  const pickerInitialSelected = picker?.rowKey
    ? pickerRows
        .filter((r) => r.key === picker.rowKey && r.dataStreamId)
        .map((r) => r.dataStreamId)
    : [];

  const listLimit = (list: AnalyzerListKind) =>
    list === 'input'
      ? JAVASCRIPT_LIMITS.maxInputs
      : JAVASCRIPT_LIMITS.maxOutputs;

  const pickerMaxSelect =
    picker && !picker.rowKey
      ? Math.max(
          0,
          listLimit(picker.list) -
            pickerRows.filter((r) => r.dataStreamId).length
        )
      : undefined;

  const handleOpenPicker = (list: AnalyzerListKind, rowKey?: string) => {
    setPicker({ list, rowKey });
    setPickerOpen(true);
  };

  const handleClosePicker = () => setPickerOpen(false);

  const handlePickerSelect = (ids: string[]) => {
    if (!picker || !ids.length) return;

    const { list, rowKey } = picker;

    const fill = <T extends { key: string; dataStreamId: string }>(
      rows: T[],
      create: (id: string) => T
    ): T[] => {
      if (rowKey) {
        return rows.map((r) =>
          r.key === rowKey ? { ...r, dataStreamId: ids[0] } : r
        );
      }

      const queue = [...ids];
      const filled = rows.map((r) =>
        !r.dataStreamId && queue.length
          ? { ...r, dataStreamId: queue.shift() as string }
          : r
      );

      const room = Math.max(0, listLimit(list) - filled.length);

      return [...filled, ...queue.slice(0, room).map(create)];
    };

    update((prev) =>
      list === 'input'
        ? { ...prev, inputs: fill(prev.inputs, newInputRow) }
        : { ...prev, outputs: fill(prev.outputs, newOutputRow) }
    );
    setPickerOpen(false);
  };

  const handleDataStreamCreated = (dataStream: IDataStreamItem) => {
    createdDataStreamIds.current.push(dataStream.dataStreamId);
    setDataStreams((prev) => [...prev, dataStream]);
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

    const clear = <T extends { dataStreamId: string }>(rows: T[]) =>
      rows.map((r) =>
        removed.has(r.dataStreamId) ? { ...r, dataStreamId: '' } : r
      );

    setDataStreams((prev) => prev.filter((s) => !removed.has(s.dataStreamId)));
    setValues((prev) => ({
      ...prev,
      inputs: clear(prev.inputs),
      outputs: clear(prev.outputs),
    }));
  };

  const handleOpenSubmitDialog = () => {
    if (!canSubmit) return;

    setSubmitted(true);

    const nextErrors = validateJavaScriptForm(values);

    setErrors(nextErrors);

    if (!hasJavaScriptFormErrors(nextErrors)) {
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
      inputParameters: values.inputs.map((r) => ({
        parameterName: r.parameterName.trim(),
        dataStreamId: r.dataStreamId,
      })),
      config: { script: values.script },

      outputs: values.outputs.map((r) => ({
        dataStreamId: r.dataStreamId,
        valueJsonPath: toJsonPath(r.valueJsonPath),
        timeJsonPath: toJsonPath(r.timeJsonPath),
      })),
    };

    setSubmitting(true);

    try {
      if (!analyzer) {
        await analyzersApi.postAnalyzer({
          orgId: currentOrgId,
          deviceId,
          data: {
            ...payload,
            type: 'JavaScript',
            description: values.description.trim() || null,
          },
        });

        showSuccess('Analyzer created successfully');
      } else {
        await analyzersApi.patchAnalyzer({
          orgId: currentOrgId,
          deviceId,
          analyzerId: analyzer.analyzerId,

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
          analyzer ? 'Update analyzer failed' : 'Create analyzer failed'
        )
      );
      handleCloseDialogs();

      if (!analyzer) {
        await rollbackCreatedDataStreams();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    mode,
    analyzerName: analyzer?.name ?? '',
    canSubmit,
    isComplete: isJavaScriptFormComplete(values),
    submitting,
    dataStreamsLoading,
    dataStreamsById: new Map(dataStreams.map((s) => [s.dataStreamId, s])),
    values,
    errors,
    cancelOpen,
    submitOpen,
    picker,
    pickerOpen,
    pickerOptions,
    pickerInitialSelected,
    pickerMaxSelect,
    handleChange,
    handleInputRowChange,
    handleOutputRowChange,
    handleRemoveRow,
    handleOpenPicker,
    handleClosePicker,
    handlePickerSelect,
    handleDataStreamCreated,
    handleOpenCancelDialog: () => setCancelOpen(true),
    handleOpenSubmitDialog,
    handleCloseDialogs,
    handleLeave,
    handleSubmit,
  };
}
