export const DATA_STREAM_FIELD_LIMITS = {
  dataStreamName: 128,
  displayName: 200,
  description: 500,
  unitDisplay: 50,
} as const;

export interface DataStreamFormValues {
  dataStreamName: string;
  displayName: string;
  description: string;
  unitDisplay: string;
  dataType: string;
}

export type DataStreamFormErrors = Partial<
  Record<keyof DataStreamFormValues, string>
>;

const tooLong = (label: string, max: number) =>
  `${label} must be ${max} characters or fewer`;

export function validateDataStreamForm(
  values: DataStreamFormValues
): DataStreamFormErrors {
  const errors: DataStreamFormErrors = {};
  const name = values.dataStreamName.trim();
  const displayName = values.displayName.trim();

  if (!name) {
    errors.dataStreamName = 'DataStream name is required';
  } else if (name.length > DATA_STREAM_FIELD_LIMITS.dataStreamName) {
    errors.dataStreamName = tooLong(
      'DataStream name',
      DATA_STREAM_FIELD_LIMITS.dataStreamName
    );
  }

  if (!displayName) {
    errors.displayName = 'Display name is required';
  } else if (displayName.length > DATA_STREAM_FIELD_LIMITS.displayName) {
    errors.displayName = tooLong(
      'Display name',
      DATA_STREAM_FIELD_LIMITS.displayName
    );
  }

  if (values.description.length > DATA_STREAM_FIELD_LIMITS.description) {
    errors.description = tooLong(
      'Description',
      DATA_STREAM_FIELD_LIMITS.description
    );
  }

  if (values.unitDisplay.length > DATA_STREAM_FIELD_LIMITS.unitDisplay) {
    errors.unitDisplay = tooLong('Unit', DATA_STREAM_FIELD_LIMITS.unitDisplay);
  }

  if (!values.dataType) {
    errors.dataType = 'Data type is required';
  }

  return errors;
}
