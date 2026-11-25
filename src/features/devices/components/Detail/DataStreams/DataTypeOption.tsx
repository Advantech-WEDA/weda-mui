import type { DataStreamDataType } from '@features/data-streams';
import { Box, Stack, Typography } from '@mui/material';
import { SvgIcon } from '@shared/ui';
import type { ReactNode } from 'react';

import { DATA_TYPE_CONFIG } from '@/features/devices/components/Detail/DataStreams/dataStreamDisplay';

interface IProps {
  type: string;

  label?: ReactNode;

  subLabel?: ReactNode;
}

export default function DataTypeOption({ type, label, subLabel }: IProps) {
  const config = DATA_TYPE_CONFIG[type as DataStreamDataType];

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
      {config?.icon ? (
        <SvgIcon name={config.icon} size={24} />
      ) : (
        <Box
          component="span"
          sx={{
            width: 20,
            flexShrink: 0,
            fontSize: 8,
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          {config?.badge ?? '?'}
        </Box>
      )}
      <Stack sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {label ?? config?.label ?? type}
        </Typography>

        {subLabel && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {subLabel}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
