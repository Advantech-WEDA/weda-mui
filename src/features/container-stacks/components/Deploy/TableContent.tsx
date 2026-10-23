import {
  connectivityChipProps,
  deviceStatusChipProps,
} from '@features/devices';
import {
  Box,
  Checkbox,
  CircularProgress,
  Link,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { getAppBasePath } from '@shared/lib/appRoute';
import { formatLocalTime } from '@shared/lib/dayjs';
import { AppChip } from '@shared/ui';
import { Link as RouterLink, useParams } from 'react-router-dom';

import type { DeployDeviceRow } from '../../api/stacks.api.types';

interface IProps {
  row: DeployDeviceRow;
  selected: boolean;
  disabledDeviceIds: string[];
  deploymentsLoading?: boolean;
  onSelect: (deviceId: string) => void;
}

export default function TableContent({
  row,
  selected,
  disabledDeviceIds,
  deploymentsLoading = false,
  onSelect,
}: IProps) {
  const { tenant } = useParams<'tenant'>();

  if (!tenant) {
    throw new Error('TableContent must be rendered under a /:tenant route');
  }

  const disabled = disabledDeviceIds.includes(row.deviceId);
  const isDeploymentStatusPending =
    deploymentsLoading && row.status !== 'Deactivated';

  return (
    <TableRow
      hover={!disabled}
      selected={selected}
      sx={{
        ...(disabled && {
          bgcolor: 'action.disabledBackground',
          opacity: 0.5,
          cursor: 'not-allowed',

          '&:hover': {
            bgcolor: 'action.disabledBackground',
          },

          '& .MuiTableCell-root': {
            color: 'text.disabled',
          },

          '& .MuiLink-root': {
            color: 'text.disabled',
            pointerEvents: 'none',
            textDecoration: 'none',
          },
        }),
      }}
    >
      <TableCell>
        {isDeploymentStatusPending ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
            }}
          >
            <CircularProgress size={16} />
          </Box>
        ) : (
          <Checkbox
            size="small"
            checked={selected}
            disabled={disabled}
            onChange={() => {
              if (!disabled) {
                onSelect(row.deviceId);
              }
            }}
          />
        )}
      </TableCell>

      <TableCell sx={{ padding: 'var(--padding--1) var(--padding--2)' }}>
        <Box>
          <Typography variant="body2" className="page-table__info-name">
            <Link
              component={RouterLink}
              to={`${getAppBasePath(tenant)}/devices/${row.deviceId}/overview`}
              state={{ device: row }}
              underline="hover"
              color="inherit"
            >
              {row.deviceName ?? '-'}
            </Link>
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            className="page-table__info-id"
          >
            {row.deviceId ?? '-'}
          </Typography>
        </Box>
      </TableCell>

      <TableCell sx={{ padding: 'var(--padding--1) var(--padding--2)' }}>
        {row.hwModel ?? '-'}
      </TableCell>

      <TableCell sx={{ padding: 'var(--padding--1) var(--padding--2)' }}>
        <AppChip {...deviceStatusChipProps(row.status)} />
        {'  '}
        {row.status === 'Activated' && row.deploymentStatus === 'deploying'
          ? '(Deploying)'
          : ''}
      </TableCell>

      <TableCell sx={{ padding: 'var(--padding--1) var(--padding--2)' }}>
        <AppChip
          {...connectivityChipProps(
            row.lastSeen ? 'Connected' : 'Disconnected'
          )}
        />
      </TableCell>

      <TableCell>
        {row.lastSeen ? formatLocalTime(row.lastSeen) : '-'}
      </TableCell>
    </TableRow>
  );
}
