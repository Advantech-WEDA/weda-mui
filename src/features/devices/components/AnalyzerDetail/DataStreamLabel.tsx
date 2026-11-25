import type {
  DataStreamDataType,
  IDataStreamItem,
} from '@features/data-streams';
import { Box, Tooltip } from '@mui/material';
import { PageTableInfoCell, SvgIcon } from '@shared/ui';

import { DATA_TYPE_CONFIG } from '@/features/devices/components/Detail/DataStreams/dataStreamDisplay';

interface IProps {
  dataStreamId: string;

  dataStream?: IDataStreamItem;
}

export default function DataStreamLabel({ dataStreamId, dataStream }: IProps) {
  const dataType = dataStream
    ? DATA_TYPE_CONFIG[dataStream.dataType as DataStreamDataType]
    : undefined;
  const primary =
    dataStream?.displayName || dataStream?.dataStreamName || dataStreamId;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Tooltip title={dataType?.label ?? dataStream?.dataType ?? '-'}>
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
        primary={primary}
        secondary={dataStream?.dataStreamName ?? undefined}
      />
    </Box>
  );
}
