import { formatFileSize } from '@features/ai-models';
import {
  Checkbox,
  MenuItem,
  Select,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { SelectElement } from '@shared/ui';

import type {
  AiModelDeployTableRow,
  DeviceContainerNamesState,
} from '@/features/devices/domain/types';

interface IProps {
  row: AiModelDeployTableRow;
  selected: boolean;
  hasPermission: boolean;
  isRestartContainer: boolean;
  isChecksumVerify: boolean;
  containerName: string;
  deviceContainers: DeviceContainerNamesState | null;
  onSelect: (modelId: string) => void;
  onEditionChange: (modelId: string, edition: string) => void;
  onContainerChange: (modelId: string, containerName: string) => void;
}

const getContainerSelectProps = (
  deviceContainers: DeviceContainerNamesState | null
) => {
  if (deviceContainers?.status === 'loading') {
    return { placeholder: 'Checking...', loading: true, options: [] };
  }

  if (deviceContainers?.status === 'error') {
    return {
      placeholder: '- Select -',
      options: [],
      error: true,
      helperText: 'Couldn’t load this device’s containers.',
    };
  }

  const names =
    deviceContainers?.status === 'loaded' ? deviceContainers.names : [];

  return {
    placeholder: '- Select -',
    options: names.map((name) => ({ label: name, value: name })),
    helperText:
      deviceContainers?.status === 'loaded' && names.length === 0
        ? 'No running containers.'
        : undefined,
  };
};

const formatDeviceState = (state: string) => {
  const words = state.replace(/_/g, ' ').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const cellSx = { padding: 'var(--padding--1) var(--padding--2)' };

export default function TableContent({
  row,
  selected,
  hasPermission,
  isRestartContainer,
  isChecksumVerify,
  containerName,
  deviceContainers,
  onSelect,
  onEditionChange,
  onContainerChange,
}: IProps) {
  const isRowSelectable = row.editions.some((edition) => !edition.disabled);
  const selectedEditionOption = row.editions.find(
    (edition) => edition.edition === row.selectedEdition
  );
  const checksum = selectedEditionOption?.expectedChecksum ?? '';

  const containerSelectProps = isRestartContainer
    ? getContainerSelectProps(deviceContainers)
    : { placeholder: '- Select -', options: [] };

  return (
    <TableRow hover selected={selected}>
      <TableCell>
        <Checkbox
          size="small"
          checked={selected}
          disabled={!hasPermission || !isRowSelectable}
          onChange={() => onSelect(row.modelId)}
        />
      </TableCell>

      <TableCell sx={cellSx}>{row.modelName}</TableCell>

      <TableCell sx={cellSx}>
        <Select
          size="small"
          value={row.selectedEdition}
          disabled={!isRowSelectable}
          onChange={(e) => onEditionChange(row.modelId, e.target.value)}
          sx={{
            width: 168,
            height: 40,
            backgroundColor: '#fff',
          }}
        >
          {row.editions.map((option) => (
            <MenuItem
              key={option.edition}
              value={option.edition}
              disabled={option.disabled}
            >
              {option.edition}
              {option.deviceState
                ? ` (${formatDeviceState(option.deviceState)})`
                : ''}
            </MenuItem>
          ))}
        </Select>
      </TableCell>

      <TableCell sx={cellSx}>
        {selectedEditionOption?.fileName ?? '-'}
      </TableCell>

      <TableCell sx={cellSx}>
        {selectedEditionOption?.fileSize != null
          ? formatFileSize(selectedEditionOption.fileSize)
          : '-'}
      </TableCell>

      <TableCell sx={{ ...cellSx, maxWidth: 160 }}>
        {!isChecksumVerify ? (
          '-'
        ) : checksum ? (
          <Tooltip title={checksum}>
            <Typography variant="body2" noWrap>
              {checksum}
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="body2" color="error">
            No checksum
          </Typography>
        )}
      </TableCell>

      <TableCell sx={cellSx}>
        <SelectElement
          required
          {...containerSelectProps}
          width={160}
          minWidth={160}
          value={isRestartContainer ? containerName : ''}
          disabled={!isRestartContainer || !isRowSelectable}
          onChange={(value) => onContainerChange(row.modelId, value)}
        />
      </TableCell>
    </TableRow>
  );
}
