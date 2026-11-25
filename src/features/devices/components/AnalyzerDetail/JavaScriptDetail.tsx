import type { IAnalyzerItem } from '@features/analyzers';
import type { IDataStreamItem } from '@features/data-streams';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ScrollSideTabs } from '@shared/ui';
import type { ReactNode } from 'react';
import { useRef } from 'react';

import InformationSection from '@/features/devices/components/DataStreamDetail/InformationSection';

import DataStreamLabel from './DataStreamLabel';

interface IProps {
  analyzer: IAnalyzerItem;
  dataStreamsById: Map<string, IDataStreamItem>;
}

const TAB_ITEMS = [
  { key: 'basic', label: 'Basic information' },
  { key: 'input', label: 'Input list' },
  { key: 'output', label: 'Output list' },
];

const BORDER = '1px solid var(--divider, rgba(0, 0, 0, 0.12))';

const display = (value?: string | null) => value || '-';

const rowSx = { height: 56 } as const;
const cellSx = {
  height: 56,
  boxSizing: 'border-box',
  padding: 'var(--1, 8px) var(--2, 16px)',
} as const;

function ListTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: { key: string; cells: ReactNode[] }[];
}) {
  return (
    <Paper
      variant="outlined"
      sx={{ m: 2, overflow: 'hidden', borderRadius: 1, border: BORDER }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={rowSx}>
            {columns.map((col, index) => (
              <TableCell
                key={col}
                sx={{
                  ...cellSx,
                  fontWeight: 500,
                  width: index === 0 ? 200 : undefined,
                }}
              >
                {col}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow key={row.key} sx={rowSx}>
                {row.cells.map((cell, index) => (
                  <TableCell key={index} sx={cellSx}>
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow sx={rowSx}>
              <TableCell colSpan={columns.length} sx={cellSx}>
                -
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default function JavaScriptDetail({
  analyzer,
  dataStreamsById,
}: IProps) {
  const basicRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLDivElement | null>(null);
  const outputRef = useRef<HTMLDivElement | null>(null);
  const sections = [
    { key: 'basic', ref: basicRef, id: 'basic-information-section' },
    { key: 'input', ref: inputRef, id: 'input-list-section' },
    { key: 'output', ref: outputRef, id: 'output-list-section' },
  ];

  const script =
    typeof analyzer.config?.script === 'string' ? analyzer.config.script : null;

  const label = (id: string) => (
    <DataStreamLabel dataStreamId={id} dataStream={dataStreamsById.get(id)} />
  );

  const inputRows = (analyzer.inputParameters ?? []).map((p) => ({
    key: `${p.dataStreamId}-${p.parameterName}`,
    cells: [label(p.dataStreamId), p.parameterName],
  }));

  const outputRows = (analyzer.outputs ?? []).map((o) => ({
    key: o.dataStreamId,
    cells: [
      label(o.dataStreamId),
      display(o.valueJsonPath),
      display(o.timeJsonPath),
    ],
  }));

  return (
    <Box className="editor-page__content">
      <Box className="editor-page__left">
        <Box id="basic-information-section">
          <InformationSection
            title="Basic information"
            sectionRef={(el) => {
              basicRef.current = el;
            }}
            rows={[
              ['Analyzer name', display(analyzer.name)],
              ['Description', display(analyzer.description)],
            ]}
          >
            <Paper
              variant="outlined"
              sx={{ m: 2, p: 2, borderRadius: 1, border: BORDER }}
            >
              <Box
                component="pre"
                sx={{
                  m: 0,
                  fontFamily: 'monospace',
                  fontSize: 14,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {display(script)}
              </Box>
            </Paper>
          </InformationSection>
        </Box>

        <Box id="input-list-section" ref={inputRef} sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ p: 2 }}>
            Input list
          </Typography>
          <ListTable
            columns={['DataStream name', 'Variable name']}
            rows={inputRows}
          />
        </Box>

        <Box id="output-list-section" ref={outputRef} sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ p: 2 }}>
            Output list
          </Typography>
          <ListTable
            columns={['DataStream name', 'Value JSON path', 'Time JSON path']}
            rows={outputRows}
          />
        </Box>
      </Box>

      <Box className="editor-page__right">
        <ScrollSideTabs sections={sections} tabItems={TAB_ITEMS} />
      </Box>
    </Box>
  );
}
