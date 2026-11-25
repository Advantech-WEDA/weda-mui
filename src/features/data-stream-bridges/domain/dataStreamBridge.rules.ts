import type {
  BridgeBindingRow,
  BridgeBindingRowErrors,
  DataStreamBridgeForm,
  DataStreamBridgeFormErrors,
} from './types';

const NAME_MAX = 256;
const OUTPUT_TOPIC_MAX = 512;
const TARGET_PATH_MAX = 256;

let rowSeq = 0;
export const nextRowId = () => `binding-${Date.now()}-${rowSeq++}`;

export const createEmptyBindingRow = (): BridgeBindingRow => ({
  rowId: nextRowId(),
  deviceId: '',
  dataStreamId: '',
  targetPath: '',
});

export const INITIAL_BRIDGE_ERRORS: DataStreamBridgeFormErrors = {
  name: '',
  mqttBrokerConfigId: '',
  outputTopic: '',
  bindings: '',
  bindingRows: {},
};

export const createInitialBridgeForm = (): DataStreamBridgeForm => ({
  name: '',
  mqttBrokerConfigId: '',
  outputTopic: '',
  qos: 0,
  bindings: [createEmptyBindingRow()],
});

export function toTargetJsonPath(targetPath: string): string {
  const path = targetPath.trim();

  if (path.startsWith('.') || path.startsWith('[')) return `$${path}`;

  return `$.${path}`;
}

export function fromTargetJsonPath(targetJsonPath: string | null): string {
  if (!targetJsonPath) return '';
  if (targetJsonPath.startsWith('$.')) return targetJsonPath.slice(2);
  if (targetJsonPath.startsWith('$')) return targetJsonPath.slice(1);

  return targetJsonPath;
}

export function isBridgeFormComplete(form: DataStreamBridgeForm): boolean {
  return (
    !!form.name.trim() &&
    !!form.mqttBrokerConfigId &&
    !!form.outputTopic.trim() &&
    form.bindings.length > 0 &&
    form.bindings.every(
      (row) => row.deviceId && row.dataStreamId && row.targetPath.trim()
    )
  );
}

const DUPLICATE_STREAM_ERROR = 'DataStream is already added';
const DUPLICATE_PATH_ERROR = 'Path is already used';
const PATH_CONFLICT_PREFIX = 'Path conflicts with';

function isNestedPath(a: string, b: string): boolean {
  const [parent, child] = a.length < b.length ? [a, b] : [b, a];

  return (
    child.length > parent.length &&
    child.startsWith(parent) &&
    (child[parent.length] === '.' || child[parent.length] === '[')
  );
}

const collectTargetPaths = (form: DataStreamBridgeForm) =>
  form.bindings
    .filter((row) => row.targetPath.trim())
    .map((row) => toTargetJsonPath(row.targetPath));

function findNestedPath(path: string, allPaths: string[]): string | undefined {
  return allPaths.find((other) => isNestedPath(path, other));
}

export function hasBridgeFormErrors(
  errors: DataStreamBridgeFormErrors
): boolean {
  return (
    !!errors.name ||
    !!errors.mqttBrokerConfigId ||
    !!errors.outputTopic ||
    !!errors.bindings ||
    Object.values(errors.bindingRows).some((row) =>
      Object.values(row).some(Boolean)
    )
  );
}

const isCollisionError = (message: string) =>
  message === DUPLICATE_STREAM_ERROR ||
  message === DUPLICATE_PATH_ERROR ||
  message.startsWith(PATH_CONFLICT_PREFIX);

export function syncBindingCollisionErrors(
  form: DataStreamBridgeForm,
  errors: DataStreamBridgeFormErrors
): DataStreamBridgeFormErrors {
  const streamCounts = new Map<string, number>();
  const pathCounts = new Map<string, number>();
  for (const row of form.bindings) {
    if (row.dataStreamId)
      streamCounts.set(
        row.dataStreamId,
        (streamCounts.get(row.dataStreamId) ?? 0) + 1
      );
    if (row.targetPath.trim()) {
      const path = toTargetJsonPath(row.targetPath);
      pathCounts.set(path, (pathCounts.get(path) ?? 0) + 1);
    }
  }

  const allPaths = collectTargetPaths(form);
  const rowIds = new Set(form.bindings.map((row) => row.rowId));

  let changed = Object.keys(errors.bindingRows).some((id) => !rowIds.has(id));
  const nextRows: Record<string, BridgeBindingRowErrors> = {};

  for (const row of form.bindings) {
    const current = errors.bindingRows[row.rowId] ?? {
      deviceId: '',
      dataStreamId: '',
      targetPath: '',
    };

    const streamCollision =
      row.dataStreamId && (streamCounts.get(row.dataStreamId) ?? 0) > 1
        ? DUPLICATE_STREAM_ERROR
        : '';

    let pathCollision = '';
    if (row.targetPath.trim()) {
      const path = toTargetJsonPath(row.targetPath);
      const nested = findNestedPath(path, allPaths);

      if ((pathCounts.get(path) ?? 0) > 1) pathCollision = DUPLICATE_PATH_ERROR;
      else if (nested) pathCollision = `${PATH_CONFLICT_PREFIX} ${nested}`;
    }

    const next = { ...current };
    if (!next.dataStreamId || isCollisionError(next.dataStreamId))
      next.dataStreamId = streamCollision;
    if (!next.targetPath || isCollisionError(next.targetPath))
      next.targetPath = pathCollision;

    if (
      next.dataStreamId !== current.dataStreamId ||
      next.targetPath !== current.targetPath
    )
      changed = true;

    if (Object.values(next).some(Boolean)) nextRows[row.rowId] = next;
    else if (errors.bindingRows[row.rowId]) changed = true;
  }

  return changed ? { ...errors, bindingRows: nextRows } : errors;
}

export function validateBridgeForm(form: DataStreamBridgeForm): {
  isValid: boolean;
  errors: DataStreamBridgeFormErrors;
} {
  const errors: DataStreamBridgeFormErrors = {
    ...INITIAL_BRIDGE_ERRORS,
    bindingRows: {},
  };

  const name = form.name.trim();
  if (!name) errors.name = 'Bridge name is required';
  else if (name.length > NAME_MAX)
    errors.name = `Bridge name must be ${NAME_MAX} characters or fewer`;

  if (!form.mqttBrokerConfigId)
    errors.mqttBrokerConfigId = 'MQTT broker is required';

  const outputTopic = form.outputTopic.trim();
  if (!outputTopic) errors.outputTopic = 'Output topic is required';
  else if (outputTopic.length > OUTPUT_TOPIC_MAX)
    errors.outputTopic = `Output topic must be ${OUTPUT_TOPIC_MAX} characters or fewer`;

  if (form.bindings.length === 0)
    errors.bindings = 'Add at least one data stream';

  const allPaths = collectTargetPaths(form);
  const streamCounts = new Map<string, number>();
  const pathCounts = new Map<string, number>();
  for (const row of form.bindings) {
    if (row.dataStreamId)
      streamCounts.set(
        row.dataStreamId,
        (streamCounts.get(row.dataStreamId) ?? 0) + 1
      );
    if (row.targetPath.trim()) {
      const path = toTargetJsonPath(row.targetPath);
      pathCounts.set(path, (pathCounts.get(path) ?? 0) + 1);
    }
  }

  for (const row of form.bindings) {
    const rowErrors: BridgeBindingRowErrors = {
      deviceId: '',
      dataStreamId: '',
      targetPath: '',
    };
    const path = row.targetPath.trim();

    if (!row.deviceId) rowErrors.deviceId = 'Device is required';

    if (!row.dataStreamId) rowErrors.dataStreamId = 'DataStream is required';
    else if ((streamCounts.get(row.dataStreamId) ?? 0) > 1)
      rowErrors.dataStreamId = DUPLICATE_STREAM_ERROR;

    if (!path) rowErrors.targetPath = 'Target JSON path is required';
    else if (toTargetJsonPath(path).length > TARGET_PATH_MAX)
      rowErrors.targetPath = `Path must be ${TARGET_PATH_MAX} characters or fewer`;
    else if ((pathCounts.get(toTargetJsonPath(path)) ?? 0) > 1)
      rowErrors.targetPath = DUPLICATE_PATH_ERROR;
    else {
      const conflict = findNestedPath(toTargetJsonPath(path), allPaths);
      if (conflict)
        rowErrors.targetPath = `${PATH_CONFLICT_PREFIX} ${conflict}`;
    }

    if (Object.values(rowErrors).some(Boolean)) {
      errors.bindingRows[row.rowId] = rowErrors;
    }
  }

  const isValid =
    !errors.name &&
    !errors.mqttBrokerConfigId &&
    !errors.outputTopic &&
    !errors.bindings &&
    Object.keys(errors.bindingRows).length === 0;

  return { isValid, errors };
}
