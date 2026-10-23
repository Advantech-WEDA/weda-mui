import { Link, TableCell } from '@mui/material';
import { getAppBasePath } from '@shared/lib/appRoute';
import { formatLocalTime } from '@shared/lib/dayjs';
import {
  AppChip,
  type PageTableAction,
  PageTableActionsCell,
  PageTableInfoCell,
  PageTableRow,
} from '@shared/ui';
import { Link as RouterLink, useParams } from 'react-router-dom';

import type { IDeviceItem } from '../api/devices.api.types';
import {
  ACTIVATION_ACTION_LABEL_MAP,
  canDeleteDevice,
  getActivationAction,
} from '../domain/devicePolicy';
import { ACTIVATION_ACTION_ICON_MAP } from './activationActionDisplay';
import {
  connectivityChipProps,
  deviceStatusChipProps,
} from './deviceStatusDisplay';

interface IProps {
  row: IDeviceItem;
  hasPermission: boolean;
  hasDeletePermission: boolean;
  onDelete: (row: IDeviceItem) => void;
  onActivationStatus: (row: IDeviceItem) => void;
  onEdit: (deviceId: string) => void;
}

export default function TableContent({
  row,
  hasPermission,
  hasDeletePermission,
  onDelete,
  onActivationStatus,
  onEdit,
}: IProps) {
  const canDelete = hasDeletePermission && canDeleteDevice(row.status);
  const activationAction = getActivationAction(row.status);
  const { tenant } = useParams<'tenant'>();

  if (!tenant) {
    throw new Error('TableContent must be rendered under a /:tenant route');
  }

  const actions = (): PageTableAction[] => {
    const actions: PageTableAction[] = [
      {
        key: 'edit',
        label: 'Edit',
        icon: 'EditOutlined',
        disabled: !hasPermission,
        onClick: () => onEdit(row.deviceId),
      },
    ];

    actions.push({
      key: 'status',
      label: ACTIVATION_ACTION_LABEL_MAP[activationAction],
      icon: ACTIVATION_ACTION_ICON_MAP[activationAction],
      disabled: !hasPermission,
      onClick: () => onActivationStatus(row),
    });

    actions.push({
      key: 'delete',
      label: 'Delete',
      icon: 'DeleteOutlined',
      disabled: !canDelete,
      onClick: () => onDelete(row),
    });

    return actions;
  };

  return (
    <PageTableRow hover>
      <TableCell>
        <PageTableInfoCell
          primary={
            <Link
              component={RouterLink}
              to={`${getAppBasePath(tenant)}/devices/${row.deviceId}/overview`}
              state={{ device: row }}
              underline="hover"
              sx={{ color: 'var(--primary-main)' }}
            >
              {row.deviceName ?? '-'}
            </Link>
          }
          secondary={row.deviceId ?? '-'}
        />
      </TableCell>

      <TableCell>{row.hwModel ?? '-'}</TableCell>

      <TableCell>
        <AppChip {...deviceStatusChipProps(row.status)} />
      </TableCell>

      <TableCell>
        <AppChip
          {...connectivityChipProps(
            row.lastSeen ? 'Connected' : 'Disconnected'
          )}
        />
      </TableCell>

      <TableCell>
        {row.lastSeen ? formatLocalTime(row.lastSeen) : '-'}
      </TableCell>

      <TableCell>
        <PageTableActionsCell actions={actions()} />
      </TableCell>
    </PageTableRow>
  );
}
