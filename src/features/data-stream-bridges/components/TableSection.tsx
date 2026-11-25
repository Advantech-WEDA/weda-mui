import { Box, TableBody, TableCell, TableHead } from '@mui/material';
import {
  PageTable,
  PageTableEmptyState,
  PageTableLoadingIndicator,
  PageTableRow,
  Pagination,
  type SortOrder,
  SortTableHeader,
} from '@shared/ui';

import type { IDataStreamBridgeListItem } from '@/features/data-stream-bridges/api/dataStreamBridges.api.types';
import TableContent from '@/features/data-stream-bridges/components/TableContent';
import type { TableHeaderSortKey } from '@/features/data-stream-bridges/domain/types';

import { DATA_STREAM_BRIDGE_COLUMNS } from './dataStreamBridgeTable.columns';

interface IProps {
  rows: IDataStreamBridgeListItem[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  loading?: boolean;
  hasError?: boolean;
  hasFilter?: boolean;
  hasPermission: boolean;
  togglingId: string | null;
  sortKey: TableHeaderSortKey;
  sortOrder: SortOrder;
  onSort: (key: TableHeaderSortKey) => void;
  onRetry: () => void;
  onClearAll: () => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onToggleEnabled: (row: IDataStreamBridgeListItem) => void;
  onDelete: (row: IDataStreamBridgeListItem) => void;
  onEdit: (bridgeId: string) => void;
  onAdd: () => void;
}

export default function TableSection({
  rows,
  totalCount,
  page,
  rowsPerPage,
  sortKey,
  sortOrder,
  loading = false,
  hasError = false,
  hasFilter,
  hasPermission,
  togglingId,
  onSort,
  onRetry,
  onClearAll,
  onPageChange,
  onRowsPerPageChange,
  onToggleEnabled,
  onDelete,
  onEdit,
  onAdd,
}: IProps) {
  const isEmpty = !loading && rows.length === 0;
  const isErrorEmpty = isEmpty && hasError;
  const isFilterEmpty = isEmpty && !hasError && hasFilter;
  const isInitialEmpty = isEmpty && !hasError && !hasFilter;

  return (
    <Box>
      <PageTable>
        <TableHead>
          <PageTableRow>
            {DATA_STREAM_BRIDGE_COLUMNS.map((col) =>
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
          </PageTableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <PageTableRow>
              <TableCell
                colSpan={DATA_STREAM_BRIDGE_COLUMNS.length}
                align="center"
              >
                <PageTableLoadingIndicator />
              </TableCell>
            </PageTableRow>
          ) : isErrorEmpty ? (
            <PageTableEmptyState
              variant="error"
              colSpan={DATA_STREAM_BRIDGE_COLUMNS.length}
              title="Couldn't load DataStream bridges"
              description="Something went wrong while loading this list. Please try again."
              actionLabel="Retry"
              onAction={onRetry}
            />
          ) : isInitialEmpty ? (
            <PageTableEmptyState
              variant="initial"
              colSpan={DATA_STREAM_BRIDGE_COLUMNS.length}
              title="No DataStream bridges, yet"
              description={
                hasPermission
                  ? 'Click the "+" button to add a bridge here!'
                  : undefined
              }
              actionLabel="Add"
              onAction={onAdd}
              showAction={hasPermission}
            />
          ) : isFilterEmpty ? (
            <PageTableEmptyState
              variant="filter"
              colSpan={DATA_STREAM_BRIDGE_COLUMNS.length}
              title="No results found."
              description="Try adjusting your search to find what you are looking for."
              actionLabel="Clear all"
              onAction={onClearAll}
            />
          ) : (
            rows.map((row) => (
              <TableContent
                key={row.bridgeId}
                row={row}
                hasPermission={hasPermission}
                toggling={togglingId === row.bridgeId}
                onToggleEnabled={onToggleEnabled}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))
          )}
        </TableBody>
      </PageTable>

      {rows.length !== 0 && (
        <Pagination
          count={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => onPageChange(newPage)}
          onRowsPerPageChange={(e) =>
            onRowsPerPageChange(parseInt(e.target.value, 10))
          }
        />
      )}
    </Box>
  );
}
