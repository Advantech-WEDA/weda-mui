import { Box, TableBody, TableCell, TableHead } from '@mui/material';
import {
  PageTable,
  PageTableEmptyState,
  PageTableLoadingIndicator,
  PageTableRow,
  Pagination,
} from '@shared/ui';

import type { StackWithDeployments } from '../api/stacks.api.types';
import { type Action } from '../domain/types';
import type { Column } from './stackTable.columns';
import TableContent from './TableContent';

interface IProps {
  columns: Column[];
  rows: StackWithDeployments[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  loading?: boolean;
  hasError?: boolean;
  hasFilter?: boolean;
  hasPermission: boolean;
  onRetry: () => void;
  onClearAll: () => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onDelete: (row: StackWithDeployments) => void;
  onDeleteStack: (stackConfigId: string, deviceId: string) => void;
  onAction: (deviceId: string, stackConfigId: string, action: Action) => void;
  onEdit: (stackConfigId: string, stackRevisionId: string) => void;
  onDeploy: (stackConfigId: string, stackRevisionId: string) => void;
  onRedeploy: (
    deviceId: string,
    stackConfigId: string,
    stackRevisionId: string
  ) => void;
  onAdd: () => void;
}

export default function TableSection({
  columns,
  rows,
  totalCount,
  page,
  rowsPerPage,
  loading = false,
  hasError = false,
  hasFilter,
  hasPermission,
  onRetry,
  onClearAll,
  onPageChange,
  onRowsPerPageChange,
  onDelete,
  onDeleteStack,
  onEdit,
  onDeploy,
  onRedeploy,
  onAdd,
  onAction,
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
            {columns.map((col) => (
              <TableCell key={col.label} sx={{ width: col.width }}>
                {col.label}
              </TableCell>
            ))}
          </PageTableRow>
        </TableHead>

        <TableBody>
          {isErrorEmpty ? (
            <PageTableEmptyState
              variant="error"
              colSpan={columns.length}
              title="Couldn't load container stacks"
              description="Something went wrong while loading this list. Please try again."
              actionLabel="Retry"
              onAction={onRetry}
            />
          ) : isInitialEmpty ? (
            <PageTableEmptyState
              variant="initial"
              colSpan={columns.length}
              title="No container stacks, yet."
              description={
                hasPermission
                  ? 'Click the "+" button to add container stack here!'
                  : undefined
              }
              actionLabel="Add"
              onAction={onAdd}
              showAction={hasPermission}
            />
          ) : isFilterEmpty ? (
            <PageTableEmptyState
              variant="filter"
              colSpan={columns.length}
              title="No results found."
              description="Try adjusting your search or filter container stack to find what you are looking for."
              actionLabel="Clear all"
              onAction={onClearAll}
            />
          ) : (
            rows.map((row) => (
              <TableContent
                key={row.stackRevisionId}
                row={row}
                hasPermission={hasPermission}
                onDeploy={onDeploy}
                onRedeploy={onRedeploy}
                onEdit={onEdit}
                onDelete={onDelete}
                onDeleteStack={onDeleteStack}
                onAction={onAction}
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
