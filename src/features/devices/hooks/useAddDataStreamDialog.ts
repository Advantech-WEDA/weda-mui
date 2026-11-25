import {
  type DataStreamDataType,
  type DataStreamFormErrors,
  dataStreamsApi,
  type IDataStreamItem,
  validateDataStreamForm,
} from '@features/data-streams';
import { getApiErrorMessage } from '@shared/api/ApiError';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import type { DataStreamEditorValues } from './useDataStreamEditorPage';

const EMPTY_VALUES: DataStreamEditorValues = {
  dataStreamName: '',
  displayName: '',
  description: '',
  unitDisplay: '',
  dataType: '',

  recordToDataLake: true,
};

const orNull = (value: string) => value.trim() || null;

export function useAddDataStreamDialog(
  onCreated: (dataStream: IDataStreamItem) => void
) {
  const { deviceId } = useParams<{ tenant: string; deviceId: string }>();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const { showError, showSuccess } = useNotification();

  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<DataStreamEditorValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<DataStreamFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleOpen = () => {
    setValues(EMPTY_VALUES);
    setErrors({});
    setSubmitted(false);
    setOpen(true);
  };

  const handleClose = () => {
    if (submitting) return;
    setOpen(false);
    setConfirmOpen(false);
  };

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

  const handleSubmit = () => {
    setSubmitted(true);

    const nextErrors = validateDataStreamForm(values);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setConfirmOpen(true);
    }
  };

  const handleCloseConfirm = () => {
    if (!submitting) setConfirmOpen(false);
  };

  const handleConfirm = async () => {
    if (!currentOrgId || !deviceId || submitting) return;

    setSubmitting(true);

    try {
      const created = await dataStreamsApi.postDataStream({
        orgId: currentOrgId,
        deviceId,
        data: {
          dataStreamName: values.dataStreamName.trim(),
          displayName: values.displayName.trim(),
          description: orNull(values.description),
          unitDisplay: orNull(values.unitDisplay),
          dataType: values.dataType as DataStreamDataType,
          recordToDataLake: values.recordToDataLake,
        },
      });

      showSuccess('DataStream created successfully');
      setConfirmOpen(false);
      setOpen(false);
      onCreated(created);
    } catch (error) {
      showError(getApiErrorMessage(error, 'Create DataStream failed'));
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    open,
    values,
    errors,
    confirmOpen,
    submitting,
    handleOpen,
    handleClose,
    handleChange,
    handleSubmit,
    handleCloseConfirm,
    handleConfirm,
  };
}
