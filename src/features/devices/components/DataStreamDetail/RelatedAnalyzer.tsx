import type { IDataStreamItem } from '@features/data-streams';
import { Box, Paper, Typography } from '@mui/material';
import { PageTableLoadingIndicator } from '@shared/ui';

import AnalyzerDetailBody from '@/features/devices/components/AnalyzerDetail/AnalyzerDetailBody';
import { useRelatedAnalyzer } from '@/features/devices/hooks/useRelatedAnalyzer';

interface IProps {
  dataStream: IDataStreamItem | null;

  loading: boolean;
}

export default function RelatedAnalyzer({ dataStream, loading }: IProps) {
  const {
    analyzer,
    loading: analyzerLoading,
    dataStreamsById,
  } = useRelatedAnalyzer(dataStream);

  if (loading || analyzerLoading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <PageTableLoadingIndicator />
      </Box>
    );
  }

  if (!analyzer) {
    return (
      <Box component="article">
        <Paper elevation={0} className="page-paper">
          <Box className="page-table-empty-state">
            <Typography variant="h5" gutterBottom>
              No related analyzers yet.
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <AnalyzerDetailBody analyzer={analyzer} dataStreamsById={dataStreamsById} />
  );
}
