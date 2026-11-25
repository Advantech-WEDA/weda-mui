import { Box, IconButton, Tooltip } from '@mui/material';
import { SvgIcon } from '@shared/ui';

import type { DeviceAiModelRow } from '@/features/devices/domain/types';
import { DEVICE_AI_MODEL_ROW_ACTION_MAP } from '@/features/devices/domain/types';

interface IProps {
  row: DeviceAiModelRow;
  hasPermission: boolean;
  onDelete: (row: DeviceAiModelRow) => void;
}

export default function ActionButtons({
  row,
  hasPermission,
  onDelete,
}: IProps) {
  const { delete: canDelete } = DEVICE_AI_MODEL_ROW_ACTION_MAP[row.statusGroup];

  const deleteEnabled = hasPermission && canDelete;

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Tooltip title="Delete">
        <span style={{ display: 'inline-flex' }}>
          <IconButton
            size="small"
            disabled={!deleteEnabled}
            onClick={() => onDelete(row)}
          >
            <SvgIcon
              name="DeleteOutlined"
              sx={{
                color: deleteEnabled
                  ? 'var(--action-active)'
                  : 'var(--action-disabled)',
              }}
            />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
