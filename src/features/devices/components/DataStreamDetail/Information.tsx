import type {
  DataStreamDataType,
  IDataStreamItem,
} from '@features/data-streams';
import { Box } from '@mui/material';
import { PageTableLoadingIndicator } from '@shared/ui';
import { useRef, useState } from 'react';

import { DATA_TYPE_CONFIG } from '@/features/devices/components/Detail/DataStreams/dataStreamDisplay';

import InformationSection from './InformationSection';

interface IProps {
  dataStream: IDataStreamItem | null;
  loading: boolean;
}

const SECTION_MENUS = [{ key: 'basic', title: 'Basic information' }];

const display = (value?: string | null) => value || '-';

export default function Information({ dataStream, loading }: IProps) {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeSection, setActiveSection] = useState('basic');

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <PageTableLoadingIndicator />
      </Box>
    );
  }

  const dataType = dataStream?.dataType;

  const sectionRows: Record<string, [string, string][]> = {
    basic: [
      ['DataStream name', display(dataStream?.dataStreamName)],
      ['Display name', display(dataStream?.displayName)],
      ['Description', display(dataStream?.description)],
      [
        'Data type',
        dataType
          ? (DATA_TYPE_CONFIG[dataType as DataStreamDataType]?.label ??
            dataType)
          : '-',
      ],

      [
        'Data source',
        dataStream ? dataStream.dataSource?.type || 'Unbound' : '-',
      ],
      ['Unit', display(dataStream?.unitDisplay)],
      [
        'Record to data lake',
        dataStream ? (dataStream.recordToDataLake ? 'Yes' : 'No') : '-',
      ],
    ],
  };

  const handleScrollTo = (key: string) => {
    sectionRefs.current[key]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <Box
      className="editor-page__content"
      sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}
    >
      <Box className="editor-page__left" sx={{ flex: 1, minWidth: 0 }}>
        {SECTION_MENUS.map((section) => (
          <InformationSection
            key={section.key}
            title={section.title}
            rows={sectionRows[section.key]}
            sectionRef={(el) => {
              sectionRefs.current[section.key] = el;
            }}
          />
        ))}
      </Box>

      <Box
        className="editor-page__right"
        sx={{
          p: 0,
          border: '1px solid var(--divider-color, rgba(0, 0, 0, 0.12))',
          borderRadius: 1,
        }}
      >
        {SECTION_MENUS.map((section) => {
          const active = activeSection === section.key;

          return (
            <Box
              key={section.key}
              onClick={() => {
                setActiveSection(section.key);
                handleScrollTo(section.key);
              }}
              sx={{
                height: 48,
                px: 3,
                py: 1,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 400,
                backgroundColor: active
                  ? 'var(--primary-_states-selected, rgba(25, 118, 210, 0.08))'
                  : 'transparent',
                color: active
                  ? 'var(--primary-main, #1976D2)'
                  : 'var(--text-primary, rgba(0, 0, 0, 0.87))',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                '&:hover': {
                  backgroundColor:
                    'var(--primary-_states-selected, rgba(25, 118, 210, 0.08))',
                },
              }}
            >
              {section.title}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
