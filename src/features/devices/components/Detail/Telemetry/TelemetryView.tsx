import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from '@shared/lib/dayjs';

import {
  type CollectionFilter,
  type IDeviceTelemetryTableItem,
  TELEMETRY_REFRESH_INTERVAL,
} from '../../../domain/types';
import TableSection from './TableSection';

export interface TelemetryViewProps {
  loading: boolean;
  hasPermission: boolean;
  lastUpdated: Date;
  pagedRows: IDeviceTelemetryTableItem[];
  search: string;
  collectionFilter: CollectionFilter;
  currentPage: number;
  rowsPerPage: number;
  editingKey: string | null;
  filteredTotalCount: number;
  hasFilter: boolean;
  setPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
  handleSearchChange: (value: string) => void;
  handleCollectionFilterChange: (value: CollectionFilter) => void;
  handleClearFilters: () => void;
  handleRefresh: () => void;
  handleStartEdit: (row: IDeviceTelemetryTableItem) => void;
  handleCancelEdit: () => void;
  handleSaveEdit: (row: IDeviceTelemetryTableItem) => void | Promise<void>;
  handleFrequencyChange: (value: number) => void;
  handleCollectionChange: (checked: boolean) => void;
}

export default function TelemetryView({
  loading,
  hasPermission,
  lastUpdated,
  pagedRows,
  search,
  collectionFilter,
  currentPage,
  rowsPerPage,
  editingKey,
  filteredTotalCount,
  hasFilter,
  setPage,
  setRowsPerPage,
  handleSearchChange,
  handleCollectionFilterChange,
  handleClearFilters,
  handleRefresh,
  handleStartEdit,
  handleCancelEdit,
  handleSaveEdit,
  handleFrequencyChange,
  handleCollectionChange,
}: TelemetryViewProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
      component="article"
    >
      <Paper elevation={0} className="page-paper">
        <Box sx={{ p: 2, width: '100%' }}>
          <Typography
            variant="h5"
            sx={{ color: 'var(--text-primary, rgba(0, 0, 0, 0.87))' }}
          >
            Telemetry
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: 'var(--text-secondary, rgba(0, 0, 0, 0.60))' }}
          >
            Last updated: {dayjs(lastUpdated).format('YYYY/MM/DD HH:mm:ss')}
            {' | '}
            Auto-refresh: {TELEMETRY_REFRESH_INTERVAL / 1000}s
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <>
            <Stack
              justifyContent="space-between"
              alignItems="center"
              direction="row"
              spacing={1}
              sx={{
                flexWrap: 'nowrap',
                overflow: 'hidden',
                minWidth: 0,
                flex: 1,
                m: 2,
                width: 'calc(100% - 32px)',
              }}
            >
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  sx={{ width: 240 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Select
                  size="small"
                  displayEmpty
                  value={collectionFilter}
                  onChange={(e) =>
                    handleCollectionFilterChange(
                      e.target.value as CollectionFilter
                    )
                  }
                  sx={{ width: 160 }}
                >
                  <MenuItem value="all">Collection status</MenuItem>
                  <MenuItem value="enabled">Enabled</MenuItem>
                  <MenuItem value="disabled">Disabled</MenuItem>
                </Select>

                <Button
                  variant="outlined"
                  className="search-empty-btn"
                  onClick={handleClearFilters}
                  sx={{ textTransform: 'none' }}
                >
                  Clear filters
                </Button>
              </Stack>

              <IconButton size="small" onClick={handleRefresh}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Stack>

            <TableSection
              rows={pagedRows}
              editingKey={editingKey}
              hasPermission={hasPermission}
              loading={false}
              totalCount={filteredTotalCount}
              page={currentPage}
              rowsPerPage={rowsPerPage}
              hasFilter={hasFilter}
              onClearAll={handleClearFilters}
              onPageChange={(_, newPage) => {
                setPage(newPage);
              }}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
              onFrequencyChange={handleFrequencyChange}
              onCollectionChange={handleCollectionChange}
            />
          </>
        )}
      </Paper>
    </Box>
  );
}
