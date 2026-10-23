import './MemberTable.scss';

import {
  Avatar,
  Box,
  Button,
  Checkbox,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { formatLocalTime } from '@shared/lib/dayjs';
import {
  AppChip,
  ConfirmDialog,
  PageTableEmptyState,
  type SortOrder,
  SortTableHeader,
  SvgIcon,
} from '@shared/ui';

import type { IMemberItem } from '../api/members.api.types';
import { toDisplayName } from '../domain/member.rules';
import type { TableHeaderSortKey } from '../domain/types';
import { useMemberTableActions } from '../hooks/useMemberTableActions';
import { memberRoleChipProps } from './memberRoleChip';

export type { TableHeaderSortKey };

interface IProps {
  rows: IMemberItem[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  sortKey: TableHeaderSortKey;
  sortOrder: SortOrder;
  hasError?: boolean;
  onSort: (key: TableHeaderSortKey) => void;
  onRetry: () => void;
  onClearAll: () => void;
  onMemberDeleted: () => void;
}

function getInitial(name: string) {
  return name?.charAt(0)?.toUpperCase() || '?';
}

export default function MemberTable({
  rows,
  sortKey,
  sortOrder,
  hasError = false,
  onSort,
  onRetry,
  onClearAll,
  onMemberDeleted,
}: IProps) {
  const {
    currentOrgName,
    currentUserId,
    selectedIds,
    deleteOpen,
    targetMember,
    hasPermission,
    allSelected,
    someSelected,
    handleSelectAll,
    handleSelectOne,
    handleBatchEdit,
    handleEditOne,
    handleOpenDialog,
    handleCloseDialog,
    handleBatchDelete,
    handleConfirmDelete,
  } = useMemberTableActions(rows, onMemberDeleted);

  return (
    <Box>
      <TableContainer className="member-table">
        <Table>
          <TableHead>
            {selectedIds.length > 0 ? (
              <TableRow className="member-table-row">
                <TableCell
                  sx={{
                    p: 0,
                    pl: 2,
                  }}
                >
                  <Stack direction="row" className="member-table__checkbox">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      sx={{ p: 0 }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </Stack>
                </TableCell>

                <TableCell colSpan={5} className="member-table-row">
                  <Box className="member-table__batch-toolbar">
                    <Box className="member-table__batch-left">
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500 }}
                        className="member-table__batch-count"
                      >
                        {selectedIds.length} item
                        {selectedIds.length > 1 ? 's' : ''} selected
                      </Typography>
                    </Box>

                    <Stack
                      direction="row"
                      spacing={1}
                      className="member-table__batch-actions"
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        className="member-table__batch-actions-btn"
                        disabled={!hasPermission}
                        startIcon={
                          <SvgIcon
                            name="EditOutlined"
                            sx={{
                              color: !hasPermission
                                ? 'var(--action-disabled)'
                                : 'var(--primary-main)',
                            }}
                          />
                        }
                        onClick={handleBatchEdit}
                      >
                        <Typography
                          variant="body2"
                          className="member-table__batch-count"
                        >
                          Edit
                        </Typography>
                      </Button>

                      <Button
                        variant="outlined"
                        size="small"
                        className="member-table__batch-actions-btn"
                        disabled={!hasPermission}
                        startIcon={
                          <SvgIcon
                            name="DeleteOutlined"
                            sx={{
                              color: !hasPermission
                                ? 'var(--action-disabled)'
                                : 'var(--primary-main)',
                            }}
                          />
                        }
                        onClick={handleBatchDelete}
                      >
                        <Typography
                          variant="body2"
                          className="member-table__batch-count"
                        >
                          Delete
                        </Typography>
                      </Button>
                    </Stack>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow className="member-table-row">
                <TableCell
                  sx={{
                    p: 0,
                    pl: 2,
                  }}
                >
                  <Stack direction="row" className="member-table__checkbox">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      sx={{
                        p: 0,
                        m: 0,
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </Stack>
                </TableCell>

                <SortTableHeader
                  label="Name"
                  active={sortKey === 'name'}
                  order={sortOrder}
                  onClick={() => onSort('name')}
                />

                <SortTableHeader
                  label="Org role"
                  width="200px"
                  active={sortKey === 'orgRole'}
                  order={sortOrder}
                  onClick={() => onSort('orgRole')}
                />

                <TableCell
                  sx={{
                    width: '200px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Date modified
                </TableCell>

                <TableCell
                  sx={{
                    width: '200px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Date created
                </TableCell>

                <TableCell
                  sx={{
                    width: '108px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            )}
          </TableHead>

          <TableBody>
            {rows.map((row) => {
              const checked = selectedIds.includes(row.userId);

              const displayName = toDisplayName(row.name);

              return (
                <TableRow
                  key={row.userId}
                  hover
                  selected={checked}
                  className="member-table-row"
                >
                  <TableCell padding="checkbox">
                    <Stack direction="row" className="member-table__checkbox">
                      <Checkbox
                        checked={checked}
                        disabled={row.userId === currentUserId}
                        sx={{
                          p: 0,
                          m: 0,
                        }}
                        onChange={(e) =>
                          handleSelectOne(row.userId, e.target.checked)
                        }
                      />
                    </Stack>
                  </TableCell>

                  <TableCell sx={{ minWidth: '260px' }}>
                    <Stack direction="row" className="member-table__info">
                      <Avatar className="member-table__info-avatar">
                        {getInitial(displayName)}
                      </Avatar>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="subtitle2"
                          className="member-table__info-name"
                        >
                          {displayName || '-'}
                        </Typography>
                        <Typography
                          variant="body2"
                          className="member-table__info-email"
                        >
                          {row.email ?? '-'}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <AppChip {...memberRoleChipProps(row.orgRole)} />
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      className="member-table-modified"
                    >
                      {row?.updatedAt ? formatLocalTime(row.updatedAt) : '-'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      className="member-table-modified"
                    >
                      {row?.createdAt ? formatLocalTime(row.createdAt) : '-'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" className="member-table__actions">
                      <IconButton
                        size="small"
                        disabled={
                          !hasPermission || row.userId === currentUserId
                        }
                        onClick={() => handleEditOne(row.userId)}
                      >
                        <SvgIcon
                          name="EditOutlined"
                          className="header-menu-icon"
                          sx={{
                            color:
                              hasPermission && row.userId !== currentUserId
                                ? 'var(--action-active)'
                                : 'var(--action-disabled)',
                          }}
                        />
                      </IconButton>

                      <IconButton
                        size="small"
                        disabled={
                          !hasPermission || row.userId === currentUserId
                        }
                        onClick={() => handleOpenDialog(row)}
                      >
                        <SvgIcon
                          name="DeleteOutlined"
                          className="header-menu-icon"
                          sx={{
                            color:
                              hasPermission && row.userId !== currentUserId
                                ? 'var(--action-active)'
                                : 'var(--action-disabled)',
                          }}
                        />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}

            {rows.length === 0 && hasError && (
              <PageTableEmptyState
                variant="error"
                colSpan={7}
                title="Couldn't load members"
                description="Something went wrong while loading this list. Please try again."
                actionLabel="Retry"
                onAction={onRetry}
              />
            )}

            {rows.length === 0 && !hasError && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Box className="search-empty">
                    <Typography variant="h5" gutterBottom>
                      No results found.
                    </Typography>

                    <Typography
                      variant="body1"
                      color="text.secondary"
                      className="search-empty-desc"
                    >
                      Try adjusting your search or filter options to find what
                      you are looking for.
                    </Typography>

                    <Button
                      variant="outlined"
                      className="search-empty-btn"
                      onClick={onClearAll}
                    >
                      Clear all
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => handleCloseDialog()}
        title={
          targetMember
            ? 'Delete Members'
            : `Delete ${selectedIds.length} Members`
        }
        content={
          targetMember
            ? `Are you sure you want to delete ${targetMember} from ${currentOrgName} and all its sub-orgs? All settings will be deleted.`
            : 'Are you sure you want to delete members? All settings will be deleted.'
        }
        actions={[
          {
            label: 'Cancel',
            onClick: () => handleCloseDialog(),
          },
          {
            label: 'Delete',
            onClick: handleConfirmDelete,
          },
        ]}
      />
    </Box>
  );
}
