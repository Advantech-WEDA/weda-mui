import { Chip, Link, Stack, TableCell, Tooltip } from '@mui/material';
import { getAppBasePath } from '@shared/lib/appRoute';
import { formatLocalTime } from '@shared/lib/dayjs';
import {
  PageTableActionsCell,
  PageTableInfoCell,
  PageTableRow,
} from '@shared/ui';
import { Link as RouterLink, useParams } from 'react-router-dom';

import { type IMqttBrokerListItem } from '@/features/mqtt-brokers/api/mqttBrokers.api.types';

interface IProps {
  row: IMqttBrokerListItem;
  hasPermission: boolean;
  onDelete: (row: IMqttBrokerListItem) => void;
  onEdit: (mqttConfigId: string) => void;
}

export default function TableContent({
  row,
  hasPermission,
  onDelete,
  onEdit,
}: IProps) {
  const bridges = row.dataStreamBridges ?? [];
  const { tenant } = useParams<'tenant'>();

  if (!tenant) {
    throw new Error('TableContent must be rendered under a /:tenant route');
  }

  return (
    <PageTableRow hover>
      <TableCell>
        <PageTableInfoCell
          primary={
            <Link
              component={RouterLink}
              to={`${getAppBasePath(tenant)}/mqtt-brokers/${row.mqttConfigId}`}
              underline="hover"
              sx={{
                color: 'var(--primary-main, #1976D2)',

                whiteSpace: 'normal',
                overflowWrap: 'anywhere',
              }}
            >
              {row.name ?? '-'}
            </Link>
          }
          secondary={row.mqttConfigId}
        />
      </TableCell>

      <TableCell>{row.brokerEndpoint ?? '-'}</TableCell>

      <TableCell>{row.mqttProtocolVersion || '-'}</TableCell>

      <TableCell>
        {bridges.length === 0 ? (
          '-'
        ) : (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Chip label={bridges[0].name ?? '-'} size="small" />
            {bridges.length > 1 && (
              <Tooltip
                title={bridges
                  .slice(1)
                  .map((bridge) => bridge.name ?? '-')
                  .join(', ')}
              >
                <Chip label={`+${bridges.length - 1}`} size="small" />
              </Tooltip>
            )}
          </Stack>
        )}
      </TableCell>

      <TableCell>
        {row.creationTime ? formatLocalTime(row.creationTime) : '-'}
      </TableCell>

      <TableCell>
        <PageTableActionsCell
          actions={[
            {
              key: 'edit',
              label: 'Edit',
              icon: 'EditOutlined',
              disabled: !hasPermission,
              onClick: () => onEdit(row.mqttConfigId),
            },
            {
              key: 'delete',
              label: row.isInUse
                ? 'Used by a bridge — repoint or delete it first'
                : 'Delete',
              icon: 'DeleteOutlined',
              disabled: row.isInUse || !hasPermission,
              onClick: () => onDelete(row),
            },
          ]}
        />
      </TableCell>
    </PageTableRow>
  );
}
