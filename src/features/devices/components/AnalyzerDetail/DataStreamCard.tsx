import type { IDataStreamItem } from '@features/data-streams';
import { Paper } from '@mui/material';

import DataStreamLabel from './DataStreamLabel';

interface IProps {
  dataStreamId: string;

  dataStream?: IDataStreamItem;
}

export default function DataStreamCard({ dataStreamId, dataStream }: IProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        m: 2,
        px: 2,
        py: 1,
        borderRadius: 1,
        border: '1px solid var(--divider, rgba(0, 0, 0, 0.12))',
      }}
    >
      <DataStreamLabel dataStreamId={dataStreamId} dataStream={dataStream} />
    </Paper>
  );
}
