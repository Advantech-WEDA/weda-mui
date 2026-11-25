import { ANALYZER_FIELD_LIMITS, JAVASCRIPT_LIMITS } from '@features/analyzers';
import {
  Box,
  Button,
  Divider,
  FormHelperText,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Breadcrumbs,
  ConfirmDialog,
  ScrollSideTabs,
  SimpleConfirmDialog,
  SvgIcon,
} from '@shared/ui';
import { type ReactNode, useRef } from 'react';

import type { useJavaScriptAnalyzerEditorPage } from '@/features/devices/hooks/useJavaScriptAnalyzerEditorPage';

import DataStreamPickerField from './DataStreamPickerField';
import SelectDataStreamDialog from './SelectDataStreamDialog';

type IProps = ReturnType<typeof useJavaScriptAnalyzerEditorPage>;

const TAB_ITEMS = [
  { key: 'basic', label: 'Basic information' },
  { key: 'input', label: 'Input list' },
  { key: 'output', label: 'Output list' },
];

const BORDER = '1px solid var(--divider, rgba(0, 0, 0, 0.12))';
const ERROR_BORDER = '1px solid var(--error-main, #D32F2F)';

const headCellSx = {
  height: 56,
  padding: 'var(--05, 4px) var(--2, 16px)',
  verticalAlign: 'middle',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  color: 'var(--text-primary, rgba(0, 0, 0, 0.87))',
  fontFamily: 'var(--fontFamily, Roboto)',
  fontSize: 'var(--font-size-0875-rem, 14px)',
  fontWeight: 'var(--fontWeightMedium, 500)',
  lineHeight: '143%',
  letterSpacing: '0.17px',
} as const;

const jsonPathInputSlot = {
  startAdornment: <InputAdornment position="start">$.</InputAdornment>,
};

const Counter = ({ value, max }: { value: string; max: number }) => (
  <Box className="editor-page__form-wrapper-helper">
    {value.length}/{max}
  </Box>
);

const RequiredLabel = ({ label }: { label: string }) => (
  <>
    {label} <span className="required">*</span>
  </>
);

function ListSection({
  title,
  count,
  columns,
  error,
  addDisabled,
  addTooltip,
  onAdd,
  children,
}: {
  title: string;
  count: number;
  columns: { label: ReactNode; width?: number | string }[];
  error?: string;
  addDisabled?: boolean;
  addTooltip?: string;
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <Box className="editor-page__left-title">
        <Typography variant="h5" color="text.primary">
          {title} ({count})
        </Typography>
      </Box>

      <Box className="editor-page__form editor-page__form--list">
        <Tooltip title={addTooltip ?? ''}>
          <Box component="span" sx={{ alignSelf: 'flex-start' }}>
            <Button
              variant="contained"
              className="page-btn page-add-btn"
              disabled={addDisabled}
              startIcon={
                <SvgIcon
                  name="Add"
                  sx={{ color: 'var(--primary-contrastText)' }}
                />
              }
              onClick={onAdd}
              sx={{ flexShrink: 0, textTransform: 'none' }}
            >
              <Typography variant="body1">Add</Typography>
            </Button>
          </Box>
        </Tooltip>
      </Box>

      <Box className="editor-page__form editor-page__form--list">
        <Paper
          variant="outlined"
          sx={{
            overflow: 'hidden',
            borderRadius: 1,

            border: count ? BORDER : ERROR_BORDER,
          }}
        >
          <Table size="small" sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                {columns.map((col, index) => (
                  <TableCell
                    key={index}
                    sx={{ ...headCellSx, width: col.width }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>{children}</TableBody>
          </Table>
        </Paper>

        {error && (
          <FormHelperText error sx={{ mt: 0, pl: 1, fontSize: 14 }}>
            {error}
          </FormHelperText>
        )}
      </Box>
    </>
  );
}

const cellSx = {
  verticalAlign: 'top',
  padding: '8px var(--2, 16px) 7px',
} as const;

const EmptyRow = ({ colSpan, text }: { colSpan: number; text: string }) => (
  <TableRow sx={{ height: 56 }}>
    <TableCell
      colSpan={colSpan}
      align="center"
      sx={{ py: 0, color: 'text.secondary' }}
    >
      {text}
    </TableCell>
  </TableRow>
);

const DeleteCell = ({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) => (
  <TableCell sx={cellSx}>
    <Tooltip title="Delete">
      <span>
        <IconButton size="small" disabled={disabled} onClick={onClick}>
          <SvgIcon name="DeleteOutlined" />
        </IconButton>
      </span>
    </Tooltip>
  </TableCell>
);

const sectionSx = { width: 1305, maxWidth: '100%' } as const;

export default function JavaScriptEditorForm({
  mode,
  analyzerName,
  canSubmit,
  isComplete,
  submitting,
  dataStreamsLoading,
  dataStreamsById,
  values,
  errors,
  cancelOpen,
  submitOpen,
  picker,
  pickerOpen,
  pickerOptions,
  pickerInitialSelected,
  pickerMaxSelect,
  handleChange,
  handleInputRowChange,
  handleOutputRowChange,
  handleRemoveRow,
  handleOpenPicker,
  handleClosePicker,
  handlePickerSelect,
  handleDataStreamCreated,
  handleOpenCancelDialog,
  handleOpenSubmitDialog,
  handleCloseDialogs,
  handleLeave,
  handleSubmit,
}: IProps) {
  const isEdit = mode === 'edit';
  const submitDisabled = !canSubmit || !isComplete || submitting;
  const fieldsDisabled = !canSubmit || submitting;

  const basicRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLDivElement | null>(null);
  const outputRef = useRef<HTMLDivElement | null>(null);
  const sections = [
    { key: 'basic', ref: basicRef, id: 'basic-information-section' },
    { key: 'input', ref: inputRef, id: 'input-list-section' },
    { key: 'output', ref: outputRef, id: 'output-list-section' },
  ];

  const inputsFull =
    values.inputs.filter((r) => r.dataStreamId).length >=
    JAVASCRIPT_LIMITS.maxInputs;
  const outputsFull =
    values.outputs.filter((r) => r.dataStreamId).length >=
    JAVASCRIPT_LIMITS.maxOutputs;

  const actionButtons = (size?: 'small') => (
    <>
      <Button
        size={size}
        variant="outlined"
        className={
          size
            ? 'editor-page__footer__btn-cancel'
            : 'editor-page__header-actions-btn-cancel'
        }
        onClick={handleOpenCancelDialog}
      >
        Cancel
      </Button>

      <Button
        size={size}
        variant="contained"
        className={
          size
            ? 'editor-page__footer__btn-submit'
            : 'editor-page__header-actions-btn-submit'
        }
        disabled={submitDisabled}
        onClick={handleOpenSubmitDialog}
      >
        Submit
      </Button>
    </>
  );

  return (
    <Box className="editor-page">
      <Box className="editor-page__header">
        <Breadcrumbs />
        <Box className="editor-page__header-top">
          <Box className="editor-page__header-title">
            <Typography variant="h4">
              {isEdit
                ? analyzerName
                  ? `Edit "${analyzerName}"`
                  : 'Edit JavaScript Analyzer'
                : 'Add JavaScript Analyzer'}
            </Typography>
            <Typography variant="body2">*Required</Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            className="editor-page__header-actions"
          >
            {actionButtons()}
          </Stack>
        </Box>

        <Divider className="editor-page__header-divider" />
      </Box>

      <Box className="editor-page__content">
        <Box className="editor-page__left">
          <Box
            id="basic-information-section"
            ref={basicRef}
            className="editor-page__left-section"
            sx={sectionSx}
          >
            <Box className="editor-page__left-title">
              <Typography variant="h5" color="text.primary">
                Basic information
              </Typography>
            </Box>

            <Box className="editor-page__form">
              <Box className="editor-page__form-wrapper">
                <TextField
                  fullWidth
                  size="small"
                  className="editor-page__form-wrapper-textfield"
                  label={<RequiredLabel label="Analyzer name" />}
                  disabled={fieldsDisabled}
                  value={values.name}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  slotProps={{
                    htmlInput: { maxLength: ANALYZER_FIELD_LIMITS.name },
                  }}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
                <Counter value={values.name} max={ANALYZER_FIELD_LIMITS.name} />
              </Box>

              <Box className="editor-page__form-wrapper">
                <TextField
                  fullWidth
                  multiline
                  minRows={1}
                  size="small"
                  className="editor-page__form-wrapper-textfield"
                  label="Description"
                  disabled={fieldsDisabled}
                  value={values.description}
                  error={Boolean(errors.description)}
                  helperText={errors.description}
                  slotProps={{
                    htmlInput: {
                      maxLength: ANALYZER_FIELD_LIMITS.description,
                    },
                  }}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
                <Counter
                  value={values.description}
                  max={ANALYZER_FIELD_LIMITS.description}
                />
              </Box>

              <Box className="editor-page__form-wrapper">
                <TextField
                  fullWidth
                  multiline
                  size="small"
                  className="editor-page__form-wrapper-textfield"
                  label={<RequiredLabel label="JavaScript" />}
                  disabled={fieldsDisabled}
                  value={values.script}
                  error={Boolean(errors.script)}
                  helperText={errors.script}
                  slotProps={{
                    inputLabel: { shrink: true },
                    input: { sx: { padding: '16px 12px' } },
                    htmlInput: {
                      maxLength: JAVASCRIPT_LIMITS.script,
                      spellCheck: false,
                      style: { fontFamily: 'monospace', fontSize: 16 },
                    },
                  }}
                  onChange={(e) => handleChange('script', e.target.value)}
                />
                <Counter value={values.script} max={JAVASCRIPT_LIMITS.script} />
              </Box>
            </Box>
          </Box>

          <Box
            id="input-list-section"
            ref={inputRef}
            className="editor-page__left-section"
            sx={sectionSx}
          >
            <ListSection
              title="Input list"
              count={values.inputs.length}
              columns={[
                {
                  label: <RequiredLabel label="DataStream name" />,
                  width: 400,
                },
                { label: <RequiredLabel label="Variable name" />, width: 723 },
                { label: 'Actions', width: 150 },
              ]}
              error={errors.inputs}
              addDisabled={fieldsDisabled || inputsFull}
              addTooltip={
                inputsFull
                  ? `Up to ${JAVASCRIPT_LIMITS.maxInputs} inputs are allowed`
                  : undefined
              }
              onAdd={() => handleOpenPicker('input')}
            >
              {values.inputs.length === 0 ? (
                <EmptyRow colSpan={3} text="No inputs, yet." />
              ) : (
                values.inputs.map((row) => {
                  const rowErrors = errors.inputRows?.[row.key];

                  return (
                    <TableRow key={row.key}>
                      <TableCell sx={cellSx}>
                        <DataStreamPickerField
                          value={row.dataStreamId}
                          dataStream={dataStreamsById.get(row.dataStreamId)}
                          error={rowErrors?.dataStreamId}
                          disabled={fieldsDisabled || dataStreamsLoading}
                          onOpen={() => handleOpenPicker('input', row.key)}
                        />
                      </TableCell>
                      <TableCell sx={cellSx}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Variable name"
                          disabled={fieldsDisabled}
                          value={row.parameterName}
                          error={Boolean(rowErrors?.parameterName)}
                          helperText={rowErrors?.parameterName}
                          onChange={(e) =>
                            handleInputRowChange(
                              row.key,
                              'parameterName',
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <DeleteCell
                        disabled={fieldsDisabled}
                        onClick={() => handleRemoveRow('input', row.key)}
                      />
                    </TableRow>
                  );
                })
              )}
            </ListSection>
          </Box>

          <Box
            id="output-list-section"
            ref={outputRef}
            className="editor-page__left-section"
            sx={sectionSx}
          >
            <ListSection
              title="Output list"
              count={values.outputs.length}
              columns={[
                {
                  label: <RequiredLabel label="DataStream name" />,
                  width: 400,
                },
                { label: <RequiredLabel label="Value JSON path" /> },
                { label: <RequiredLabel label="Time JSON path" /> },
                { label: 'Actions', width: 150 },
              ]}
              error={errors.outputs}
              addDisabled={fieldsDisabled || outputsFull}
              addTooltip={
                outputsFull
                  ? `Up to ${JAVASCRIPT_LIMITS.maxOutputs} outputs are allowed`
                  : undefined
              }
              onAdd={() => handleOpenPicker('output')}
            >
              {values.outputs.length === 0 ? (
                <EmptyRow colSpan={4} text="No outputs, yet." />
              ) : (
                values.outputs.map((row) => {
                  const rowErrors = errors.outputRows?.[row.key];

                  return (
                    <TableRow key={row.key}>
                      <TableCell sx={cellSx}>
                        <DataStreamPickerField
                          value={row.dataStreamId}
                          dataStream={dataStreamsById.get(row.dataStreamId)}
                          error={rowErrors?.dataStreamId}
                          disabled={fieldsDisabled || dataStreamsLoading}
                          onOpen={() => handleOpenPicker('output', row.key)}
                        />
                      </TableCell>
                      <TableCell sx={cellSx}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="value"
                          slotProps={{ input: jsonPathInputSlot }}
                          disabled={fieldsDisabled}
                          value={row.valueJsonPath}
                          error={Boolean(rowErrors?.valueJsonPath)}
                          helperText={rowErrors?.valueJsonPath}
                          onChange={(e) =>
                            handleOutputRowChange(
                              row.key,
                              'valueJsonPath',
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <TableCell sx={cellSx}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="timestamp"
                          slotProps={{ input: jsonPathInputSlot }}
                          disabled={fieldsDisabled}
                          value={row.timeJsonPath}
                          error={Boolean(rowErrors?.timeJsonPath)}
                          helperText={rowErrors?.timeJsonPath}
                          onChange={(e) =>
                            handleOutputRowChange(
                              row.key,
                              'timeJsonPath',
                              e.target.value
                            )
                          }
                        />
                      </TableCell>
                      <DeleteCell
                        disabled={fieldsDisabled}
                        onClick={() => handleRemoveRow('output', row.key)}
                      />
                    </TableRow>
                  );
                })
              )}
            </ListSection>
          </Box>

          <Stack direction="row" spacing={1} className="editor-page__footer">
            {actionButtons('small')}
          </Stack>
        </Box>

        <Box className="editor-page__right">
          <ScrollSideTabs sections={sections} tabItems={TAB_ITEMS} />
        </Box>
      </Box>

      <SelectDataStreamDialog
        open={pickerOpen}
        multiple={!picker?.rowKey}
        options={pickerOptions}
        initialSelected={pickerInitialSelected}
        maxSelect={pickerMaxSelect}
        allowAdd={picker?.list !== 'input'}
        onDataStreamCreated={handleDataStreamCreated}
        onClose={handleClosePicker}
        onSelect={handlePickerSelect}
      />

      <ConfirmDialog
        open={cancelOpen}
        onClose={handleCloseDialogs}
        title="Unsaved Changes"
        content="Do you want to leave this page? Any unsaved changes will be lost."
        actions={[
          { label: 'Keep editing', onClick: handleCloseDialogs },
          { label: 'Don’t save', onClick: handleLeave },
        ]}
      />

      <SimpleConfirmDialog
        open={submitOpen}
        {...(isEdit
          ? {
              title: 'Save Changes',
              content: 'Are you sure you want to save these changes?',
              confirmLabel: 'Save',
            }
          : {
              title: 'Add Analyzer',
              content: `Are you sure you want to add the Analyzer "${values.name.trim()}"?`,
              confirmLabel: 'Add',
            })}
        onClose={handleCloseDialogs}
        onConfirm={handleSubmit}
      />
    </Box>
  );
}
