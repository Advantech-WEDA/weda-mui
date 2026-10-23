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
  SimpleConfirmDialog,
  SvgIcon,
} from '@shared/ui';
import { useRef } from 'react';

import TableSection from '@/features/devices/components/DeployAiModel/TableSection';
import type { AiModelDeployTableRow } from '@/features/devices/domain/types';

const TAB_ITEMS = [{ key: 'basic', label: 'AI model list' }];

interface IProps {
  pageTitle: string;
  hasPermission: boolean;
  loading: boolean;
  pagedRows: AiModelDeployTableRow[];
  pageModelIds: string[];
  searchWord: string;
  page: number;
  rowsPerPage: number;
  visibleTotalCount: number;
  hasFilter: boolean;
  cancelOpen: boolean;
  submitOpen: boolean;
  selectedModelIds: string[];
  setPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
  handleSearchChange: (value: string) => void;
  handleClearFilters: () => void;
  handleEditionChange: (modelId: string, edition: string) => void;
  onSelectModel: (modelId: string) => void;
  onSelectAll: (modelIds: string[]) => void;
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
  pageModelIds,
  searchWord,
  page,
  rowsPerPage,
  visibleTotalCount,
  hasFilter,
  cancelOpen,
  submitOpen,
  selectedModelIds,
  setPage,
  setRowsPerPage,
  handleSearchChange,
  handleClearFilters,
  handleEditionChange,
  onSelectModel,
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
              disabled={selectedModelIds.length === 0 || !hasPermission}
              onClick={onOpenSubmitDialog}
            >
              Submit ({selectedModelIds.length})
            </Button>
          </Stack>
        </Box>

        <Divider className="editor-page__header-divider" />
      </Box>

      <Box className="editor-page__content">
        <Box className="editor-page__left">
          <Box id="basic-information-section" ref={basicRef}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h5">AI model list</Typography>
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
            selectedModelIds={selectedModelIds}
            onSelectModel={onSelectModel}
            onSelectAll={() => onSelectAll(pageModelIds)}
            loading={loading}
            hasFilter={hasFilter}
            hasPermission={hasPermission}
            onClearAll={handleClearFilters}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            onEditionChange={handleEditionChange}
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
              disabled={selectedModelIds.length === 0 || !hasPermission}
              onClick={onOpenSubmitDialog}
            >
              Submit ({selectedModelIds.length})
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
        title="Deploy AI Model(s)"
        content="Are you sure you want to deploy the selected AI model(s) to this device?"
        confirmLabel="Deploy"
        onClose={onConfirmCancel}
        onConfirm={onSubmit}
      />
    </Box>
  );
}
