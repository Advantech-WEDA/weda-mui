import {
  connectivityChipProps,
  deviceStatusChipProps,
} from '@features/devices';
import {
  Box,
  Checkbox,
  Link,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { getAppBasePath } from '@shared/lib/appRoute';
import { formatLocalTime } from '@shared/lib/dayjs';
import { AppChip, SelectElement } from '@shared/ui';
import { Link as RouterLink, useParams } from 'react-router-dom';

import type { DeviceContainersState } from '@/features/ai-models/domain/deploySetup';

import type { DeployDeviceRow } from '../../api/aiModels.api.types';

interface IProps {
  row: DeployDeviceRow;
  selected: boolean;
  disabledDeviceIds: string[];
  isRestartContainer: boolean;
  containerName: string;
  containersState?: DeviceContainersState;
  onContainerChange: (deviceId: string, containerName: string) => void;
  onSelect: (deviceId: string) => void;
}

const getContainerSelectProps = (
  containersState: DeviceContainersState | undefined
) => {
  if (containersState?.status === 'loading') {
    return { placeholder: 'Checking...', loading: true, options: [] };
  }

  if (containersState?.status === 'error') {
    return {
      placeholder: '- Select -',
      options: [],
      error: true,
      helperText: 'Couldn’t load this device’s containers.',
    };
  }

  const names =
    containersState?.status === 'loaded' ? containersState.names : [];

  return {
    placeholder: '- Select -',
    options: names.map((name) => ({ label: name, value: name })),
    helperText:
      containersState?.status === 'loaded' && names.length === 0
        ? 'No running containers.'
        : undefined,
  };
};

export default function TableContent({
  row,
  selected,
  disabledDeviceIds,
  isRestartContainer,
  containerName,
  containersState,
  onContainerChange,
  onSelect,
}: IProps) {
  const { tenant } = useParams<'tenant'>();

  if (!tenant) {
    throw new Error('TableContent must be rendered under a /:tenant route');
  }

  const disabled = disabledDeviceIds.includes(row.deviceId);
  const containerSelectProps = isRestartContainer
    ? getContainerSelectProps(containersState)
    : { placeholder: '- Select -', options: [] };

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
        {row.deployedEditions?.length
          ? row.deployedEditions.map((name, index, list) => (
              <Box key={name}>
                {name}
                {index < list.length - 1 ? ',' : ''}
              </Box>
            ))
          : '-'}
      </TableCell>

      <TableCell sx={{ padding: 'var(--padding--1) var(--padding--2)' }}>
        <AppChip {...deviceStatusChipProps(row.status)} />
        {'  '}
        {row.status === 'Activated' && row.deploymentStatus === 'InProgress'
          ? '(Deploying)'
          : row.status === 'Activated' && row.deploymentStatus === 'Completed'
            ? '(Deployed)'
            : ''}
      </TableCell>

      <TableCell sx={{ padding: 'var(--padding--1) var(--padding--2)' }}>
        <AppChip
          {...connectivityChipProps(
            row.lastSeen ? 'Connected' : 'Disconnected'
          )}
        />
      </TableCell>

      <TableCell sx={{ padding: 'var(--padding--1) var(--padding--2)' }}>
        <SelectElement
          required
          {...containerSelectProps}
          width={180}
          minWidth={180}
          value={isRestartContainer ? containerName : ''}
          disabled={!isRestartContainer || disabled}
          onChange={(value) => onContainerChange(row.deviceId, value)}
        />
      </TableCell>

      <TableCell>
        {row.lastSeen ? formatLocalTime(row.lastSeen) : '-'}
      </TableCell>
    </TableRow>
  );
}
