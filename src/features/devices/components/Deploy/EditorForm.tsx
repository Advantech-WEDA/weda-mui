import {
  type ContainerStackTableRow,
  type TableHeaderSortKey,
  typeOptions,
} from '@features/container-stacks';
import {
  Box,
  Button,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Breadcrumbs,
  ConfirmDialog,
  ScrollSideTabs,
  SelectElement,
  SimpleConfirmDialog,
  type SortOrder,
  SvgIcon,
} from '@shared/ui';
import { useRef } from 'react';

import TableSection from './TableSection';

const TAB_ITEMS = [{ key: 'basic', label: 'Stack list' }];

interface IProps {
  pageTitle: string;
  hasPermission: boolean;
  loading: boolean;
  pagedRows: ContainerStackTableRow[];
  pageStackConfigIds: string[];
  deployedStackRevisionIds: Set<string>;
  searchWord: string;
  typeFilter: string;
  page: number;
  rowsPerPage: number;
  sortKey: TableHeaderSortKey;
  sortOrder: SortOrder;
  visibleTotalCount: number;
  hasFilter: boolean;
  cancelOpen: boolean;
  submitOpen: boolean;
  selectedStackConfigIds: string[];
  setPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
  handleSearchChange: (value: string) => void;
  handleTypeFilterChange: (value: string) => void;
  handleSort: (key: TableHeaderSortKey) => void;
  handleClearFilters: () => void;
  handleVersionChange: (stackConfigId: string, version: number) => void;
  onSelectStackConfig: (stackConfigId: string) => void;
  onSelectAll: (stackConfigIds: string[]) => void;
  onCancel: () => void;
  onSubmit: () => void | Promise<void>;
  onConfirmCancel: () => void | Promise<void>;
  onOpenCancelDialog?: () => void | Promise<void>;
  onOpenSubmitDialog?: () => void | Promise<void>;
}

export default function EditorForm({
  pageTitle,
  hasPermission,
  loading,
  pagedRows,
  pageStackConfigIds,
  deployedStackRevisionIds,
  searchWord,
  typeFilter,
  page,
  rowsPerPage,
  sortKey,
  sortOrder,
  visibleTotalCount,
  hasFilter,
  cancelOpen,
  submitOpen,
  selectedStackConfigIds,
  setPage,
  setRowsPerPage,
  handleSearchChange,
  handleTypeFilterChange,
  handleSort,
  handleClearFilters,
  handleVersionChange,
  onSelectStackConfig,
  onSelectAll,
  onCancel,
  onSubmit,
  onConfirmCancel,
  onOpenCancelDialog,
  onOpenSubmitDialog,
}: IProps) {
  const basicRef = useRef<HTMLDivElement | null>(null);

  const sections = [
    {
      key: 'basic',
      ref: basicRef,
      id: 'basic-information-section',
    },
  ];

  return (
    <Box className="editor-page">
      <Box className="editor-page__header">
        <Breadcrumbs />
        <Box className="editor-page__header-top">
          <Box className="editor-page__header-title">
            <Typography variant="h4">{pageTitle}</Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            className="editor-page__header-actions"
          >
            <Button
              variant="outlined"
              className="editor-page__header-actions-btn-cancel"
              onClick={onOpenCancelDialog}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              className="editor-page__header-actions-btn-submit"
              disabled={selectedStackConfigIds.length === 0}
              onClick={onOpenSubmitDialog}
            >
              Submit ({selectedStackConfigIds.length})
            </Button>
          </Stack>
        </Box>

        <Divider className="editor-page__header-divider" />
      </Box>

      <Box className="editor-page__content">
        <Box className="editor-page__left">
          <Box id="basic-information-section" ref={basicRef}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5">Stack list</Typography>
            </Box>

            <Box padding={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  placeholder="Search"
                  value={searchWord}
                  className="page-search"
                  onChange={(e) => handleSearchChange(e.target.value)}
                  sx={{ width: 220, flexShrink: 0 }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SvgIcon
                            name="SearchFilled"
                            sx={{
                              color: 'var(--action-active)',
                            }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Box sx={{ flexShrink: 0 }}>
                  <SelectElement
                    value={typeFilter}
                    onChange={handleTypeFilterChange}
                    placeholder="Type"
                    minWidth={84}
                    options={typeOptions}
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
            </Box>
          </Box>

          <TableSection
            rows={pagedRows}
            totalCount={visibleTotalCount}
            page={page}
            rowsPerPage={rowsPerPage}
            sortKey={sortKey}
            sortOrder={sortOrder}
            selectedStackConfigIds={selectedStackConfigIds}
            onSelectStackConfig={onSelectStackConfig}
            onSelectAll={() => onSelectAll(pageStackConfigIds)}
            onSort={handleSort}
            loading={loading}
            hasFilter={hasFilter}
            hasPermission={hasPermission}
            onClearAll={handleClearFilters}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            onVersionChange={handleVersionChange}
            disabledRevisionIds={deployedStackRevisionIds}
          />

          <Stack
            direction="row"
            spacing={1}
            className="editor-page__footer"
            sx={{ mt: 3 }}
          >
            <Button
              size="small"
              variant="outlined"
              className="editor-page__footer__btn-cancel"
              onClick={onOpenCancelDialog}
            >
              Cancel
            </Button>

            <Button
              size="small"
              variant="contained"
              className="editor-page__footer__btn-submit"
              disabled={selectedStackConfigIds.length === 0}
              onClick={onOpenSubmitDialog}
            >
              Submit ({selectedStackConfigIds.length})
            </Button>
          </Stack>
        </Box>

        <Box className="editor-page__right">
          <ScrollSideTabs sections={sections} tabItems={TAB_ITEMS} />
        </Box>
      </Box>

      <ConfirmDialog
        open={cancelOpen}
        onClose={onCancel}
        title="Unsaved Changes"
        content="Do you want to leave this page? Any unsaved changes will be lost."
        actions={[
          {
            label: 'Keep editing',
            onClick: onConfirmCancel,
          },
          {
            label: 'Don’t save',
            onClick: onCancel,
          },
        ]}
      />

      <SimpleConfirmDialog
        open={submitOpen}
        title="Deploy Stack"
        content="Are you sure you want to deploy this stack?"
        confirmLabel="Deploy"
        onClose={onConfirmCancel}
        onConfirm={onSubmit}
      />
    </Box>
  );
}
