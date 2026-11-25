import type { IDataStreamItem } from '@features/data-streams';
import { MenuItem, TextField } from '@mui/material';

import DataTypeOption from '@/features/devices/components/Detail/DataStreams/DataTypeOption';

interface IProps {
  value: string;
  dataStream?: IDataStreamItem;
  error?: string;
  disabled?: boolean;

  onOpen: () => void;
}

const streamName = (s: IDataStreamItem) =>
  s.displayName || s.dataStreamName || s.dataStreamId;

export default function DataStreamPickerField({
  value,
  dataStream,
  error,
  disabled = false,
  onOpen,
}: IProps) {
  return (
    <TextField
      select
      fullWidth
      size="small"
      disabled={disabled}
      value={value}
      error={Boolean(error)}
      helperText={error}
      slotProps={{
        select: {
          open: false,
          displayEmpty: true,
          onOpen: () => onOpen(),
          renderValue: () =>
            value ? (
              <DataTypeOption
                type={dataStream?.dataType ?? ''}
                label={dataStream ? streamName(dataStream) : value}
              />
            ) : (
              <span style={{ color: 'var(--text-secondary)' }}>
                DataStream name
              </span>
            ),
        },
      }}
    >
      <MenuItem value={value} sx={{ display: 'none' }} />
    </TextField>
  );
}
