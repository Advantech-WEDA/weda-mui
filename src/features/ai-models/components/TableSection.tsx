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

import type {
  IAiModelEditionListItem,
  IAiModelItem,
} from '@/features/ai-models/api/aiModels.api.types';
import type { AiModelWithEditions } from '@/features/ai-models/api/aiModels.api.types';
import { AI_MODEL_COLUMNS } from '@/features/ai-models/components/aiModelTable.columns';
import TableContent from '@/features/ai-models/components/TableContent';
import { type TableHeaderSortKey } from '@/features/ai-models/domain/types';

interface IProps {
  rows: AiModelWithEditions[];
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
  onDelete: (row: IAiModelItem) => void;
  onDeleteEdition: (edition: IAiModelEditionListItem) => void;
  onEdit: (modelId: string) => void;
  onEditEdition: (modelId: string, edition: string) => void;
  onDeploy: (modelId: string, edition: string) => void;
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
  onDeleteEdition,
  onEdit,
  onEditEdition,
  onDeploy,
  onAdd,
}: IProps) {
  const isEmpty = !loading && rows.length === 0;
  const isErrorEmpty = isEmpty && hasError;
  const isFilterEmpty = isEmpty && !hasError && hasFilter;
  const isInitialEmpty = isEmpty && !hasError && !hasFilter;

  return (
    <Box>
      <PageTable sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <PageTableRow
            className={
              isErrorEmpty || isInitialEmpty || isFilterEmpty
                ? 'page-table__row--no-border'
                : undefined
            }
          >
            {AI_MODEL_COLUMNS.map((col) =>
              col.sortKey ? (
                <SortTableHeader
                  key={col.label}
                  label={col.label}
                  width={col.width ? `${col.width}px` : undefined}
                  minWidth={col.minWidth ? `${col.minWidth}px` : undefined}
                  active={sortKey === col.sortKey}
                  order={sortOrder}
                  onClick={() => onSort(col.sortKey!)}
                />
              ) : (
                <TableCell
                  key={col.label}
                  sx={{ width: col.width, minWidth: col.minWidth }}
                >
                  {col.label}
                </TableCell>
              )
            )}
          </PageTableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <PageTableRow>
              <TableCell colSpan={AI_MODEL_COLUMNS.length} align="center">
                <PageTableLoadingIndicator />
              </TableCell>
            </PageTableRow>
          ) : isErrorEmpty ? (
            <PageTableEmptyState
              variant="error"
              colSpan={AI_MODEL_COLUMNS.length}
              title="Couldn't load AI models"
              description="Something went wrong while loading this list. Please try again."
              actionLabel="Retry"
              onAction={onRetry}
            />
          ) : isInitialEmpty ? (
            <PageTableEmptyState
              variant="initial"
              colSpan={AI_MODEL_COLUMNS.length}
              title="No AI models found."
              description={
                hasPermission
                  ? 'Click the "+" button to add an AI model here!'
                  : undefined
              }
              actionLabel="Add"
              onAction={onAdd}
              showAction={hasPermission}
            />
          ) : isFilterEmpty ? (
            <PageTableEmptyState
              variant="filter"
              colSpan={AI_MODEL_COLUMNS.length}
              title="No results found."
              description="Try adjusting your search to find what you are looking for."
              actionLabel="Clear all"
              onAction={onClearAll}
            />
          ) : (
            rows.map((row) => (
              <TableContent
                key={row.modelId}
                row={row}
                hasPermission={hasPermission}
                onDeploy={onDeploy}
                onEdit={onEdit}
                onEditEdition={onEditEdition}
                onDelete={onDelete}
                onDeleteEdition={onDeleteEdition}
              />
            ))
          )}
        </TableBody>
      </PageTable>

      {rows.length !== 0 && !hasFilter && (
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
