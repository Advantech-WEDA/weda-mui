import { Link, Stack, Switch, TableCell } from '@mui/material';
import { getAppBasePath } from '@shared/lib/appRoute';
import { formatLocalTime } from '@shared/lib/dayjs';
import {
  AppChip,
  PageTableActionsCell,
  PageTableInfoCell,
  PageTableRow,
} from '@shared/ui';
import { Link as RouterLink, useParams } from 'react-router-dom';

import type { IDataStreamBridgeListItem } from '../api/dataStreamBridges.api.types';
import { toBridgeDisplayStatus } from '../domain/types';
import { bridgeStatusChipProps } from './bridgeStatusDisplay';

interface IProps {
  row: IDataStreamBridgeListItem;
  hasPermission: boolean;

  toggling: boolean;
  onToggleEnabled: (row: IDataStreamBridgeListItem) => void;
  onDelete: (row: IDataStreamBridgeListItem) => void;
  onEdit: (bridgeId: string) => void;
}

export default function TableContent({
  row,
  hasPermission,
  toggling,
  onToggleEnabled,
  onDelete,
  onEdit,
}: IProps) {
  const { tenant } = useParams<'tenant'>();

  if (!tenant) {
    throw new Error('TableContent must be rendered under a /:tenant route');
  }

  const status = toBridgeDisplayStatus(row);

  return (
    <PageTableRow
      hover
      sx={{ '& > .MuiTableCell-root': { padding: '8px 16px' } }}
    >
      <TableCell>
        <PageTableInfoCell
          primary={
            <Link
              component={RouterLink}
              to={`${getAppBasePath(tenant)}/data-stream-bridges/${row.bridgeId}`}
              underline="hover"
              sx={{ color: 'var(--primary-main, #1976D2)' }}
            >
              {row.name ?? '-'}
            </Link>
          }
          secondary={row.bridgeId}
        />
      </TableCell>

      <TableCell>{row.outputTopic ?? '-'}</TableCell>

      <TableCell>{row.qos ?? '-'}</TableCell>

      <TableCell>{row.dataStreamCount ?? '-'}</TableCell>

      <TableCell>
        {status ? <AppChip {...bridgeStatusChipProps(status)} /> : '-'}
      </TableCell>

      <TableCell>
        <Stack direction="row" alignItems="center">
          <Switch
            size="small"
            checked={row.isEnabled}
            disabled={!hasPermission || toggling}
            onChange={() => onToggleEnabled(row)}
          />
          {row.isEnabled ? 'Enabled' : 'Disabled'}
        </Stack>
      </TableCell>

      <TableCell>
        {row.creationTime ? formatLocalTime(row.creationTime) : '-'}
      </TableCell>

      <TableCell>
        <PageTableActionsCell
          actions={[
            {
              key: 'edit',
              label: row.isEnabled
                ? 'Disable the bridge before editing'
                : 'Edit',
              icon: 'EditOutlined',
              disabled: row.isEnabled || !hasPermission,
              onClick: () => onEdit(row.bridgeId),
            },
            {
              key: 'delete',
              label: row.isEnabled
                ? 'Disable the bridge before deleting'
                : 'Delete',
              icon: 'DeleteOutlined',
              disabled: row.isEnabled || !hasPermission,
              onClick: () => onDelete(row),
            },
          ]}
        />
      </TableCell>
    </PageTableRow>
  );
}
