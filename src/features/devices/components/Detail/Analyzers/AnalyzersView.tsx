import type {
  AnalyzerSortKey,
  AnalyzerType,
  IAnalyzerItem,
} from '@features/analyzers';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import {
  PageSearchField,
  RevokeDialog,
  SimpleConfirmDialog,
  type SortOrder,
  SvgIcon,
} from '@shared/ui';
import { useState } from 'react';

import AddAnalyzerMenu from '@/features/devices/components/Detail/Analyzers/AddAnalyzerMenu';
import TableSection from '@/features/devices/components/Detail/Analyzers/TableSection';

export interface AnalyzersViewProps {
  hasPermission: boolean;
  loading: boolean;

  hasError: boolean;
  rows: IAnalyzerItem[];
  totalCount: number;
  dataStreamNames: Record<string, string>;
  hasFilter: boolean;
  searchWord: string;
  page: number;
  rowsPerPage: number;
  sortKey: AnalyzerSortKey;
  sortOrder: SortOrder;
  deleteTarget: IAnalyzerItem | null;
  inputValue: string;
  deleteTargetName: string;
  canConfirmDelete: boolean;
  setPage: (page: number) => void;
  setInputValue: (value: string) => void;
  handleSearchChange: (value: string) => void;
  handleClearFilters: () => void;
  handleSort: (key: AnalyzerSortKey) => void;
  handleRowsPerPageChange: (rows: number) => void;
  handleRefresh: () => void | Promise<void>;
  handleRetry: () => void;
  handleAdd: (type: AnalyzerType) => void;
  togglingId: string | null;
  toggleDialogOpen: boolean;
  toggleDialogContent: {
    title: string;
    content: string;
    confirmLabel: string;
  };
  handleToggleEnabled: (row: IAnalyzerItem) => void;
  handleCloseToggleDialog: () => void;
  handleConfirmToggle: () => void | Promise<void>;
  handleEdit: (row: IAnalyzerItem) => void;
  handleOpenDelete: (row: IAnalyzerItem) => void;
  handleCloseDelete: () => void;
  handleConfirmDelete: () => void | Promise<void>;
}

export default function AnalyzersView({
  hasPermission,
  loading,
  hasError,
  rows,
  totalCount,
  dataStreamNames,
  hasFilter,
  searchWord,
  page,
  rowsPerPage,
  sortKey,
  sortOrder,
  deleteTarget,
  inputValue,
  deleteTargetName,
  canConfirmDelete,
  setPage,
  setInputValue,
  handleSearchChange,
  handleClearFilters,
  handleSort,
  handleRowsPerPageChange,
  handleRetry,
  handleAdd,
  togglingId,
  toggleDialogOpen,
  toggleDialogContent,
  handleToggleEnabled,
  handleCloseToggleDialog,
  handleConfirmToggle,
  handleEdit,
  handleOpenDelete,
  handleCloseDelete,
  handleConfirmDelete,
}: AnalyzersViewProps) {
  const [addMenuAnchor, setAddMenuAnchor] = useState<HTMLElement | null>(null);

  const handleOpenAddMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAddMenuAnchor(event.currentTarget);
  };

  return (
    <Box component="article">
      <Paper elevation={0} className="page-paper">
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" color="var(--text-primary)">
            Analyzers
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
                onClick={handleOpenAddMenu}
                sx={{ flexShrink: 0, textTransform: 'none' }}
              >
                <Typography variant="body1">Add</Typography>
              </Button>
            )}

            <PageSearchField
              value={searchWord}
              onChange={(e) => handleSearchChange(e.target.value)}
            />

            <Button
              className="page-btn"
              variant="outlined"
              onClick={handleClearFilters}
              sx={{ flexShrink: 0, textTransform: 'none' }}
            >
              <Typography variant="body1">Clear filters</Typography>
            </Button>
          </Stack>
        </Box>

        <TableSection
          rows={rows}
          totalCount={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          loading={loading}
          hasError={hasError}
          hasFilter={hasFilter}
          hasPermission={hasPermission}
          dataStreamNames={dataStreamNames}
          onOpenAddMenu={handleOpenAddMenu}
          onRetry={handleRetry}
          onClearAll={handleClearFilters}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) =>
            handleRowsPerPageChange(parseInt(e.target.value, 10))
          }
          togglingId={togglingId}
          onToggleEnabled={handleToggleEnabled}
          onEdit={handleEdit}
          onDelete={handleOpenDelete}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={handleSort}
        />

        <AddAnalyzerMenu
          anchorEl={addMenuAnchor}
          onClose={() => setAddMenuAnchor(null)}
          onSelect={handleAdd}
        />

        <SimpleConfirmDialog
          open={toggleDialogOpen}
          title={toggleDialogContent.title}
          content={toggleDialogContent.content}
          confirmLabel={toggleDialogContent.confirmLabel}
          onClose={handleCloseToggleDialog}
          onConfirm={handleConfirmToggle}
        />

        <RevokeDialog
          open={Boolean(deleteTarget)}
          title="Delete Analyzer"
          content={`Are you sure you want to delete Analyzer "${deleteTargetName}"?`}
          inputLabel="Re-enter the Analyzer name to confirm deletion"
          mismatchText="Analyzer name does not match."
          confirmName={deleteTargetName}
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
