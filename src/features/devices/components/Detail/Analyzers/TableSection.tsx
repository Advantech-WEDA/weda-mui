import type { AnalyzerSortKey, IAnalyzerItem } from '@features/analyzers';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  PageTableEmptyState,
  PageTableLoadingIndicator,
  Pagination,
  type SortOrder,
  SortTableHeader,
} from '@shared/ui';

import {
  ANALYZER_COLUMNS,
  ANALYZER_TABLE_MIN_WIDTH,
} from '@/features/devices/components/Detail/Analyzers/analyzerTable.columns';
import TableContent from '@/features/devices/components/Detail/Analyzers/TableContent';

interface IProps {
  rows: IAnalyzerItem[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  loading?: boolean;
  hasError?: boolean;
  hasFilter?: boolean;
  hasPermission: boolean;
  dataStreamNames: Record<string, string>;

  onOpenAddMenu: (event: React.MouseEvent<HTMLElement>) => void;
  onRetry: () => void;
  onClearAll: () => void;
  onPageChange: (e: unknown, newPage: number) => void;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  togglingId?: string | null;
  onToggleEnabled?: (row: IAnalyzerItem) => void;
  onEdit: (row: IAnalyzerItem) => void;
  onDelete: (row: IAnalyzerItem) => void;
  sortKey: AnalyzerSortKey;
  sortOrder: SortOrder;
  onSort: (key: AnalyzerSortKey) => void;
}

const COLUMN_COUNT = ANALYZER_COLUMNS.length;

export default function TableSection({
  rows,
  totalCount,
  page,
  rowsPerPage,
  loading = false,
  hasError = false,
  hasFilter,
  hasPermission,
  dataStreamNames,
  onOpenAddMenu,
  onRetry,
  onClearAll,
  onPageChange,
  onRowsPerPageChange,
  togglingId,
  onToggleEnabled,
  onEdit,
  onDelete,
  sortKey,
  sortOrder,
  onSort,
}: IProps) {
  const isEmpty = !loading && rows.length === 0;
  const isErrorEmpty = isEmpty && hasError;
  const isFilterEmpty = isEmpty && !hasError && hasFilter;
  const isInitialEmpty = isEmpty && !hasError && !hasFilter;

  return (
    <Box>
      <TableContainer
        className="page-table-wrap"
        component={Paper}
        elevation={0}
        sx={{ p: 2 }}
      >
        <Table
          className="page-table"
          sx={{ tableLayout: 'fixed', minWidth: ANALYZER_TABLE_MIN_WIDTH }}
        >
          <TableHead>
            <TableRow className="page-table-row">
              {ANALYZER_COLUMNS.map((col) =>
                col.sortKey ? (
                  <SortTableHeader
                    key={col.label}
                    label={col.label}
                    width={col.width ? `${col.width}px` : undefined}
                    active={sortKey === col.sortKey}
                    order={sortOrder}
                    onClick={() => onSort(col.sortKey!)}
                  />
                ) : (
                  <TableCell key={col.label} sx={{ width: col.width }}>
                    {col.label}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={COLUMN_COUNT} align="center">
                  <PageTableLoadingIndicator />
                </TableCell>
              </TableRow>
            ) : isErrorEmpty ? (
              <PageTableEmptyState
                variant="error"
                colSpan={COLUMN_COUNT}
                title="Couldn't load Analyzers"
                description="Something went wrong while loading this list. Please try again."
                actionLabel="Retry"
                onAction={onRetry}
              />
            ) : isInitialEmpty ? (
              <PageTableEmptyState
                variant="initial"
                colSpan={COLUMN_COUNT}
                title="No analyzers, yet."
                description={
                  hasPermission
                    ? 'Click the "+" button to add an analyzer here!'
                    : undefined
                }
                actionLabel="Add"
                onAction={onOpenAddMenu}
                showAction={hasPermission}
              />
            ) : isFilterEmpty ? (
              <PageTableEmptyState
                variant="filter"
                colSpan={COLUMN_COUNT}
                title="No results found."
                description="Try adjusting your search to find what you are looking for."
                actionLabel="Clear all"
                onAction={onClearAll}
              />
            ) : (
              rows.map((row) => (
                <TableContent
                  key={row.analyzerId}
                  row={row}
                  hasPermission={hasPermission}
                  dataStreamNames={dataStreamNames}
                  toggling={togglingId === row.analyzerId}
                  onToggleEnabled={onToggleEnabled}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {rows.length !== 0 && (
        <Pagination
          count={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
    </Box>
  );
}
