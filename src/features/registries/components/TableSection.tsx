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

import type { IRegistryItem } from '@/features/registries/api/registries.api.types';
import TableContent from '@/features/registries/components/TableContent';
import type { TableHeaderSortKey } from '@/features/registries/domain/types';

import { REGISTRY_COLUMNS } from './registryTable.columns';

interface IProps {
  rows: IRegistryItem[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  loading?: boolean;
  hasError?: boolean;
  hasFilter?: boolean;
  hasPermission: boolean;
  sortKey: TableHeaderSortKey;
  sortOrder: SortOrder;
  onSort: (key: TableHeaderSortKey) => void;
  onRetry: () => void;
  onClearAll: () => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onDelete: (row: IRegistryItem) => void;
  onEdit: (registryId: string) => void;
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
  onSort,
  onRetry,
  onClearAll,
  onPageChange,
  onRowsPerPageChange,
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
            {REGISTRY_COLUMNS.map((col) =>
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
          {isErrorEmpty ? (
            <PageTableEmptyState
              variant="error"
              colSpan={REGISTRY_COLUMNS.length}
              title="Couldn't load container registries"
              description="Something went wrong while loading this list. Please try again."
              actionLabel="Retry"
              onAction={onRetry}
            />
          ) : isInitialEmpty ? (
            <PageTableEmptyState
              variant="initial"
              colSpan={REGISTRY_COLUMNS.length}
              title="No container registries, yet"
              description={
                hasPermission
                  ? 'Click the "+" button to add container registries here!'
                  : undefined
              }
              actionLabel="Add"
              onAction={onAdd}
              showAction={hasPermission}
            />
          ) : isFilterEmpty ? (
            <PageTableEmptyState
              variant="filter"
              colSpan={REGISTRY_COLUMNS.length}
              title="No results found."
              description="Try adjusting your search or filter registries to find what you are looking for."
              actionLabel="Clear all"
              onAction={onClearAll}
            />
          ) : (
            rows.map((row) => (
              <TableContent
                key={row.registryId}
                row={row}
                onDelete={onDelete}
                onEdit={onEdit}
                hasPermission={hasPermission}
              />
            ))
          )}
        </TableBody>
      </PageTable>

      {loading && <PageTableLoadingIndicator />}

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
