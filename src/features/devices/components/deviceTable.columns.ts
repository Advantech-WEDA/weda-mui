import type { Column as SharedColumn } from '@shared/ui';

import type { TableHeaderSortKey } from '../domain/types';

export type Column = SharedColumn<TableHeaderSortKey>;

export const COLUMNS: Column[] = [
  { sortKey: 'deviceId', label: 'Device name' },
  { sortKey: 'hwModel', label: 'Model', width: 200 },
  { label: 'Device status', width: 200 },
  { label: 'Connectivity', width: 200 },
  { label: 'Last connected', width: 200 },
  { label: 'Actions', width: 200 },
];
