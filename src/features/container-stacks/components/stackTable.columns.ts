import type { TableHeaderSortKey } from '../domain/types';

export type Column =
  | { sortKey: TableHeaderSortKey; label: string; width?: number | string }
  | { sortKey?: never; label: string; width?: number | string };

export const COLUMNS: Column[] = [
  { label: 'Stack (version) / Device name' },
  { label: 'Type', width: 200 },
  { label: 'Stack status on device', width: 200 },
  { label: 'Date created', width: 200 },
  { label: 'Actions', width: 200 },
];
