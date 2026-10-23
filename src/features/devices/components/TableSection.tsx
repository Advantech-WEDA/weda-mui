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

import type { IDeviceItem } from '../api/devices.api.types';
import type { TableHeaderSortKey } from '../domain/types';
import { COLUMNS } from './deviceTable.columns';
import TableContent from './TableContent';

interface IProps {
  rows: IDeviceItem[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  loading?: boolean;
  hasError?: boolean;
  hasFilter?: boolean;
  hasPermission: boolean;
  hasDeletePermission: boolean;
  sortKey: TableHeaderSortKey;
  sortOrder: SortOrder;
  onSort: (key: TableHeaderSortKey) => void;
  onRetry: () => void;
  onClearAll: () => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onDelete: (row: IDeviceItem) => void;
  onEdit: (deviceId: string) => void;
  onActivationStatus: (row: IDeviceItem) => void;
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
  hasDeletePermission,
  onSort,
  onRetry,
  onClearAll,
  onPageChange,
  onRowsPerPageChange,
  onDelete,
  onEdit,
  onAdd,
  onActivationStatus,
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
            {COLUMNS.map((col) =>
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
            <TableCell colSpan={6} align="center">
              <PageTableLoadingIndicator />
            </TableCell>
          ) : isErrorEmpty ? (
            <PageTableEmptyState
              variant="error"
              colSpan={COLUMNS.length}
              title="Couldn't load devices"
              description="Something went wrong while loading this list. Please try again."
              actionLabel="Retry"
              onAction={onRetry}
            />
          ) : isInitialEmpty ? (
            <PageTableEmptyState
              variant="initial"
              colSpan={COLUMNS.length}
              title="No devices, yet"
              description={
                hasPermission
                  ? 'Click the "+" button to add devices here!'
                  : undefined
              }
              actionLabel="Add"
              onAction={onAdd}
              showAction={hasPermission}
            />
          ) : isFilterEmpty ? (
            <PageTableEmptyState
              variant="filter"
              colSpan={COLUMNS.length}
              title="No results found."
              description="Try adjusting your search or filter devices to find what you are looking for."
              actionLabel="Clear all"
              onAction={onClearAll}
            />
          ) : (
            rows.map((row) => (
              <TableContent
                key={row.deviceId}
                row={row}
                onDelete={onDelete}
                onEdit={onEdit}
                onActivationStatus={onActivationStatus}
                hasPermission={hasPermission}
                hasDeletePermission={hasDeletePermission}
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
