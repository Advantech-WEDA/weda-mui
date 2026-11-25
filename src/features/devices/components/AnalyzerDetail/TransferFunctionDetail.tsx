import type { IAnalyzerItem } from '@features/analyzers';
import type { IDataStreamItem } from '@features/data-streams';
import { Box, Typography } from '@mui/material';
import { ScrollSideTabs } from '@shared/ui';
import { useRef } from 'react';

import InformationSection from '@/features/devices/components/DataStreamDetail/InformationSection';

import DataStreamCard from './DataStreamCard';

interface IProps {
  analyzer: IAnalyzerItem;
  dataStreamsById: Map<string, IDataStreamItem>;
}

const TAB_ITEMS = [
  { key: 'basic', label: 'Basic information' },
  { key: 'input', label: 'Input' },
  { key: 'output', label: 'Output' },
];

const display = (value?: string | null) => value || '-';

export default function TransferFunctionDetail({
  analyzer,
  dataStreamsById,
}: IProps) {
  const basicRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLDivElement | null>(null);
  const outputRef = useRef<HTMLDivElement | null>(null);
  const sections = [
    { key: 'basic', ref: basicRef, id: 'basic-information-section' },
    { key: 'input', ref: inputRef, id: 'input-section' },
    { key: 'output', ref: outputRef, id: 'output-section' },
  ];

  const expression =
    typeof analyzer.config?.expression === 'string'
      ? analyzer.config.expression
      : null;

  const inputIds = (analyzer.inputParameters ?? []).map((p) => p.dataStreamId);
  const outputIds = (analyzer.outputs ?? []).map((o) => o.dataStreamId);

  const streamSection = (
    id: string,
    ref: React.RefObject<HTMLDivElement | null>,
    title: string,
    ids: string[]
  ) => (
    <Box id={id} ref={ref} sx={{ mb: 5 }}>
      <Typography variant="h5" sx={{ p: 2 }}>
        {title}
      </Typography>

      {ids.length ? (
        ids.map((streamId) => (
          <DataStreamCard
            key={streamId}
            dataStreamId={streamId}
            dataStream={dataStreamsById.get(streamId)}
          />
        ))
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
          -
        </Typography>
      )}
    </Box>
  );

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
              ['Expression', display(expression)],
            ]}
          />
        </Box>

        {streamSection('input-section', inputRef, 'Input', inputIds)}
        {streamSection('output-section', outputRef, 'Output', outputIds)}
      </Box>

      <Box className="editor-page__right">
        <ScrollSideTabs sections={sections} tabItems={TAB_ITEMS} />
      </Box>
    </Box>
  );
}
