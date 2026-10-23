import {
  Box,
  IconButton,
  Stack,
  Switch,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { formatLocalTime } from '@shared/lib/dayjs';
import { SvgIcon } from '@shared/ui';

import type { IDeviceTelemetryTableItem } from '../../../domain/types';
import {
  formatTelemetryName,
  MAX_TELEMETRY_FREQUENCY_MS,
  MIN_TELEMETRY_FREQUENCY_MS,
} from '../../../domain/types';

const MIN_FREQUENCY_HELPER_TEXT = `Minimum value is ${MIN_TELEMETRY_FREQUENCY_MS}`;
const MAX_FREQUENCY_HELPER_TEXT = `Maximum value is ${MAX_TELEMETRY_FREQUENCY_MS}`;

const getFrequencyError = (frequency: number): string =>
  frequency < MIN_TELEMETRY_FREQUENCY_MS
    ? MIN_FREQUENCY_HELPER_TEXT
    : frequency > MAX_TELEMETRY_FREQUENCY_MS
      ? MAX_FREQUENCY_HELPER_TEXT
      : '';

interface IProps {
  row: IDeviceTelemetryTableItem;
  editingKey: string | null;
  hasPermission: boolean;
  onStartEdit: (row: IDeviceTelemetryTableItem) => void;
  onCancelEdit: () => void;
  onSaveEdit: (row: IDeviceTelemetryTableItem) => void;
  onFrequencyChange: (value: number) => void;

  onCollectionChange: (checked: boolean) => void;
}

export default function TableContent({
  row,
  editingKey,
  hasPermission,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onFrequencyChange,
  onCollectionChange,
}: IProps) {
  const isEditing = editingKey === row.key;
  const frequencyError = getFrequencyError(row.frequency);

  return (
    <TableRow hover>
      <TableCell>
        <Box>
          <Typography variant="body2" color="text.primary" fontWeight={500}>
            {formatTelemetryName(row.telemetryName)}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {row.telemetryKey}
          </Typography>
        </Box>
      </TableCell>

      <TableCell>{row.value ?? '-'}</TableCell>

      <TableCell>
        {row.lastUpdated ? formatLocalTime(row.lastUpdated) : '-'}
      </TableCell>

      <TableCell>
        {isEditing ? (
          <Switch
            checked={!!row.collectionEnabled}
            onChange={(_, checked) => {
              onCollectionChange(checked);
            }}
          />
        ) : (
          <Switch checked={!!row.collectionEnabled} disabled />
        )}
        {row.collectionEnabled ? 'Enabled' : 'Disabled'}
      </TableCell>

      <TableCell>
        {isEditing ? (
          <TextField
            size="small"
            type="number"
            value={row.frequency}
            onChange={(e) => {
              onFrequencyChange(Number(e.target.value));
            }}
            error={Boolean(frequencyError)}
            helperText={frequencyError}
            slotProps={{
              htmlInput: {
                min: MIN_TELEMETRY_FREQUENCY_MS,
                max: MAX_TELEMETRY_FREQUENCY_MS,
              },
            }}
            sx={{ width: 168 }}
          />
        ) : (
          <Typography variant="body2">{row.frequency}</Typography>
        )}
      </TableCell>

      <TableCell>
        {isEditing ? (
          <Stack direction="row" spacing={1}>
            <Tooltip title={frequencyError || 'Save'}>
              <span style={{ display: 'inline-flex' }}>
                <IconButton
                  size="small"
                  disabled={!hasPermission || Boolean(frequencyError)}
                  onClick={() => onSaveEdit(row)}
                >
                  <SvgIcon
                    name="CheckFilled"
                    sx={{
                      color: 'var(--primary-main)',
                    }}
                  />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Cancel">
              <span style={{ display: 'inline-flex' }}>
                <IconButton
                  size="small"
                  disabled={!hasPermission}
                  onClick={onCancelEdit}
                >
                  <SvgIcon
                    name="CloseFilled"
                    sx={{ color: 'var(--error-main)' }}
                  />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        ) : (
          <Tooltip title="Edit">
            <span style={{ display: 'inline-flex' }}>
              <IconButton
                size="small"
                disabled={!hasPermission}
                onClick={() => onStartEdit(row)}
              >
                <SvgIcon
                  name="EditOutlined"
                  sx={{ color: 'var(--action-active)' }}
                />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
}
