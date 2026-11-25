import type { AnalyzerSortKey } from '@features/analyzers';
import type { Column } from '@shared/ui';

export const ANALYZER_COLUMNS: Column<AnalyzerSortKey>[] = [
  { sortKey: 'Name', label: 'Analyzer name' },
  { label: 'Type', width: 200 },
  { label: 'Input(s)', width: 200 },
  { label: 'Output(s)', width: 200 },
  { label: 'Status', width: 200 },
  { sortKey: 'UpdatedAt', label: 'Date modified', width: 200 },
  { label: 'Actions', width: 150 },
];

const NAME_COLUMN_MIN_WIDTH = 280;

export const ANALYZER_TABLE_MIN_WIDTH =
  ANALYZER_COLUMNS.reduce(
    (sum, col) => sum + (typeof col.width === 'number' ? col.width : 0),
    0
  ) + NAME_COLUMN_MIN_WIDTH;
