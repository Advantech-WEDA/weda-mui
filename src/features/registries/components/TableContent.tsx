import { Link, TableCell } from '@mui/material';
import { formatLocalTime } from '@shared/lib/dayjs';
import {
  PageTableActionsCell,
  PageTableEllipsisCell,
  PageTableInfoCell,
  PageTableRow,
} from '@shared/ui';
import { Link as RouterLink } from 'react-router-dom';

import { type IRegistryItem } from '../api/registries.api.types';

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
              color="inherit"
            >
              {row.registryName ?? '-'}
            </Link>
          }
          secondary={row.registryId ?? '-'}
        />
      </TableCell>

      <TableCell>
        {row.registryEncryptedCredentials.registryType ?? '-'}
      </TableCell>

      <PageTableEllipsisCell>{row.registryUrl ?? '-'}</PageTableEllipsisCell>

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
