import type { IDataStreamItem } from '@features/data-streams';
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
  DATA_STREAM_COLUMNS,
  type DataStreamSortKey,
} from '@/features/devices/components/Detail/DataStreams/dataStreamTable.columns';
import TableContent from '@/features/devices/components/Detail/DataStreams/TableContent';

interface IProps {
  rows: IDataStreamItem[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  loading?: boolean;
  hasError?: boolean;
  hasFilter?: boolean;
  hasPermission: boolean;
  sortKey: DataStreamSortKey | null;
  sortOrder: SortOrder;
  onSort: (key: DataStreamSortKey) => void;
  onAdd: () => void;
  onRetry: () => void;
  onClearAll: () => void;
  onPageChange: (e: unknown, newPage: number) => void;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: (row: IDataStreamItem) => void;
  onDelete: (row: IDataStreamItem) => void;
}

const COLUMN_COUNT = DATA_STREAM_COLUMNS.length;

const toCssSize = (size?: number | string) =>
  typeof size === 'number' ? `${size}px` : size;

export default function TableSection({
  rows,
  totalCount,
  page,
  rowsPerPage,
  loading = false,
  hasError = false,
  hasFilter,
  hasPermission,
  sortKey,
  sortOrder,
  onSort,
  onAdd,
  onRetry,
  onClearAll,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
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
          sx={{ tableLayout: 'fixed', minWidth: 1130 }}
        >
          <TableHead>
            <TableRow className="page-table-row">
              {DATA_STREAM_COLUMNS.map((col) => {
                const colSortKey = col.sortKey;

                return colSortKey ? (
                  <SortTableHeader
                    key={col.label}
                    label={col.label}
                    width={toCssSize(col.width)}
                    minWidth={toCssSize(col.minWidth)}
                    active={sortKey === colSortKey}
                    order={sortOrder}
                    onClick={() => onSort(colSortKey)}
                  />
                ) : (
                  <TableCell
                    key={col.label}
                    sx={{ width: col.width, minWidth: col.minWidth }}
                  >
                    {col.label}
                  </TableCell>
                );
              })}
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
                title="Couldn't load DataStream"
                description="Something went wrong while loading this list. Please try again."
                actionLabel="Retry"
                onAction={onRetry}
              />
            ) : isInitialEmpty ? (
              <PageTableEmptyState
                variant="initial"
                colSpan={COLUMN_COUNT}
                title="No DataStreams, yet."
                description={
                  hasPermission
                    ? 'Click the "+" button to add a DataStream here!'
                    : undefined
                }
                actionLabel="Add"
                onAction={onAdd}
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
                  key={row.dataStreamId}
                  row={row}
                  hasPermission={hasPermission}
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
