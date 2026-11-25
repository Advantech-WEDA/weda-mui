import { ANALYZER_FIELD_LIMITS } from './analyzer.rules';

export const JAVASCRIPT_LIMITS = {
  script: 10000,
  maxInputs: 10,
  maxOutputs: 10,
} as const;

export interface JavaScriptInputRow {
  key: string;
  dataStreamId: string;
  parameterName: string;
}

export interface JavaScriptOutputRow {
  key: string;
  dataStreamId: string;
  valueJsonPath: string;
  timeJsonPath: string;
}

export interface JavaScriptFormValues {
  name: string;
  description: string;
  script: string;
  inputs: JavaScriptInputRow[];
  outputs: JavaScriptOutputRow[];
}

export type JavaScriptInputRowErrors = Partial<
  Record<'dataStreamId' | 'parameterName', string>
>;

export type JavaScriptOutputRowErrors = Partial<
  Record<'dataStreamId' | 'valueJsonPath' | 'timeJsonPath', string>
>;

export interface JavaScriptFormErrors {
  name?: string;
  description?: string;
  script?: string;

  inputs?: string;
  outputs?: string;

  inputRows?: Record<string, JavaScriptInputRowErrors>;
  outputRows?: Record<string, JavaScriptOutputRowErrors>;
}

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

const JSON_PATH = /^\$(\.[A-Za-z_$][A-Za-z0-9_$]*|\[\d+\])*$/;

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const usesVariable = (script: string, name: string) =>
  new RegExp(`(^|[^A-Za-z0-9_$])${escapeRegExp(name)}([^A-Za-z0-9_$]|$)`).test(
    script
  );

const QUOTES = new Set(['"', String.fromCharCode(39), '`']);

const skipString = (code: string, start: number) => {
  const quote = code[start];
  let i = start + 1;

  while (i < code.length && code[i] !== quote) {
    i += code[i] === '\\' ? 2 : 1;
  }

  return i + 1;
};

export function stripComments(code: string): string {
  let out = '';
  let i = 0;

  while (i < code.length) {
    if (QUOTES.has(code[i])) {
      const end = skipString(code, i);

      out += code.slice(i, end);
      i = end;
    } else if (code.startsWith('//', i)) {
      const end = code.indexOf('\n', i);

      i = end === -1 ? code.length : end;
    } else if (code.startsWith('/*', i)) {
      const end = code.indexOf('*/', i + 2);

      out += ' ';
      i = end === -1 ? code.length : end + 2;
    } else {
      out += code[i++];
    }
  }

  return out;
}

const objectKeys = (code: string, open: number): string[] | null => {
  const segments: string[] = [];
  let depth = 0;
  let segment = '';

  for (let i = open; i < code.length; i++) {
    const ch = code[i];

    if (QUOTES.has(ch)) {
      const end = skipString(code, i);

      if (depth === 1) segment += code.slice(i, end);
      i = end - 1;
      continue;
    }

    if ('{[('.includes(ch)) depth++;
    if ('}])'.includes(ch)) depth--;

    if (depth === 0) {
      segments.push(segment);
      break;
    }

    if (depth === 1 && ch === ',') {
      segments.push(segment);
      segment = '';
    } else if (i > open) {
      segment += ch;
    }
  }

  const keys: string[] = [];

  for (const raw of segments) {
    const part = raw.trim();

    if (!part) continue;

    if (part.startsWith('...') || part.startsWith('[')) return null;

    const match =
      /^(?:(["'])(.*?)\1|([A-Za-z_$][A-Za-z0-9_$]*))\s*(?::|\(|$)/.exec(part);

    if (!match) return null;
    keys.push(match[2] ?? match[3]);
  }

  return keys;
};

export function returnedKeys(script: string): string[] | null {
  const code = stripComments(script);
  const pattern = /\breturn\s*\{/g;
  const keys = new Set<string>();
  let found = false;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(code))) {
    const objKeys = objectKeys(code, match.index + match[0].length - 1);

    if (!objKeys) return null;
    objKeys.forEach((key) => keys.add(key));
    found = true;
  }

  return found ? [...keys] : null;
}

export function hasResultReturn(script: string): boolean {
  return /\breturn\b(?!\s*(?:;|$|}|null\b|undefined\b))/m.test(
    stripComments(script)
  );
}

const rootKey = (jsonPath: string) =>
  /^\$\.([A-Za-z_$][A-Za-z0-9_$]*)/.exec(jsonPath)?.[1] ?? '';

export function toJsonPath(input: string): string {
  const path = input.trim();

  if (!path || path.startsWith('$')) return path;
  if (path.startsWith('.') || path.startsWith('[')) return `$${path}`;

  return `$.${path}`;
}

export function fromJsonPath(jsonPath?: string | null): string {
  if (!jsonPath) return '';
  if (jsonPath.startsWith('$.')) return jsonPath.slice(2);
  if (jsonPath.startsWith('$[')) return jsonPath.slice(1);

  return jsonPath;
}

export function isJavaScriptFormComplete(values: JavaScriptFormValues) {
  return Boolean(
    values.name.trim() &&
    values.script.trim() &&
    values.inputs.length &&
    values.outputs.length &&
    values.inputs.every((r) => r.dataStreamId && r.parameterName.trim()) &&
    values.outputs.every(
      (r) => r.dataStreamId && r.valueJsonPath.trim() && r.timeJsonPath.trim()
    )
  );
}

export function validateJavaScriptForm(
  values: JavaScriptFormValues
): JavaScriptFormErrors {
  const errors: JavaScriptFormErrors = {};
  const name = values.name.trim();
  const script = values.script.trim();

  const code = stripComments(script);

  if (!name) {
    errors.name = 'Analyzer name is required';
  } else if (name.length > ANALYZER_FIELD_LIMITS.name) {
    errors.name = `Analyzer name must be ${ANALYZER_FIELD_LIMITS.name} characters or fewer`;
  }

  if (values.description.length > ANALYZER_FIELD_LIMITS.description) {
    errors.description = `Description must be ${ANALYZER_FIELD_LIMITS.description} characters or fewer`;
  }

  if (!script) {
    errors.script = 'JavaScript is required';
  } else if (values.script.length > JAVASCRIPT_LIMITS.script) {
    errors.script = `JavaScript must be ${JAVASCRIPT_LIMITS.script} characters or fewer`;
  } else if (!hasResultReturn(script)) {
    errors.script =
      'JavaScript must return a result, e.g. return { value, timestamp }';
  }

  if (!values.inputs.length) {
    errors.inputs = 'At least one input is required';
  } else if (values.inputs.length > JAVASCRIPT_LIMITS.maxInputs) {
    errors.inputs = `Up to ${JAVASCRIPT_LIMITS.maxInputs} inputs are allowed`;
  }

  const outputIds = new Set(values.outputs.map((r) => r.dataStreamId));
  const inputRows: Record<string, JavaScriptInputRowErrors> = {};
  const seenInputIds = new Set<string>();
  const seenVariables = new Set<string>();

  values.inputs.forEach((row) => {
    const rowErrors: JavaScriptInputRowErrors = {};
    const variable = row.parameterName.trim();

    if (!row.dataStreamId) {
      rowErrors.dataStreamId = 'DataStream is required';
    } else if (seenInputIds.has(row.dataStreamId)) {
      rowErrors.dataStreamId = 'DataStream is already an input';
    } else if (outputIds.has(row.dataStreamId)) {
      rowErrors.dataStreamId = 'DataStream is already an output';
    }

    if (!variable) {
      rowErrors.parameterName = 'Variable name is required';
    } else if (!IDENTIFIER.test(variable)) {
      rowErrors.parameterName =
        'Use letters, digits, _ or $, not starting with a digit';
    } else if (seenVariables.has(variable)) {
      rowErrors.parameterName = 'Variable name must be unique';
    } else if (script && !usesVariable(code, variable)) {
      rowErrors.parameterName = `"${variable}" is not used in the JavaScript`;
    }

    if (row.dataStreamId) seenInputIds.add(row.dataStreamId);
    if (variable) seenVariables.add(variable);
    if (Object.keys(rowErrors).length) inputRows[row.key] = rowErrors;
  });

  if (Object.keys(inputRows).length) errors.inputRows = inputRows;

  if (!values.outputs.length) {
    errors.outputs = 'At least one output is required';
  } else if (values.outputs.length > JAVASCRIPT_LIMITS.maxOutputs) {
    errors.outputs = `Up to ${JAVASCRIPT_LIMITS.maxOutputs} outputs are allowed`;
  }

  const outputRows: Record<string, JavaScriptOutputRowErrors> = {};
  const seenOutputIds = new Set<string>();

  const returned = script ? returnedKeys(script) : null;

  const returnedPathError = (path: string) => {
    const jsonPath = toJsonPath(path);
    const key = rootKey(jsonPath);

    if (!returned || !jsonPath || jsonPath === '$' || returned.includes(key)) {
      return undefined;
    }

    return `"${key || jsonPath}" is not returned by the JavaScript`;
  };

  const pathError = (path: string, label: string) => {
    if (!path) return `${label} is required`;

    return JSON_PATH.test(toJsonPath(path))
      ? undefined
      : 'Use property, a.b or items[0]';
  };

  values.outputs.forEach((row) => {
    const rowErrors: JavaScriptOutputRowErrors = {};

    if (!row.dataStreamId) {
      rowErrors.dataStreamId = 'DataStream is required';
    } else if (seenOutputIds.has(row.dataStreamId)) {
      rowErrors.dataStreamId = 'DataStream is already an output';
    } else if (seenInputIds.has(row.dataStreamId)) {
      rowErrors.dataStreamId = 'DataStream is already an input';
    }

    const valueError = pathError(row.valueJsonPath.trim(), 'Value JSON path');
    const timeError = pathError(row.timeJsonPath.trim(), 'Time JSON path');

    const finalValueError = valueError ?? returnedPathError(row.valueJsonPath);
    const finalTimeError = timeError ?? returnedPathError(row.timeJsonPath);

    if (finalValueError) rowErrors.valueJsonPath = finalValueError;
    if (finalTimeError) rowErrors.timeJsonPath = finalTimeError;

    if (row.dataStreamId) seenOutputIds.add(row.dataStreamId);
    if (Object.keys(rowErrors).length) outputRows[row.key] = rowErrors;
  });

  if (Object.keys(outputRows).length) errors.outputRows = outputRows;

  return errors;
}

export const hasJavaScriptFormErrors = (errors: JavaScriptFormErrors) =>
  Object.keys(errors).length > 0;
