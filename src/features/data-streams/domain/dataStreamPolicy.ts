import type { DataStreamManagedBy, DataStreamSourceType } from './types';

interface DataStreamLike {
  managedBy: DataStreamManagedBy;
  dataSource?: { type: DataStreamSourceType | null } | null;
}

const hasNoDataSource = (row: DataStreamLike) => !row.dataSource?.type;

export function canDoItDataStream(row: DataStreamLike): boolean {
  return row.managedBy === 'User';
}

export function canDeleteDataStream(row: DataStreamLike): boolean {
  return row.managedBy === 'User' && hasNoDataSource(row);
}

export interface DataStreamActionState {
  enabled: boolean;

  disabledReason?: string;
}

export function getDataStreamActions(
  row: DataStreamLike,
  hasPermission: boolean
): { edit: DataStreamActionState; delete: DataStreamActionState } {
  const noPermission = 'You do not have permission to perform this action';

  const edit: DataStreamActionState = !hasPermission
    ? { enabled: false, disabledReason: noPermission }
    : !canDoItDataStream(row)
      ? {
          enabled: false,
          disabledReason: 'System-managed DataStreams cannot be edited',
        }
      : { enabled: true };

  const remove: DataStreamActionState = !hasPermission
    ? { enabled: false, disabledReason: noPermission }
    : !canDoItDataStream(row)
      ? {
          enabled: false,
          disabledReason: 'System-managed DataStreams cannot be deleted',
        }
      : !hasNoDataSource(row)
        ? {
            enabled: false,
            disabledReason:
              'Detach the DataStream from its data source before deleting',
          }
        : { enabled: true };

  return { edit, delete: remove };
}

interface DataStreamNames {
  displayName?: string | null;
  dataStreamName?: string | null;
}

export function getDeleteConfirmation(
  stream: DataStreamNames | null | undefined,
  input: string
): { targetName: string; confirmName: string; canConfirm: boolean } {
  const targetName = stream?.displayName || stream?.dataStreamName || '';
  const matched = [stream?.displayName, stream?.dataStreamName].find(
    (name) => name?.trim() && name.trim() === input.trim()
  );

  return {
    targetName,
    confirmName: matched ?? targetName,
    canConfirm: Boolean(matched),
  };
}
