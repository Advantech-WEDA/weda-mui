import {
  type Status,
  statusOptions,
  type TableHeaderSortKey,
} from '@features/devices';
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

import type { DeployDeviceRow } from '../../api/stacks.api.types';
import TableSection from './TableSection';

const TAB_ITEMS = [{ key: 'basic', label: 'Device list' }];

interface IProps {
  pageTitle: string;
  hasPermission: boolean;
  loading: boolean;
  deploymentsLoading: boolean;
  displayRows: DeployDeviceRow[];
  disabledDeviceIds: string[];
  selectableDeviceIds: string[];
  searchWord: string;
  statusFilter: Status | '';
  page: number;
  rowsPerPage: number;
  sortKey: TableHeaderSortKey;
  sortOrder: SortOrder;
  visibleTotalCount: number;
  hasFilter: boolean;
  cancelOpen: boolean;
  submitOpen: boolean;
  selectedDeviceIds: string[];
  setPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
  handleSearchChange: (value: string) => void;
  handleStatusFilterChange: (value: Status | '') => void;
  handleSort: (key: TableHeaderSortKey) => void;
  handleClearFilters: () => void;
  onSelectDevice: (deviceId: string) => void;
  onSelectAll: (deviceIds: string[]) => void;
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
  deploymentsLoading,
  displayRows,
  disabledDeviceIds,
  selectableDeviceIds,
  searchWord,
  statusFilter,
  page,
  rowsPerPage,
  sortKey,
  sortOrder,
  visibleTotalCount,
  hasFilter,
  cancelOpen,
  submitOpen,
  selectedDeviceIds,
  setPage,
  setRowsPerPage,
  handleSearchChange,
  handleStatusFilterChange,
  handleSort,
  handleClearFilters,
  onSelectDevice,
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
              disabled={selectedDeviceIds.length === 0 || !hasPermission}
              onClick={onOpenSubmitDialog}
            >
              Submit ({selectedDeviceIds.length})
            </Button>
          </Stack>
        </Box>

        <Divider className="editor-page__header-divider" />
      </Box>

      <Box className="editor-page__content">
        <Box className="editor-page__left">
          <Box id="basic-information-section" ref={basicRef}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5">Device list</Typography>
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
                            sx={{ color: 'var(--action-active)' }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Box sx={{ flexShrink: 0 }}>
                  <SelectElement
                    value={statusFilter}
                    onChange={(value) =>
                      handleStatusFilterChange(value as Status | '')
                    }
                    placeholder="Device status"
                    minWidth={147}
                    options={statusOptions}
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
            rows={displayRows}
            totalCount={visibleTotalCount}
            page={page}
            rowsPerPage={rowsPerPage}
            sortKey={sortKey}
            sortOrder={sortOrder}
            disabledDeviceIds={disabledDeviceIds}
            deploymentsLoading={deploymentsLoading}
            selectedDeviceIds={selectedDeviceIds}
            onSelectDevice={onSelectDevice}
            onSelectAll={() => onSelectAll(selectableDeviceIds)}
            onSort={handleSort}
            loading={loading}
            hasFilter={hasFilter}
            onClearAll={handleClearFilters}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
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
              disabled={selectedDeviceIds.length === 0}
              onClick={onOpenSubmitDialog}
            >
              Submit ({selectedDeviceIds.length})
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
        title={'Deploy to selected devices'}
        content={'Are you sure you want to deploy to selected devices?'}
        confirmLabel="Deploy"
        onClose={onConfirmCancel}
        onConfirm={onSubmit}
      />
    </Box>
  );
}
