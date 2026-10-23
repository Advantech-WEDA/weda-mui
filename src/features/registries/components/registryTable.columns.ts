import type { Column as SharedColumn } from '@shared/ui';

import type { TableHeaderSortKey } from '../domain/types';

export type RegistryColumn = SharedColumn<TableHeaderSortKey>;

export const REGISTRY_COLUMNS: RegistryColumn[] = [
  { sortKey: 'RegistryName', label: 'Registry name' },
  { label: 'Type', width: 200 },
  { label: 'URL', width: 400 },
  { sortKey: 'createdAt', label: 'Date created', width: 200 },
  { label: 'Actions', width: 150 },
];
