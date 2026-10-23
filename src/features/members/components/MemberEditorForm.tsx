import './MemberEditorForm.scss';

import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import {
  Breadcrumbs,
  ConfirmDialog,
  Pagination,
  ScrollSideTabs,
  SelectElement,
  SimpleConfirmDialog,
  SvgIcon,
} from '@shared/ui';
import { useMemo, useRef } from 'react';

import { toDisplayName } from '../domain/member.rules';
import type { MemberItem, RoleType } from '../domain/types';
import { subOrgRoleOptions } from './memberRoleOptions';

export type { MemberItem };

interface MemberEditorFormProps {
  mode: 'add' | 'edit';
  members: MemberItem[];
  selectedIds: string[];
  searchKeyword: string;
  page: number;
  rowsPerPage: number;
  totalCount: number;
  loading?: boolean;
  error?: string | null;
  dialogOpen: boolean;
  dialogSubmitOpen: boolean;
  hasPermission: boolean;
  onSearchChange: (value: string) => void;
  onToggleAll: (checked: boolean) => void;
  onToggleOne: (id: string) => void;
  onRoleChange: (id: string, value: string | RoleType | undefined) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onOpenDialog: () => void;
  onOpenSubmitDialog: () => void;
  onCloseDialog: () => void;
  onCloseSubmitDialog: () => void;
  onSubmit: () => void | Promise<void>;
  onClearFilters: () => void;
}

const stringAvatar = (name: string) => ({
  sx: {
    width: 32,
    height: 32,
  },
  children: name?.charAt(0)?.toUpperCase() || '',
});

export default function MemberEditorForm({
  mode,
  members,
  selectedIds,
  searchKeyword,
  page,
  rowsPerPage,
  totalCount,
  loading = false,
  error = null,
  dialogOpen,
  dialogSubmitOpen,
  hasPermission,
  onSearchChange,
  onToggleAll,
  onToggleOne,
  onRoleChange,
  onPageChange,
  onRowsPerPageChange,
  onOpenDialog,
  onOpenSubmitDialog,
  onCloseDialog,
  onCloseSubmitDialog,
  onSubmit,
  onClearFilters,
}: MemberEditorFormProps) {
  const navigate = useAppNavigate();

  const memberListRef = useRef<HTMLDivElement | null>(null);

  const tabItems = [{ key: 'memberList', label: 'Member list' }];

  const sections = [
    {
      key: 'memberList',
      ref: memberListRef,
      id: 'member-list-section',
    },
  ];

  const selectedCount = selectedIds.length;
  const canSubmit = hasPermission && selectedCount > 0;

  const isAllChecked = useMemo(() => {
    return (
      members.length > 0 && members.every((m) => selectedIds.includes(m.id))
    );
  }, [members, selectedIds]);

  const isIndeterminate = useMemo(() => {
    return members.some((m) => selectedIds.includes(m.id)) && !isAllChecked;
  }, [members, selectedIds, isAllChecked]);

  const pageTitle = mode === 'edit' ? 'Edit Member(s)' : 'Add Member';
  const submitLabel = 'Submit';

  const handleBackToMember = () => {
    navigate('/members');
  };

  return (
    <Box className="add-member">
      <Box className="add-member__header">
        <Breadcrumbs />
        <Box className="add-member__header-top">
          <Box className="add-member__header-title">
            <Typography variant="h4">{pageTitle}</Typography>
            <Typography variant="body2">*Required</Typography>
          </Box>

          <Box className="add-member__header-actions">
            <Button
              variant="outlined"
              className="add-member__header-btn-cancel"
              onClick={onOpenDialog}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              disabled={!canSubmit}
              onClick={onOpenSubmitDialog}
              className="add-member__header-btn-submit"
            >
              {submitLabel} ({selectedCount})
            </Button>
          </Box>
        </Box>

        <Divider className="add-member__header-divider" />
      </Box>

      <Box className="add-member__content">
        <Box className="add-member__left">
          <Box id="member-list-section" ref={memberListRef}>
            <Typography className="add-member__left-title" variant="h5">
              Member list
            </Typography>
            <Paper variant="outlined" className="add-member__left-paper">
              <Box className="add-member__left-search">
                <TextField
                  placeholder="Search"
                  className="add-member__left-search-input"
                  sx={{ width: '240px' }}
                  value={searchKeyword}
                  onChange={(e) => onSearchChange(e.target.value)}
                  fullWidth
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
              </Box>

              <TableContainer>
                <Table className="add-member__table" size="small">
                  <TableHead>
                    <TableRow className="add-member__table-row">
                      {mode === 'add' && (
                        <TableCell
                          className="add-member__table-row-checkbox"
                          width={36}
                        >
                          <Checkbox
                            size="small"
                            sx={{ p: 0, m: 0 }}
                            checked={isAllChecked}
                            indeterminate={isIndeterminate}
                            onChange={(e) => onToggleAll(e.target.checked)}
                          />
                        </TableCell>
                      )}

                      <TableCell width={400}>Name</TableCell>

                      <TableCell>
                        Org role
                        <Box component="span" sx={{ color: 'error.main' }}>
                          *
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          sx={{ textAlign: 'center', py: 4 }}
                        >
                          <Typography variant="body1">Loading...</Typography>
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          sx={{ textAlign: 'center', py: 4 }}
                        >
                          <Typography variant="body1" color="error">
                            {error}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : members.length > 0 ? (
                      members.map((m) => {
                        const displayName = toDisplayName(m.name);

                        return (
                          <TableRow
                            className="add-member__table-row"
                            key={m.id}
                            hover
                          >
                            {mode === 'add' && (
                              <TableCell className="add-member__table-row-checkbox">
                                <Checkbox
                                  size="small"
                                  sx={{ p: 0, m: 0 }}
                                  checked={selectedIds.includes(m.id)}
                                  onChange={() => onToggleOne(m.id)}
                                />
                              </TableCell>
                            )}

                            <TableCell>
                              <Stack
                                className="add-member__table-row-info"
                                direction="row"
                              >
                                <Avatar
                                  className="add-member__table-row-info-avatar"
                                  {...stringAvatar(displayName)}
                                />
                                <Box>
                                  <Typography
                                    variant="subtitle2"
                                    className="add-member__table-row-info-name"
                                  >
                                    {displayName || '-'}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    className="add-member__table-row-info-email"
                                  >
                                    {m.email || '-'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>

                            <TableCell>
                              <SelectElement
                                className="add-member__table-row-select"
                                value={m.role}
                                onChange={(value) => onRoleChange(m.id, value)}
                                minWidth={147}
                                options={subOrgRoleOptions}
                                required
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          sx={{ textAlign: 'center', py: 4 }}
                        >
                          <Box className="add-member__table-empty">
                            <Typography variant="h5" gutterBottom>
                              No results found.
                            </Typography>

                            <Typography
                              variant="body1"
                              color="text.secondary"
                              className="add-member__table-empty-desc"
                            >
                              Try adjusting your search or filter options to
                              find what you are looking for.
                            </Typography>

                            <Button
                              variant="outlined"
                              size="small"
                              className="add-member__table-empty-clear-btn"
                              onClick={onClearFilters}
                              sx={{ mt: 1 }}
                            >
                              Clear all
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>

                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3} sx={{ px: 2 }}>
                        <Pagination
                          bare
                          sx={{ p: 0, height: 40 }}
                          count={totalCount}
                          page={page}
                          rowsPerPage={rowsPerPage}
                          onPageChange={(_, p) => onPageChange(p)}
                          onRowsPerPageChange={(e) =>
                            onRowsPerPageChange(parseInt(e.target.value, 10))
                          }
                        />
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </Paper>
          </Box>

          <Stack direction="row" className="add-member__footer">
            <Button
              size="small"
              variant="outlined"
              className="add-member__header-btn-cancel"
              onClick={onOpenDialog}
            >
              Cancel
            </Button>

            <Button
              size="small"
              variant="contained"
              disabled={!canSubmit}
              onClick={onOpenSubmitDialog}
            >
              {submitLabel} ({selectedCount})
            </Button>
          </Stack>
        </Box>

        <Box className="member-editor__right">
          <ScrollSideTabs sections={sections} tabItems={tabItems} />
        </Box>
      </Box>

      <ConfirmDialog
        open={dialogOpen}
        onClose={onCloseDialog}
        title="Unsaved Changes"
        content="Do you want to save your changes before leaving? Any unsaved changes will be lost."
        actions={[
          {
            label: 'Keep editing',
            onClick: onCloseDialog,
          },
          {
            label: 'Don’t save',
            onClick: handleBackToMember,
          },
          {
            label: 'Save changes',
            onClick: onSubmit,
            disabled: !canSubmit,
          },
        ]}
      />

      <SimpleConfirmDialog
        open={dialogSubmitOpen}
        title={mode === 'edit' ? 'Save Changes' : 'Add Member(s)'}
        content={
          mode === 'edit'
            ? 'Are you sure you want to save these changes?'
            : 'Are you sure you want to add these members?'
        }
        confirmLabel={mode === 'edit' ? 'Save' : 'Add'}
        onClose={onCloseSubmitDialog}
        onConfirm={onSubmit}
      />
    </Box>
  );
}
