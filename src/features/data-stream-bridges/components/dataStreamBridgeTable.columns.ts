import type { Column as SharedColumn } from '@shared/ui';

import type { TableHeaderSortKey } from '../domain/types';

export type DataStreamBridgeColumn = SharedColumn<TableHeaderSortKey>;

export const DATA_STREAM_BRIDGE_COLUMNS: DataStreamBridgeColumn[] = [
  { sortKey: 'Name', label: 'Bridge name' },
  { label: 'Output topic', width: 200 },
  { label: 'QoS', width: 100 },
  { label: 'DataStreams', width: 200 },
  { label: 'Runtime status', width: 200 },
  { label: 'Enable/Disable', width: 200 },
  { sortKey: 'CreationTime', label: 'Date created', width: 200 },
  { label: 'Actions', width: 150 },
];

export const BRIDGE_DATA_STREAM_COLUMNS: SharedColumn[] = [
  { label: 'Device name', width: 300 },
  { label: 'DataStream name', width: 300 },
  { label: 'Target JSON path' },
  { label: 'Actions', width: 150 },
];

export type BridgeEditorDataStreamColumn = SharedColumn & {
  required?: boolean;
};

export const BRIDGE_EDITOR_DATA_STREAM_COLUMNS: BridgeEditorDataStreamColumn[] =
  [
    { label: 'Device name', required: true },
    { label: 'DataStream name', required: true },
    { label: 'Target JSON path', required: true },
    { label: 'Actions', width: 150 },
  ];
