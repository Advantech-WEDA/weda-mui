import type { IDataStreamItem } from '@features/data-streams';
import { MenuItem, TextField } from '@mui/material';

import DataTypeOption from '@/features/devices/components/Detail/DataStreams/DataTypeOption';

interface IProps {
  value: string;
  options: IDataStreamItem[];
  error?: string;
  disabled?: boolean;
  loading?: boolean;

  excludeId?: string;
  onChange: (dataStreamId: string) => void;
}

const streamName = (s: IDataStreamItem) =>
  s.displayName || s.dataStreamName || s.dataStreamId;

export default function DataStreamSelect({
  value,
  options,
  error,
  disabled = false,
  loading = false,
  excludeId,
  onChange,
}: IProps) {
  const visible = options.filter(
    (s) => !excludeId || s.dataStreamId !== excludeId
  );
  const selected = options.find((s) => s.dataStreamId === value);

  return (
    <TextField
      select
      fullWidth
      size="small"
      className="editor-page__form-wrapper-textfield"
      label={
        <>
          DataStream name <span className="required">*</span>
        </>
      }
      disabled={disabled}
      value={selected ? value : ''}
      error={Boolean(error)}
      helperText={error}
      slotProps={{
        select: {
          renderValue: () =>
            selected ? (
              <DataTypeOption
                type={selected.dataType}
                label={streamName(selected)}
                subLabel={selected.dataStreamName}
              />
            ) : (
              ''
            ),
        },
      }}
      onChange={(e) => onChange(e.target.value)}
    >
      {visible.length === 0 ? (
        <MenuItem disabled value="">
          {loading ? 'Loading...' : 'No DataStreams available'}
        </MenuItem>
      ) : (
        visible.map((s) => (
          <MenuItem key={s.dataStreamId} value={s.dataStreamId}>
            <DataTypeOption
              type={s.dataType}
              label={streamName(s)}
              subLabel={s.dataStreamName}
            />
          </MenuItem>
        ))
      )}
    </TextField>
  );
}
