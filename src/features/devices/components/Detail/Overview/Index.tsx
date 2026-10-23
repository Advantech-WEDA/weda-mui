import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';

import type { IDataStreamsLatestResponse } from '../../../api/devices.api.types';

type DataCardProps = {
  title: string;
  value: string;
  used?: string;
  total?: string;
};

const EXCLUDE_KEYS = [
  'memory_total',
  'memory_available',
  'memory_used',
  'memory_cached',
  'disk_root_total',
  'disk_root_available',
  'disk_root_used',
  'disk_root_usage_percent',
];

const formatBytesToGB = (bytes: number) => {
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)}`;
};

const formatTitle = (key: string) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatValue = (key: string, value: string | number | boolean) => {
  if (typeof value === 'boolean') return value ? 'True' : 'False';

  if (typeof value === 'number') {
    if (key.includes('usage') || key.includes('percent')) {
      return `${value}%`;
    }

    return value.toString();
  }

  return value || '-';
};

const buildLatestCards = (
  dataObjects?: Record<string, string | number | boolean>
): DataCardProps[] => {
  if (!dataObjects || Object.keys(dataObjects).length === 0) return [];

  const cards: DataCardProps[] = [];

  const memoryTotal = Number(dataObjects.memory_total || 0);
  const memoryUsed = Number(dataObjects.memory_used || 0);
  const memoryCached = Number(dataObjects.memory_cached || 0);

  if (memoryTotal > 0) {
    const memoryPercent = ((memoryUsed / memoryTotal) * 100).toFixed(2);

    cards.push({
      title: 'Memory',
      value: `${memoryPercent}%`,
      used: `${formatBytesToGB(memoryUsed + memoryCached)}`,
      total: `${formatBytesToGB(memoryTotal)} GB`,
    });
  }

  const diskTotal = Number(dataObjects.disk_root_total || 0);
  const diskUsed = Number(dataObjects.disk_root_used || 0);
  const diskUsagePercent = Number(dataObjects.disk_root_usage_percent || 0);

  if (diskTotal > 0) {
    cards.push({
      title: 'Disk',
      value: diskUsagePercent
        ? `${diskUsagePercent}%`
        : `${((diskUsed / diskTotal) * 100).toFixed(2)}%`,
      used: `${formatBytesToGB(diskUsed)} `,
      total: `${formatBytesToGB(diskTotal)} GB`,
    });
  }

  Object.entries(dataObjects).forEach(([key, rawValue]) => {
    if (EXCLUDE_KEYS.includes(key)) return;

    const isCpuMetric = key.startsWith('cpu_');

    if (!isCpuMetric) return;

    cards.push({
      title: formatTitle(key),
      value: formatValue(key, rawValue),
    });
  });

  return cards;
};

function DataCard({ title, value, used, total }: DataCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '4px',
        height: '100%',
        border:
          '1px solid var(--_components-paper-outlineBorder, rgba(0, 0, 0, 0.12))',
        background: 'var(--_components-paper-elevation-0, #FFF)',
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Typography
          variant="subtitle2"
          sx={{
            height: 38,
            px: 2,
            py: 1,
            display: 'inline-block',
            color: 'var(--text-primary, rgba(0, 0, 0, 0.87))',
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="h4"
          sx={{
            color: 'var(--text-primary, rgba(0, 0, 0, 0.87))',
            px: 2,
            mt: 0.5,
          }}
        >
          {value}
        </Typography>

        {used && total && (
          <Typography
            variant="body2"
            sx={{
              color: 'var(--text-secondary, rgba(0, 0, 0, 0.60))',
              px: 2,
            }}
          >
            {used} / {total}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function NoData() {
  return (
    <Paper
      variant="outlined"
      sx={{
        m: 2,
        p: 4,
        minHeight: 160,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        border:
          '1px solid var(--_components-paper-outlineBorder, rgba(0, 0, 0, 0.12))',
        background: 'var(--_components-paper-elevation-0, #FFF)',
      }}
      className="page-table-empty-state"
    >
      <Typography variant="h5" color="text.secondary">
        No overview data available.
      </Typography>
    </Paper>
  );
}

interface IProps {
  deviceLatestData: IDataStreamsLatestResponse | null;
  loading: boolean;
}

export default function Overview({ deviceLatestData, loading }: IProps) {
  const latestDatas = useMemo(() => {
    const dataObjects = (deviceLatestData?.dataStreams ?? []).reduce<
      Record<string, string | number | boolean>
    >((acc, stream) => {
      acc[stream.dataStreamName] = stream.dataObject?.value as
        | string
        | number
        | boolean;
      return acc;
    }, {});

    return buildLatestCards(dataObjects);
  }, [deviceLatestData]);

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 3,
        alignItems: 'flex-start',
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h5"
            sx={{ color: 'var(--text-primary, rgba(0, 0, 0, 0.87))' }}
          >
            Overview
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={28} />
          </Box>
        ) : latestDatas.length > 0 ? (
          <Grid container spacing={2} sx={{ p: 2 }}>
            {latestDatas.map((item) => (
              <Grid
                key={item.title}
                size={{ xs: 12, sm: 6, md: 3 }}
                sx={{ height: 120 }}
              >
                <DataCard {...item} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <NoData />
        )}
      </Box>
    </Box>
  );
}
