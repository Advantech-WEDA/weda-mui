import {
  DATA_STREAM_FIELD_LIMITS,
  type DataStreamFormErrors,
} from '@features/data-streams';
import {
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  TextField,
} from '@mui/material';
import { useMemo } from 'react';

import { dataTypeOptions } from '@/features/devices/components/Detail/DataStreams/dataStreamDisplay';
import DataTypeOption from '@/features/devices/components/Detail/DataStreams/DataTypeOption';
import type { DataStreamEditorValues } from '@/features/devices/hooks/useDataStreamEditorPage';

interface IProps {
  mode: 'add' | 'edit';
  values: DataStreamEditorValues;
  errors: DataStreamFormErrors;
  isSystemManaged: boolean;
  disabled?: boolean;
  onChange: <K extends keyof DataStreamEditorValues>(
    field: K,
    value: DataStreamEditorValues[K]
  ) => void;
}

const SELECTABLE_DATA_TYPES = dataTypeOptions.map((option) => option.value);

const Counter = ({ value, max }: { value: string; max: number }) => (
  <Box className="editor-page__form-wrapper-helper">
    {value.length}/{max}
  </Box>
);

const RequiredLabel = ({ label }: { label: string }) => (
  <>
    {label} <span className="required">*</span>
  </>
);

export default function BasicInformation({
  mode,
  values,
  errors,
  isSystemManaged,
  disabled = false,
  onChange,
}: IProps) {
  const selectableDataTypes = useMemo(
    () =>
      values.dataType && !SELECTABLE_DATA_TYPES.includes(values.dataType)
        ? [...SELECTABLE_DATA_TYPES, values.dataType]
        : SELECTABLE_DATA_TYPES,
    [values.dataType]
  );

  return (
    <Box className="editor-page__form">
      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          className="editor-page__form-wrapper-textfield"
          label={<RequiredLabel label="DataStream name" />}
          disabled={disabled || mode === 'edit'}
          value={values.dataStreamName}
          error={Boolean(errors.dataStreamName)}
          helperText={errors.dataStreamName}
          slotProps={{
            htmlInput: { maxLength: DATA_STREAM_FIELD_LIMITS.dataStreamName },
          }}
          onChange={(e) => onChange('dataStreamName', e.target.value)}
        />
        <Counter
          value={values.dataStreamName}
          max={DATA_STREAM_FIELD_LIMITS.dataStreamName}
        />
      </Box>

      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          className="editor-page__form-wrapper-textfield"
          label={<RequiredLabel label="Display name" />}
          disabled={disabled}
          value={values.displayName}
          error={Boolean(errors.displayName)}
          helperText={errors.displayName}
          slotProps={{
            htmlInput: { maxLength: DATA_STREAM_FIELD_LIMITS.displayName },
          }}
          onChange={(e) => onChange('displayName', e.target.value)}
        />
        <Counter
          value={values.displayName}
          max={DATA_STREAM_FIELD_LIMITS.displayName}
        />
      </Box>

      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          multiline
          minRows={1}
          size="small"
          className="editor-page__form-wrapper-textfield"
          label="Description"
          disabled={disabled}
          value={values.description}
          error={Boolean(errors.description)}
          helperText={errors.description}
          slotProps={{
            htmlInput: { maxLength: DATA_STREAM_FIELD_LIMITS.description },
          }}
          onChange={(e) => onChange('description', e.target.value)}
        />
        <Counter
          value={values.description}
          max={DATA_STREAM_FIELD_LIMITS.description}
        />
      </Box>

      <Box className="editor-page__form-wrapper">
        <TextField
          select
          fullWidth
          size="small"
          className="editor-page__form-wrapper-textfield"
          label={<RequiredLabel label="Data type" />}
          disabled={disabled || isSystemManaged}
          value={values.dataType}
          error={Boolean(errors.dataType)}
          helperText={errors.dataType}
          slotProps={{
            select: {
              renderValue: (value) =>
                value ? <DataTypeOption type={value as string} /> : '',
            },
          }}
          onChange={(e) => onChange('dataType', e.target.value)}
        >
          {selectableDataTypes.map((type) => (
            <MenuItem key={type} value={type}>
              <DataTypeOption type={type} />
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          className="editor-page__form-wrapper-textfield"
          label="Unit"
          placeholder="e.g. °C"
          disabled={disabled}
          value={values.unitDisplay}
          error={Boolean(errors.unitDisplay)}
          helperText={errors.unitDisplay}
          slotProps={{
            htmlInput: { maxLength: DATA_STREAM_FIELD_LIMITS.unitDisplay },
          }}
          onChange={(e) => onChange('unitDisplay', e.target.value)}
        />
        <Counter
          value={values.unitDisplay}
          max={DATA_STREAM_FIELD_LIMITS.unitDisplay}
        />
      </Box>

      <Box className="editor-page__form-wrapper">
        <FormControlLabel
          control={
            <Checkbox
              disabled={disabled}
              checked={values.recordToDataLake}
              onChange={(e) => onChange('recordToDataLake', e.target.checked)}
            />
          }
          label="Record to data lake"
        />
      </Box>
    </Box>
  );
}
