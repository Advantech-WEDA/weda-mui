import type {
  DataStreamDataType,
  IDataStreamItem,
} from '@features/data-streams';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  Radio,
  Stack,
  Typography,
} from '@mui/material';
import {
  AppChip,
  PageSearchField,
  SelectElement,
  type SelectOption,
  SvgIcon,
} from '@shared/ui';
import { useMemo, useState } from 'react';

import {
  DATA_TYPE_CONFIG,
  dataSourceChipProps,
  dataTypeOptions,
} from '@/features/devices/components/Detail/DataStreams/dataStreamDisplay';
import { useAddDataStreamDialog } from '@/features/devices/hooks/useAddDataStreamDialog';
import { UNBOUND_SOURCE } from '@/features/devices/hooks/useDeviceDataStreamsTab';

import AddDataStreamDialog from './AddDataStreamDialog';

interface IProps {
  open: boolean;

  multiple: boolean;
  options: IDataStreamItem[];

  initialSelected?: string[];

  maxSelect?: number;

  allowAdd?: boolean;

  onDataStreamCreated: (dataStream: IDataStreamItem) => void;
  onClose: () => void;
  onSelect: (dataStreamIds: string[]) => void;
}

export default function SelectDataStreamDialog(props: IProps) {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { width: 600, height: 920 } } }}
    >
      <PickerContent {...props} />
    </Dialog>
  );
}

const streamName = (s: IDataStreamItem) =>
  s.displayName || s.dataStreamName || s.dataStreamId;

const rowSx = { height: 42, px: 0, gap: 'var(--05, 4px)' } as const;

const controlSx = { p: '0 9px' } as const;

const rowTextSx = {
  flex: 1,
  minWidth: 0,
  lineHeight: '24px',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
} as const;

function DataTypeIcon({ type }: { type: string }) {
  const config = DATA_TYPE_CONFIG[type as DataStreamDataType];

  return config?.icon ? (
    <SvgIcon name={config.icon} size={20} />
  ) : (
    <Box
      component="span"
      sx={{
        width: 20,
        height: 20,
        flexShrink: 0,
        fontSize: 8,
        fontWeight: 600,
        textAlign: 'center',
      }}
    >
      {config?.badge ?? '?'}
    </Box>
  );
}

function PickerContent({
  multiple,
  options,
  initialSelected = [],
  maxSelect,
  allowAdd = true,
  onDataStreamCreated,
  onClose,
  onSelect,
}: IProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [searchWord, setSearchWord] = useState('');
  const [dataTypeFilter, setDataTypeFilter] = useState<DataStreamDataType | ''>(
    ''
  );
  const [sourceFilter, setSourceFilter] = useState('');

  const addDataStream = useAddDataStreamDialog((dataStream) => {
    onDataStreamCreated(dataStream);
    setSelected((prev) =>
      multiple ? [...prev, dataStream.dataStreamId] : [dataStream.dataStreamId]
    );
  });

  const sourceOptions = useMemo<SelectOption[]>(() => {
    const types = new Set<string>();

    options.forEach((s) => {
      if (s.dataSource?.type) types.add(s.dataSource.type);
    });

    return [
      { label: UNBOUND_SOURCE, value: UNBOUND_SOURCE },
      ...[...types].map((type) => ({ label: type, value: type })),
    ];
  }, [options]);

  const visible = useMemo(() => {
    const keyword = searchWord.trim().toLowerCase();

    return options.filter((s) => {
      const matchSearch =
        !keyword ||
        (s.displayName ?? '').toLowerCase().includes(keyword) ||
        (s.dataStreamName ?? '').toLowerCase().includes(keyword);
      const matchDataType = !dataTypeFilter || s.dataType === dataTypeFilter;
      const matchSource =
        !sourceFilter ||
        (sourceFilter === UNBOUND_SOURCE
          ? !s.dataSource?.type
          : s.dataSource?.type === sourceFilter);

      return matchSearch && matchDataType && matchSource;
    });
  }, [options, searchWord, dataTypeFilter, sourceFilter]);

  const selectedSet = new Set(selected);
  const atLimit = maxSelect !== undefined && selected.length >= maxSelect;
  const allVisibleSelected =
    visible.length > 0 && visible.every((s) => selectedSet.has(s.dataStreamId));
  const someVisibleSelected = visible.some((s) =>
    selectedSet.has(s.dataStreamId)
  );

  const toggle = (id: string) => {
    if (!multiple) {
      setSelected([id]);
      return;
    }

    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : atLimit
          ? prev
          : [...prev, id]
    );
  };

  const toggleAll = () => {
    const visibleIds = visible.map((s) => s.dataStreamId);

    if (allVisibleSelected) {
      setSelected((prev) => prev.filter((id) => !visibleIds.includes(id)));
      return;
    }

    setSelected((prev) => {
      const next = [...prev];

      visibleIds.forEach((id) => {
        if (
          !next.includes(id) &&
          (maxSelect === undefined || next.length < maxSelect)
        ) {
          next.push(id);
        }
      });

      return next;
    });
  };

  const handleClearFilters = () => {
    setSearchWord('');
    setDataTypeFilter('');
    setSourceFilter('');
  };

  return (
    <>
      <DialogTitle
        sx={{
          height: 64,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {multiple ? 'Select DataStream(s)' : 'Select a DataStream'}
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          px: 3,
          overflow: 'hidden',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {allowAdd && (
            <Button
              variant="contained"
              className="page-btn page-add-btn"
              startIcon={
                <SvgIcon
                  name="Add"
                  sx={{ color: 'var(--primary-contrastText)' }}
                />
              }
              onClick={addDataStream.handleOpen}
              sx={{ flexShrink: 0, textTransform: 'none', width: '120px' }}
            >
              <Typography variant="body1">Add</Typography>
            </Button>
          )}

          <PageSearchField
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
          />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <SelectElement
            value={dataTypeFilter}
            onChange={(value) =>
              setDataTypeFilter(value as DataStreamDataType | '')
            }
            placeholder="Data type"
            minWidth={120}
            options={dataTypeOptions}
          />

          <SelectElement
            value={sourceFilter}
            onChange={setSourceFilter}
            placeholder="Source"
            minWidth={120}
            options={sourceOptions}
          />

          <Button
            className="page-btn"
            variant="outlined"
            onClick={handleClearFilters}
            sx={{ flexShrink: 0, textTransform: 'none' }}
          >
            <Typography variant="body1">Clear filters</Typography>
          </Button>
        </Stack>

        <List
          disablePadding
          sx={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingTop: 2 }}
        >
          {multiple && visible.length > 0 && (
            <ListItemButton onClick={toggleAll} sx={rowSx}>
              <Checkbox
                disableRipple
                sx={controlSx}
                checked={allVisibleSelected}
                indeterminate={someVisibleSelected && !allVisibleSelected}
              />
              <Typography variant="body1" sx={rowTextSx}>
                All
              </Typography>
            </ListItemButton>
          )}

          {visible.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">
                {options.length
                  ? 'No results found.'
                  : 'No DataStreams available'}
              </Typography>
            </Box>
          ) : (
            visible.map((s) => {
              const checked = selectedSet.has(s.dataStreamId);

              return (
                <ListItemButton
                  key={s.dataStreamId}
                  onClick={() => toggle(s.dataStreamId)}
                  disabled={multiple && !checked && atLimit}
                  sx={rowSx}
                >
                  {multiple ? (
                    <Checkbox disableRipple sx={controlSx} checked={checked} />
                  ) : (
                    <Radio disableRipple sx={controlSx} checked={checked} />
                  )}

                  <DataTypeIcon type={s.dataType} />

                  <Typography variant="body1" sx={rowTextSx}>
                    {streamName(s)}
                  </Typography>

                  <AppChip {...dataSourceChipProps(s.dataSource?.type)} />
                </ListItemButton>
              );
            })
          )}
        </List>
      </DialogContent>

      <DialogActions
        className="confirm-dialog-actions"
        sx={{ height: 48, flexShrink: 0, py: 0 }}
      >
        <Button onClick={onClose} className="confirm-dialog__button">
          Cancel
        </Button>
        <Button
          onClick={() => onSelect(selected)}
          className="confirm-dialog__button"
          disabled={!selected.length}
        >
          {multiple ? `Select (${selected.length})` : 'Select'}
        </Button>
      </DialogActions>

      <AddDataStreamDialog {...addDataStream} />
    </>
  );
}
