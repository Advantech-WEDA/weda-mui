import { Link, TableCell } from '@mui/material';
import { formatLocalTime } from '@shared/lib/dayjs';
import {
  PageTableActionsCell,
  PageTableInfoCell,
  PageTableRow,
} from '@shared/ui';
import { Link as RouterLink } from 'react-router-dom';

import { type IRegistryItem } from '../api/registries.api.types';
import { getRegistryTypeLabel } from '../domain/types';

interface IProps {
  row: IRegistryItem;
  hasPermission: boolean;
  onDelete: (row: IRegistryItem) => void;
  onEdit: (registryId: string) => void;
}

export default function TableContent({
  row,
  hasPermission,
  onDelete,
  onEdit,
}: IProps) {
  return (
    <PageTableRow hover>
      <TableCell>
        <PageTableInfoCell
          primary={
            <Link
              component={RouterLink}
              to={`../registries/${row.registryId}`}
              underline="hover"
              sx={{ color: 'var(--primary-main, #1976D2)' }}
            >
              {row.registryName ?? '-'}
            </Link>
          }
          secondary={row.registryId ?? '-'}
        />
      </TableCell>

      <TableCell>
        {getRegistryTypeLabel(row.registryEncryptedCredentials?.registryType)}
      </TableCell>

      <TableCell
        sx={{
          width: 400,
          maxWidth: 400,
          boxSizing: 'border-box',
          padding: '16px',
          whiteSpace: 'normal',
          overflowWrap: 'anywhere',
          wordBreak: 'break-all',
        }}
      >
        {row.registryUrl ?? '-'}
      </TableCell>

      <TableCell>
        {row?.createdAt ? formatLocalTime(row.createdAt) : '-'}
      </TableCell>

      <TableCell>
        <PageTableActionsCell
          actions={[
            {
              key: 'edit',
              label: 'Edit',
              icon: 'EditOutlined',
              disabled: !hasPermission,
              onClick: () => onEdit(row.registryId),
            },
            {
              key: 'delete',
              label: 'Delete',
              icon: 'DeleteOutlined',
              disabled: !hasPermission,
              onClick: () => onDelete(row),
            },
          ]}
        />
      </TableCell>
    </PageTableRow>
  );
}
