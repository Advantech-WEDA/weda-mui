import type { IDataStreamItem } from '@features/data-streams';
import type { IDeviceItem } from '@features/devices';
import {
  Box,
  Checkbox,
  IconButton,
  InputAdornment,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  PageActionButton,
  PageTable,
  PageTableRow,
  Pagination,
  SelectElement,
  type SelectOption,
  SvgIcon,
} from '@shared/ui';
import { useMemo, useState } from 'react';

import type {
  BindingField,
  BridgeBindingRow,
  DataStreamBridgeFormErrors,
} from '../../domain/types';
import { BRIDGE_EDITOR_DATA_STREAM_COLUMNS } from '../dataStreamBridgeTable.columns';

interface IProps {
  rows: BridgeBindingRow[];
  errors: DataStreamBridgeFormErrors;
  devices: IDeviceItem[];
  devicesLoading: boolean;
  streamsByDevice: Record<string, IDataStreamItem[]>;
  streamsLoadingIds: Set<string>;
  onChange: (rowId: string, field: BindingField, value: string) => void;
  onAdd: () => void;
  onRemove: (rowIds: string[]) => void;
}

const Required = () => (
  <Box component="span" sx={{ color: 'error.main' }}>
    {' *'}
  </Box>
);

const CHECKBOX_COL_WIDTH = 52.5;

const COLUMN_COUNT = BRIDGE_EDITOR_DATA_STREAM_COLUMNS.length + 1;

const ROW_HEIGHT = 56;

const checkboxCellSx = {
  width: CHECKBOX_COL_WIDTH,
  p: 0,
  textAlign: 'center',
  verticalAlign: 'middle',
} as const;

const headCellSx = { py: 0 } as const;

const bodyCellSx = { verticalAlign: 'top', pt: '12px', pb: '11px' } as const;

const streamLabel = (stream: IDataStreamItem) =>
  stream.dataStreamName || stream.displayName || stream.dataStreamId;

export default function DataStreamList({
  rows,
  errors,
  devices,
  devicesLoading,
  streamsByDevice,
  streamsLoadingIds,
  onChange,
  onAdd,
  onRemove,
}: IProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [rawSelectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const deviceOptions = useMemo<SelectOption[]>(
    () =>
      devices.map((device) => ({
        label: device.deviceName || device.deviceId,
        value: device.deviceId,
      })),
    [devices]
  );

  const deviceNameById = useMemo(
    () => new Map(deviceOptions.map((o) => [o.value, o.label])),
    [deviceOptions]
  );

  const lastPage = Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, lastPage);

  const selectedIds = useMemo(() => {
    const existing = new Set(rows.map((row) => row.rowId));
    return new Set([...rawSelectedIds].filter((id) => existing.has(id)));
  }, [rawSelectedIds, rows]);

  const pageRows = rows.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  const isAllSelected =
    pageRows.length > 0 && pageRows.every((row) => selectedIds.has(row.rowId));
  const isIndeterminate =
    !isAllSelected && pageRows.some((row) => selectedIds.has(row.rowId));

  const handleSelectAll = () =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      pageRows.forEach((row) =>
        isAllSelected ? next.delete(row.rowId) : next.add(row.rowId)
      );
      return next;
    });

  const handleSelect = (rowId: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);
      return next;
    });

  const handleAdd = () => {
    onAdd();

    setPage(Math.floor(rows.length / rowsPerPage));
  };

  const handleRemoveSelected = () => {
    onRemove([...selectedIds]);
    setSelectedIds(new Set());
  };

  const getStreamOptions = (row: BridgeBindingRow): SelectOption[] => {
    const options = (streamsByDevice[row.deviceId] ?? []).map((stream) => ({
      label: streamLabel(stream),
      value: stream.dataStreamId,
    }));

    if (
      row.dataStreamId &&
      !options.some((o) => o.value === row.dataStreamId)
    ) {
      options.unshift({ label: row.dataStreamId, value: row.dataStreamId });
    }

    return options;
  };

  const getDeviceOptions = (row: BridgeBindingRow): SelectOption[] =>
    row.deviceId && !deviceNameById.has(row.deviceId)
      ? [{ label: row.deviceId, value: row.deviceId }, ...deviceOptions]
      : deviceOptions;

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        sx={{ p: 2 }}
      >
        <PageActionButton
          variant="contained"
          startIcon={
            <SvgIcon
              name="Add"
              sx={{ color: 'var(--primary-contrastText)' }}
              className="page-action-btn__icon"
            />
          }
          onClick={handleAdd}
        >
          <Typography variant="button" className="page-action-btn--add">
            Add
          </Typography>
        </PageActionButton>

        {selectedIds.size > 0 && (
          <PageActionButton
            variant="outlined"
            color="error"
            onClick={handleRemoveSelected}
          >
            <Typography variant="button">
              Delete selected ({selectedIds.size})
            </Typography>
          </PageActionButton>
        )}
      </Stack>

      {errors.bindings && (
        <Typography variant="body2" color="error" sx={{ mb: 1 }}>
          {errors.bindings}
        </Typography>
      )}

      <PageTable
        sx={{
          tableLayout: 'fixed',
          width: '100%',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <TableHead>
          <PageTableRow sx={{ height: ROW_HEIGHT }}>
            <TableCell sx={checkboxCellSx}>
              <Checkbox
                size="small"
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                disabled={pageRows.length === 0}
                onChange={handleSelectAll}
              />
            </TableCell>
            {BRIDGE_EDITOR_DATA_STREAM_COLUMNS.map((col) => (
              <TableCell
                key={col.label}
                sx={{ ...headCellSx, width: col.width }}
              >
                {col.label}
                {col.required && <Required />}
              </TableCell>
            ))}
          </PageTableRow>
        </TableHead>

        <TableBody>
          {pageRows.length === 0 ? (
            <PageTableRow>
              <TableCell colSpan={COLUMN_COUNT} align="center" sx={{ py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  {rows.length === 0
                    ? 'No data streams yet. Click "Add" to bind one.'
                    : 'No results found.'}
                </Typography>
              </TableCell>
            </PageTableRow>
          ) : (
            pageRows.map((row) => {
              const rowErrors = errors.bindingRows[row.rowId];
              const streamsLoading = streamsLoadingIds.has(row.deviceId);

              return (
                <PageTableRow key={row.rowId} sx={{ height: ROW_HEIGHT }}>
                  <TableCell sx={checkboxCellSx}>
                    <Checkbox
                      size="small"
                      checked={selectedIds.has(row.rowId)}
                      onChange={() => handleSelect(row.rowId)}
                    />
                  </TableCell>

                  <TableCell sx={bodyCellSx}>
                    <SelectElement
                      fullWidth
                      required
                      height={32}
                      placeholder="Device name"
                      value={row.deviceId}
                      loading={devicesLoading}
                      error={!!rowErrors?.deviceId}
                      helperText={rowErrors?.deviceId}
                      options={getDeviceOptions(row)}
                      onChange={(value) =>
                        onChange(row.rowId, 'deviceId', value)
                      }
                    />
                  </TableCell>

                  <TableCell sx={bodyCellSx}>
                    <SelectElement
                      fullWidth
                      required
                      height={32}
                      placeholder={
                        streamsLoading ? 'Loading...' : 'DataStream name'
                      }
                      value={row.dataStreamId}
                      disabled={!row.deviceId}
                      loading={streamsLoading}
                      error={!!rowErrors?.dataStreamId}
                      helperText={rowErrors?.dataStreamId}
                      options={getStreamOptions(row)}
                      onChange={(value) =>
                        onChange(row.rowId, 'dataStreamId', value)
                      }
                    />
                  </TableCell>

                  <TableCell sx={bodyCellSx}>
                    <TextField
                      fullWidth
                      size="small"
                      value={row.targetPath}
                      error={!!rowErrors?.targetPath}
                      helperText={rowErrors?.targetPath}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">$.</InputAdornment>
                          ),
                          sx: { height: 32 },
                        },
                      }}
                      onChange={(e) =>
                        onChange(row.rowId, 'targetPath', e.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell sx={bodyCellSx}>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        aria-label="Delete data stream"
                        onClick={() => onRemove([row.rowId])}
                      >
                        <SvgIcon name="DeleteOutlined" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </PageTableRow>
              );
            })
          )}
        </TableBody>
      </PageTable>

      {rows.length > 0 && (
        <Pagination
          count={rows.length}
          page={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      )}
    </Box>
  );
}
