import './TableContent.scss';

import { memberRoleChipProps } from '@features/members';
import {
  Avatar,
  AvatarGroup,
  Box,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { AppChip, SvgIcon } from '@shared/ui';
import { Fragment, useCallback, useMemo, useState } from 'react';

import type { OrganizationRow } from '../domain/types';
import AdminListPopover from './AdminListPopover';

interface IProps {
  row: OrganizationRow;
  level: number;
  onEdit: (row: OrganizationRow) => void;
  onDelete: (row: OrganizationRow) => void;
}

function getInitial(name?: string) {
  return name?.trim()?.charAt(0)?.toUpperCase() || '-';
}

export default function TableContent({ row, level, onEdit, onDelete }: IProps) {
  const [expanded, setExpanded] = useState(true);
  const [adminPopoverAnchor, setAdminPopoverAnchor] =
    useState<HTMLElement | null>(null);

  const nextLevel = level + 1;
  const hasChildren = Boolean(row.children?.length);
  const admins = useMemo(() => row.admins ?? [], [row.admins]);

  const { isCurrent: isCurrentOrg, disableEdit, disableDelete } = row;

  const handleToggle = useCallback(() => {
    if (!hasChildren) return;
    setExpanded((prev) => !prev);
  }, [hasChildren]);

  return (
    <Fragment>
      <TableRow
        hover
        className={`page-table-row ${isCurrentOrg ? 'page-table-row--current' : ''}`}
      >
        <TableCell>
          <Box
            className="page-table__info"
            sx={{
              display: 'flex',
              alignItems: 'center',
              pl: `${nextLevel * 16}px`,
              gap: 1,
            }}
          >
            <Box
              onClick={handleToggle}
              sx={{
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: hasChildren ? 'pointer' : 'default',
                color: 'text.secondary',
              }}
            >
              {hasChildren ? (
                expanded ? (
                  <SvgIcon
                    name="ExpandMoreFilled"
                    sx={{ color: 'var(--action-active)' }}
                  />
                ) : (
                  <SvgIcon
                    name="ChevronRightFilled"
                    sx={{ color: 'var(--action-active)' }}
                  />
                )
              ) : (
                <Box sx={{ width: 34, height: 34 }} />
              )}
            </Box>

            <Box>
              <Typography variant="body2" className="page-table__info-name">
                {row.name}

                {isCurrentOrg && (
                  <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                    (Current)
                  </Typography>
                )}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                className="page-table__info-id"
              >
                {row.orgId}
              </Typography>
            </Box>
          </Box>
        </TableCell>

        <TableCell>{row.description || '-'}</TableCell>

        <TableCell>
          {admins.length > 0 ? (
            <Box
              onClick={(event) => {
                event.stopPropagation();
                setAdminPopoverAnchor(event.currentTarget);
              }}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <AvatarGroup
                max={5}
                sx={{
                  '& .MuiAvatar-root': {
                    width: 24,
                    height: 24,
                    fontSize: 12,
                  },
                }}
              >
                {admins.map((admin) => (
                  <Avatar key={admin.userId}>{getInitial(admin.name)}</Avatar>
                ))}
              </AvatarGroup>
            </Box>
          ) : (
            '-'
          )}
        </TableCell>

        <TableCell>
          {row.myOrgRole ? (
            <AppChip {...memberRoleChipProps(row.myOrgRole)} />
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              className="page-table__info-id"
            >
              -
            </Typography>
          )}
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Edit">
              <span style={{ display: 'inline-flex' }}>
                <IconButton
                  size="small"
                  disabled={disableEdit}
                  onClick={() => onEdit(row)}
                >
                  <SvgIcon
                    name="EditOutlined"
                    sx={{
                      color: disableEdit
                        ? 'var(--action-disabled)'
                        : 'var(--action-active)',
                    }}
                  />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Delete">
              <span style={{ display: 'inline-flex' }}>
                <IconButton
                  size="small"
                  disabled={disableDelete}
                  onClick={() => onDelete(row)}
                >
                  <SvgIcon
                    name="DeleteOutlined"
                    sx={{
                      color: disableDelete
                        ? 'var(--action-disabled)'
                        : 'var(--action-active)',
                    }}
                  />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>

      {expanded &&
        row.children?.map((child) => (
          <TableContent
            key={child.orgId}
            row={child}
            level={nextLevel}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

      <AdminListPopover
        anchorEl={adminPopoverAnchor}
        admins={admins}
        onClose={() => setAdminPopoverAnchor(null)}
      />
    </Fragment>
  );
}
