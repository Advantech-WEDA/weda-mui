import {
  getDataStreamActions,
  type IDataStreamItem,
} from '@features/data-streams';
import { Box, IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import { getAppBasePath } from '@shared/lib/appRoute';
import { formatLocalTime } from '@shared/lib/dayjs';
import { AppChip, PageTableInfoCell, SvgIcon } from '@shared/ui';
import { Link as RouterLink, useParams } from 'react-router-dom';

import {
  DATA_TYPE_CONFIG,
  dataSourceChipProps,
} from '@/features/devices/components/Detail/DataStreams/dataStreamDisplay';

interface IProps {
  row: IDataStreamItem;
  hasPermission: boolean;
  onEdit: (row: IDataStreamItem) => void;
  onDelete: (row: IDataStreamItem) => void;
}

const actionIconColor = (enabled: boolean) =>
  enabled ? 'var(--action-active)' : 'var(--action-disabled)';

export default function TableContent({
  row,
  hasPermission,
  onEdit,
  onDelete,
}: IProps) {
  const { tenant, deviceId } = useParams<'tenant' | 'deviceId'>();

  if (!tenant) {
    throw new Error('TableContent must be rendered under a /:tenant route');
  }

  const name = row.displayName || row.dataStreamName || '-';
  const dataType = DATA_TYPE_CONFIG[row.dataType];

  const showActions = row.managedBy !== 'System';
  const actions = getDataStreamActions(row, hasPermission);
  const editEnabled = actions.edit.enabled;
  const deleteEnabled = actions.delete.enabled;

  return (
    <TableRow hover>
      <TableCell sx={{ px: 2, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={dataType?.label ?? row.dataType ?? '-'}>
            <Box
              sx={{
                flexShrink: 0,
                width: 24,
                height: 24,
                borderRadius: 'var(--borderRadius, 4px)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 8,
                fontWeight: 600,
                color: 'var(--primary-contrastText, #FFF)',
                background: 'var(--_components-avatar-fill, #BDBDBD)',
              }}
            >
              {dataType?.icon ? (
                <SvgIcon
                  name={dataType.icon}
                  size={20}
                  fillOpacity={1}
                  color="var(--primary-contrastText, #FFF)"
                />
              ) : (
                (dataType?.badge ?? '?')
              )}
            </Box>
          </Tooltip>

          <PageTableInfoCell
            primary={
              <Tooltip title={row.description || name}>
                <RouterLink
                  to={`${getAppBasePath(tenant)}/devices/${deviceId}/data-streams/${row.dataStreamId}/Information`}
                  style={{
                    color: 'var(--primary-main, #1976D2)',
                    textDecoration: 'underline',
                    display: 'inline-block',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    verticalAlign: 'bottom',
                  }}
                >
                  {name}
                </RouterLink>
              </Tooltip>
            }
            secondary={row.dataStreamName ?? '-'}
          />
        </Box>
      </TableCell>

      <TableCell sx={{ px: 2, py: 1 }}>
        <AppChip {...dataSourceChipProps(row.dataSource?.type)} />
      </TableCell>

      <TableCell sx={{ px: 2, py: 1 }}>
        {row.creationTime ? formatLocalTime(row.creationTime) : '-'}
      </TableCell>

      <TableCell sx={{ px: 2, py: 1 }}>
        {showActions && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={actions.edit.disabledReason ?? 'Edit'}>
              <span style={{ display: 'inline-flex' }}>
                <IconButton
                  size="small"
                  disabled={!editEnabled}
                  onClick={() => onEdit(row)}
                >
                  <SvgIcon
                    name="EditOutlined"
                    sx={{ color: actionIconColor(editEnabled) }}
                  />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={actions.delete.disabledReason ?? 'Delete'}>
              <span style={{ display: 'inline-flex' }}>
                <IconButton
                  size="small"
                  disabled={!deleteEnabled}
                  onClick={() => onDelete(row)}
                >
                  <SvgIcon
                    name="DeleteOutlined"
                    sx={{ color: actionIconColor(deleteEnabled) }}
                  />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        )}
      </TableCell>
    </TableRow>
  );
}
