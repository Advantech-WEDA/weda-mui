import { getAnalyzerActions, type IAnalyzerItem } from '@features/analyzers';
import {
  Box,
  IconButton,
  Stack,
  Switch,
  TableCell,
  TableRow,
  Tooltip,
} from '@mui/material';
import { getAppBasePath } from '@shared/lib/appRoute';
import { formatLocalTime } from '@shared/lib/dayjs';
import { AppChip, PageTableInfoCell, SvgIcon } from '@shared/ui';
import { Link as RouterLink, useParams } from 'react-router-dom';

import { analyzerTypeChipProps } from '@/features/devices/components/Detail/Analyzers/analyzerDisplay';

interface IProps {
  row: IAnalyzerItem;
  hasPermission: boolean;

  dataStreamNames: Record<string, string>;

  toggling?: boolean;

  onToggleEnabled?: (row: IAnalyzerItem) => void;
  onEdit: (row: IAnalyzerItem) => void;
  onDelete: (row: IAnalyzerItem) => void;
}

const actionIconColor = (enabled: boolean) =>
  enabled ? 'var(--action-active)' : 'var(--action-disabled)';

const ellipsis = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

export default function TableContent({
  row,
  hasPermission,
  dataStreamNames,
  toggling = false,
  onToggleEnabled,
  onEdit,
  onDelete,
}: IProps) {
  const { tenant, deviceId } = useParams<'tenant' | 'deviceId'>();

  if (!tenant) {
    throw new Error('TableContent must be rendered under a /:tenant route');
  }

  const streamName = (id: string) => dataStreamNames[id] ?? id;

  const describeStreams = (ids: string[]) => ({
    text: ids.length === 1 ? streamName(ids[0]) : String(ids.length),
    tooltip: ids.length ? ids.map(streamName).join(', ') : '-',
  });

  const inputs = describeStreams(
    (row.inputParameters ?? []).map((p) => p.dataStreamId)
  );
  const outputs = describeStreams(
    (row.outputs ?? []).map((o) => o.dataStreamId)
  );

  const modifiedAt = row.updatedAt ?? row.createdAt;

  const actions = getAnalyzerActions(row, hasPermission);
  const editEnabled = actions.edit.enabled;
  const deleteEnabled = actions.delete.enabled;

  return (
    <TableRow hover>
      <TableCell sx={{ px: 2, py: 1 }}>
        <PageTableInfoCell
          primary={
            <Tooltip title={row.description || row.name || ''}>
              <RouterLink
                to={`${getAppBasePath(tenant)}/devices/${deviceId}/analyzers/${row.analyzerId}`}
                style={{
                  color: 'var(--primary-main, #1976D2)',
                  textDecoration: 'underline',
                  display: 'inline-block',
                  maxWidth: '100%',
                  verticalAlign: 'bottom',
                  ...ellipsis,
                }}
              >
                {row.name || '-'}
              </RouterLink>
            </Tooltip>
          }
          secondary={row.analyzerId}
        />
      </TableCell>

      <TableCell sx={{ px: 2, py: 1 }}>
        <AppChip {...analyzerTypeChipProps(row.type)} />
      </TableCell>

      <TableCell sx={{ px: 2, py: 1 }}>
        <Tooltip title={inputs.tooltip}>
          <Box sx={ellipsis}>{inputs.text}</Box>
        </Tooltip>
      </TableCell>

      <TableCell sx={{ px: 2, py: 1 }}>
        <Tooltip title={outputs.tooltip}>
          <Box sx={ellipsis}>{outputs.text}</Box>
        </Tooltip>
      </TableCell>

      <TableCell sx={{ px: 2, py: 1 }}>
        <Stack direction="row" alignItems="center">
          <Switch
            size="small"
            checked={row.isEnabled}
            disabled={!hasPermission || !onToggleEnabled || toggling}
            onChange={() => onToggleEnabled?.(row)}
          />
          {row.isEnabled ? 'Enabled' : 'Disabled'}
        </Stack>
      </TableCell>

      <TableCell sx={{ px: 2, py: 1 }}>
        {modifiedAt ? formatLocalTime(modifiedAt) : '-'}
      </TableCell>

      <TableCell sx={{ px: 2, py: 1 }}>
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
      </TableCell>
    </TableRow>
  );
}
