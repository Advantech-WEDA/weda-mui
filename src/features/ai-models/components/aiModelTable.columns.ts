import type { TableHeaderSortKey } from '@/features/ai-models/domain/types';

export type Column =
  | {
      sortKey: TableHeaderSortKey;
      label: string;
      width?: number | string;
      minWidth?: number | string;
    }
  | {
      sortKey?: never;
      label: string;
      width?: number | string;
      minWidth?: number | string;
    };

export const AI_MODEL_COLUMNS: Column[] = [
  {
    sortKey: 'modelName',
    label: 'Model / Edition name',
    width: 260,
    minWidth: 220,
  },
  { label: 'Status', width: 200 },
  { label: 'Deployed devices', width: 200 },

  { sortKey: 'createdAt', label: 'Date created', width: 200 },
  { label: 'Actions', width: 150 },
];
