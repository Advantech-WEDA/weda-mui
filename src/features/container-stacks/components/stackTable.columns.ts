import type { TableHeaderSortKey } from '../domain/types';

export type Column =
  | { sortKey: TableHeaderSortKey; label: string; width?: number | string }
  | { sortKey?: never; label: string; width?: number | string };

export const COLUMNS: Column[] = [
  { label: 'Stack (version)' },
  { label: 'Type', width: 200 },
  { label: 'Deployment status', width: 200 },
  { label: 'Date created', width: 200 },
  { label: 'Actions', width: 200 },
];
