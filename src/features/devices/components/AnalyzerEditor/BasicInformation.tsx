import {
  ANALYZER_FIELD_LIMITS,
  TRANSFER_FUNCTION_PARAMETER_NAME as INPUT,
  type TransferFunctionFormErrors,
  type TransferFunctionFormValues,
} from '@features/analyzers';
import { Box, TextField } from '@mui/material';

interface IProps {
  values: TransferFunctionFormValues;
  errors: TransferFunctionFormErrors;
  disabled?: boolean;
  onChange: <K extends keyof TransferFunctionFormValues>(
    field: K,
    value: TransferFunctionFormValues[K]
  ) => void;
  onExpressionBlur: () => void;
}

const EXPRESSION_HINT = `"${INPUT}" represents the input variable name and must be used as the input. Supported operators: +, -, *, /, ( ), [ ].`;

const EXPRESSION_PLACEHOLDER = `(${INPUT} - 10) * ${INPUT} / 100`;

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
  values,
  errors,
  disabled = false,
  onChange,
  onExpressionBlur,
}: IProps) {
  return (
    <Box className="editor-page__form">
      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          className="editor-page__form-wrapper-textfield"
          label={<RequiredLabel label="Analyzer name" />}
          disabled={disabled}
          value={values.name}
          error={Boolean(errors.name)}
          helperText={errors.name}
          slotProps={{
            htmlInput: { maxLength: ANALYZER_FIELD_LIMITS.name },
          }}
          onChange={(e) => onChange('name', e.target.value)}
        />
        <Counter value={values.name} max={ANALYZER_FIELD_LIMITS.name} />
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
            htmlInput: { maxLength: ANALYZER_FIELD_LIMITS.description },
          }}
          onChange={(e) => onChange('description', e.target.value)}
        />
        <Counter
          value={values.description}
          max={ANALYZER_FIELD_LIMITS.description}
        />
      </Box>

      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          className="editor-page__form-wrapper-textfield"
          label={<RequiredLabel label="Expression" />}
          placeholder={EXPRESSION_PLACEHOLDER}
          disabled={disabled}
          value={values.expression}
          error={Boolean(errors.expression)}
          helperText={errors.expression ?? EXPRESSION_HINT}
          slotProps={{ inputLabel: { shrink: true } }}
          onChange={(e) => onChange('expression', e.target.value)}
          onBlur={onExpressionBlur}
        />
      </Box>
    </Box>
  );
}
