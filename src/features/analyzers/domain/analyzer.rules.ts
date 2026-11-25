import { getTransferFunctionExpressionError } from './transferFunctionExpression';

export const ANALYZER_FIELD_LIMITS = {
  name: 256,
  description: 500,
} as const;

export const TRANSFER_FUNCTION_PARAMETER_NAME = 'input';

export interface TransferFunctionFormValues {
  name: string;
  description: string;
  expression: string;
  inputDataStreamId: string;
  outputDataStreamId: string;
}

export type TransferFunctionFormErrors = Partial<
  Record<keyof TransferFunctionFormValues, string>
>;

const tooLong = (label: string, max: number) =>
  `${label} must be ${max} characters or fewer`;

export function isTransferFunctionFormComplete(
  values: TransferFunctionFormValues
): boolean {
  return Boolean(
    values.name.trim() &&
    values.expression.trim() &&
    values.inputDataStreamId &&
    values.outputDataStreamId
  );
}

export function validateTransferFunctionForm(
  values: TransferFunctionFormValues
): TransferFunctionFormErrors {
  const errors: TransferFunctionFormErrors = {};
  const name = values.name.trim();
  const expression = values.expression.trim();

  if (!name) {
    errors.name = 'Analyzer name is required';
  } else if (name.length > ANALYZER_FIELD_LIMITS.name) {
    errors.name = tooLong('Analyzer name', ANALYZER_FIELD_LIMITS.name);
  }

  if (values.description.length > ANALYZER_FIELD_LIMITS.description) {
    errors.description = tooLong(
      'Description',
      ANALYZER_FIELD_LIMITS.description
    );
  }

  if (!expression) {
    errors.expression = 'Expression is required';
  } else {
    const expressionError = getTransferFunctionExpressionError(
      expression,
      TRANSFER_FUNCTION_PARAMETER_NAME
    );

    if (expressionError) errors.expression = expressionError;
  }

  if (!values.inputDataStreamId) {
    errors.inputDataStreamId = 'Input DataStream is required';
  }

  if (!values.outputDataStreamId) {
    errors.outputDataStreamId = 'Output DataStream is required';
  } else if (values.outputDataStreamId === values.inputDataStreamId) {
    errors.outputDataStreamId =
      'Output DataStream must be different from the input';
  }

  return errors;
}
