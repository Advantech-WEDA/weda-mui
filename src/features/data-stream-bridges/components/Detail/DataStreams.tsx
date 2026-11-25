import {
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  Typography,
} from '@mui/material';
import { getAppBasePath } from '@shared/lib/appRoute';
import dayjs from '@shared/lib/dayjs';
import {
  DeleteConfirmDialog,
  PageActionButton,
  PageSearchField,
  PageTable,
  PageTableActionsCell,
  PageTableInfoCell,
  PageTableLoadingIndicator,
  PageTableRow,
  Pagination,
  SvgIcon,
} from '@shared/ui';
import { Link as RouterLink, useParams } from 'react-router-dom';

import type { IDataStreamBridgeDetail } from '../../api/dataStreamBridges.api.types';
import {
  DATA_STREAMS_REFRESH_INTERVAL,
  useBridgeDataStreamsTab,
} from '../../hooks/useBridgeDataStreamsTab';
import { BRIDGE_DATA_STREAM_COLUMNS } from '../dataStreamBridgeTable.columns';

interface IProps {
  bridgeId?: string;
  bridgeData: IDataStreamBridgeDetail | null;
  loading: boolean;
  hasPermission: boolean;
  lastUpdated: Date | null;
  fetchBridge: (options?: {
    signal?: AbortSignal;
    silent?: boolean;
  }) => Promise<boolean>;
}

export default function DataStreams({
  bridgeId,
  bridgeData,
  loading,
  hasPermission,
  lastUpdated,
  fetchBridge,
}: IProps) {
  const { tenant } = useParams<'tenant'>();

  if (!tenant) {
    throw new Error('DataStreams must be rendered under a /:tenant route');
  }

  const {
    searchWord,
    pagedRows,
    totalCount,
    hasFilter,
    hasBindings,
    namesLoading,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    canDeleteBinding,
    deleteTarget,
    deleting,
    handleSearchChange,
    handleClearSearch,
    handleRefresh,

    handleOpenDelete,
    handleCloseDelete,
    handleConfirmDelete,
  } = useBridgeDataStreamsTab({
    bridgeId,
    bridgeData,
    hasPermission,
    fetchBridge,
  });

  const tableLoading = loading || !bridgeData || namesLoading;

  return (
    <Box component="article">
      <Paper elevation={0} className="page-paper">
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" color="var(--text-primary)">
            DataStreams
          </Typography>
          <Typography variant="body2" color="var(--text-secondary)">
            Last updated:{' '}
            {lastUpdated
              ? dayjs(lastUpdated).format('YYYY/MM/DD HH:mm:ss')
              : '-'}
            {' | '}
            Auto-refresh: {DATA_STREAMS_REFRESH_INTERVAL / 1000}s
          </Typography>
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, pb: 2 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <PageSearchField
              value={searchWord}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <PageActionButton variant="outlined" onClick={handleClearSearch}>
              <Typography variant="button" className="page-action-btn--clear">
                Clear filters
              </Typography>
            </PageActionButton>
          </Stack>

          <Button
            startIcon={<SvgIcon name="RefreshFilled" />}
            onClick={handleRefresh}
            disabled={loading}
            className="page-action-btn--refresh"
          />
        </Stack>

        <Box sx={{ px: 2, pb: 2 }}>
          <PageTable
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <TableHead>
              <PageTableRow>
                {BRIDGE_DATA_STREAM_COLUMNS.map((col) => (
                  <TableCell key={col.label} sx={{ width: col.width }}>
                    {col.label}
                  </TableCell>
                ))}
              </PageTableRow>
            </TableHead>

            <TableBody>
              {tableLoading ? (
                <PageTableRow>
                  <TableCell
                    colSpan={BRIDGE_DATA_STREAM_COLUMNS.length}
                    align="center"
                  >
                    <PageTableLoadingIndicator />
                  </TableCell>
                </PageTableRow>
              ) : pagedRows.length === 0 ? (
                <PageTableRow>
                  <TableCell
                    colSpan={BRIDGE_DATA_STREAM_COLUMNS.length}
                    align="center"
                    sx={{ py: 6 }}
                  >
                    {hasFilter && hasBindings ? (
                      <Box className="search-empty">
                        <Typography variant="h5" gutterBottom>
                          No results found.
                        </Typography>
                        <Button
                          variant="outlined"
                          className="search-empty-btn"
                          onClick={handleClearSearch}
                        >
                          Clear all
                        </Button>
                      </Box>
                    ) : (
                      <Typography variant="h5">No DataStream, yet</Typography>
                    )}
                  </TableCell>
                </PageTableRow>
              ) : (
                pagedRows.map((row) => (
                  <PageTableRow key={`${row.index}-${row.dataStreamId}`} hover>
                    <TableCell>
                      <PageTableInfoCell
                        primary={
                          <Link
                            component={RouterLink}
                            to={`${getAppBasePath(tenant)}/devices/${row.deviceId}/overview`}
                            underline="hover"
                            sx={{ color: 'var(--primary-main, #1976D2)' }}
                          >
                            {row.deviceName}
                          </Link>
                        }
                        secondary={row.deviceId}
                      />
                    </TableCell>

                    <TableCell>{row.dataStreamName}</TableCell>

                    <TableCell>{row.targetJsonPath || '-'}</TableCell>

                    <TableCell>
                      <PageTableActionsCell
                        actions={[
                          {
                            key: 'delete',
                            label:
                              hasPermission && !canDeleteBinding
                                ? 'A bridge needs at least one DataStream'
                                : 'Delete',
                            icon: 'DeleteOutlined',
                            disabled: !canDeleteBinding || deleting,
                            onClick: () => handleOpenDelete(row),
                          },
                        ]}
                      />
                    </TableCell>
                  </PageTableRow>
                ))
              )}
            </TableBody>
          </PageTable>

          {!tableLoading && totalCount > 0 && (
            <Pagination
              count={totalCount}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) =>
                setRowsPerPage(parseInt(e.target.value, 10))
              }
            />
          )}
        </Box>
      </Paper>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title="Remove DataStream"
        content={`Remove DataStream "${deleteTarget?.dataStreamName ?? ''}" of device "${deleteTarget?.deviceName ?? ''}" from this bridge?`}
        confirmName={deleteTarget?.dataStreamName ?? ''}
        nameLabel="DataStream"
        inputLabel="Re-enter the DataStream name to confirm removal"
        confirmLabel="Remove"
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
