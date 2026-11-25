import type {
  DataStreamDataType,
  IDataStreamItem,
} from '@features/data-streams';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import {
  PageSearchField,
  RevokeDialog,
  SelectElement,
  type SelectOption,
  type SortOrder,
  SvgIcon,
} from '@shared/ui';

import { dataTypeOptions } from '@/features/devices/components/Detail/DataStreams/dataStreamDisplay';
import type { DataStreamSortKey } from '@/features/devices/components/Detail/DataStreams/dataStreamTable.columns';
import TableSection from '@/features/devices/components/Detail/DataStreams/TableSection';
import type { SourceFilterValue } from '@/features/devices/hooks/useDeviceDataStreamsTab';

export interface DataStreamsViewProps {
  hasPermission: boolean;
  loading: boolean;

  hasError: boolean;
  pagedRows: IDataStreamItem[];
  visibleTotalCount: number;
  hasFilter: boolean;
  searchWord: string;
  dataTypeFilter: DataStreamDataType | '';
  sourceFilter: SourceFilterValue | '';

  sourceOptions: SelectOption[];
  page: number;
  rowsPerPage: number;

  sortKey: DataStreamSortKey | null;
  sortOrder: SortOrder;
  deleteTarget: IDataStreamItem | null;
  inputValue: string;

  deleteTargetName: string;

  deleteConfirmName: string;
  canConfirmDelete: boolean;
  setPage: (page: number) => void;
  setInputValue: (value: string) => void;
  handleSearchChange: (value: string) => void;
  handleDataTypeFilterChange: (value: DataStreamDataType | '') => void;
  handleSourceFilterChange: (value: SourceFilterValue | '') => void;
  handleClearFilters: () => void;
  handleRowsPerPageChange: (rows: number) => void;
  handleSort: (key: DataStreamSortKey) => void;
  handleRefresh: () => void | Promise<void>;
  handleRetry: () => void;
  handleAdd: () => void;
  handleEdit: (row: IDataStreamItem) => void;
  handleOpenDelete: (row: IDataStreamItem) => void;
  handleCloseDelete: () => void;
  handleConfirmDelete: () => void | Promise<void>;
}

export default function DataStreamsView({
  hasPermission,
  loading,
  hasError,
  pagedRows,
  visibleTotalCount,
  hasFilter,
  searchWord,
  dataTypeFilter,
  sourceFilter,
  sourceOptions,
  page,
  rowsPerPage,
  sortKey,
  sortOrder,
  deleteTarget,
  inputValue,
  deleteTargetName,
  deleteConfirmName,
  canConfirmDelete,
  setPage,
  setInputValue,
  handleSearchChange,
  handleDataTypeFilterChange,
  handleSourceFilterChange,
  handleClearFilters,
  handleRowsPerPageChange,
  handleSort,
  handleRefresh,
  handleRetry,
  handleAdd,
  handleEdit,
  handleOpenDelete,
  handleCloseDelete,
  handleConfirmDelete,
}: DataStreamsViewProps) {
  return (
    <Box component="article">
      <Paper elevation={0} className="page-paper">
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" color="var(--text-primary)">
            DataStreams
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              flexWrap: 'nowrap',
              overflow: 'hidden',
              minWidth: 0,
              flex: 1,
            }}
          >
            {hasPermission && (
              <Button
                variant="contained"
                className="page-btn page-add-btn"
                startIcon={
                  <SvgIcon
                    name="Add"
                    sx={{ color: 'var(--primary-contrastText)' }}
                  />
                }
                onClick={handleAdd}
                sx={{ flexShrink: 0, textTransform: 'none' }}
              >
                <Typography variant="body1">Add</Typography>
              </Button>
            )}

            <PageSearchField
              value={searchWord}
              onChange={(e) => handleSearchChange(e.target.value)}
            />

            <Box sx={{ flexShrink: 0 }}>
              <SelectElement
                value={dataTypeFilter}
                onChange={(value) =>
                  handleDataTypeFilterChange(value as DataStreamDataType | '')
                }
                placeholder="Data Type"
                minWidth={140}
                options={dataTypeOptions}
              />
            </Box>

            <Box sx={{ flexShrink: 0 }}>
              <SelectElement
                value={sourceFilter}
                onChange={(value) =>
                  handleSourceFilterChange(value as SourceFilterValue | '')
                }
                placeholder="Source"
                minWidth={140}
                options={sourceOptions}
              />
            </Box>

            <Button
              className="page-btn"
              variant="outlined"
              onClick={handleClearFilters}
              sx={{ flexShrink: 0, textTransform: 'none' }}
            >
              <Typography variant="body1">Clear filters</Typography>
            </Button>
          </Stack>

          <Button
            startIcon={
              <SvgIcon
                name="RefreshFilled"
                sx={{ color: 'var(--action-active)' }}
              />
            }
            onClick={handleRefresh}
            sx={{
              flexShrink: 0,
              color: 'var(--action-active, rgba(0, 0, 0, 0.54))',
            }}
          />
        </Box>

        <TableSection
          rows={pagedRows}
          totalCount={visibleTotalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          loading={loading}
          hasError={hasError}
          hasFilter={hasFilter}
          hasPermission={hasPermission}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={handleSort}
          onAdd={handleAdd}
          onRetry={handleRetry}
          onClearAll={handleClearFilters}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) =>
            handleRowsPerPageChange(parseInt(e.target.value, 10))
          }
          onEdit={handleEdit}
          onDelete={handleOpenDelete}
        />

        <RevokeDialog
          open={Boolean(deleteTarget)}
          title="Delete DataStream"
          content={`Are you sure you want to delete DataStream "${deleteTargetName}"?`}
          inputLabel="Re-enter the Display name or DataStream name to confirm deletion"
          mismatchText="Display name or DataStream name does not match."
          confirmName={deleteConfirmName}
          confirmDisabled={!canConfirmDelete}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onClose={handleCloseDelete}
          onConfirm={handleConfirmDelete}
        />
      </Paper>
    </Box>
  );
}
