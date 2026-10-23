import { Box } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';

import type {
  IAiModelEditionDetail,
  IAiModelItem,
} from '../../../api/aiModels.api.types';
import InfoSection from './InfoSection';

interface IProps {
  modelItem: IAiModelItem | null;
  editionDetail: IAiModelEditionDetail | null;
}

export default function Information({ modelItem, editionDetail }: IProps) {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeSection, setActiveSection] = useState('model');

  const sectionMenus = useMemo(
    () => [
      {
        key: 'model',
        title: 'AI model information',
      },
      {
        key: 'edition',
        title: 'Edition information',
      },
    ],
    []
  );

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'auto',
    });
  }, []);

  const handleScrollTo = (key: string) => {
    sectionRefs.current[key]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <Box
      className="editor-page__content"
      sx={{
        display: 'flex',
        gap: 3,
        alignItems: 'flex-start',
      }}
    >
      <Box className="editor-page__left" sx={{ flex: 1, minWidth: 0 }}>
        <InfoSection
          title="AI model information"
          rows={[
            { label: 'Model id', value: editionDetail?.modelId ?? '-' },
            {
              label: 'Model name',
              value: editionDetail?.modelName ?? modelItem?.modelName ?? '-',
            },
            {
              label: 'Description',
              value: modelItem?.description ?? '-',
            },
          ]}
          sectionRef={(el) => {
            sectionRefs.current['model'] = el;
          }}
        />

        <InfoSection
          title="Edition information"
          rows={[
            { label: 'Edition name', value: editionDetail?.edition ?? '-' },
            {
              label: 'Description',
              value: editionDetail?.description ?? '-',
            },
            {
              label: 'File name',
              value: editionDetail?.file?.fileName ?? '-',
            },
          ]}
          sectionRef={(el) => {
            sectionRefs.current['edition'] = el;
          }}
        />
      </Box>

      <Box
        className="editor-page__right"
        sx={{
          p: 0,
          border: '1px solid var(--divider-color, rgba(0, 0, 0, 0.12))',
          borderRadius: 1,
        }}
      >
        {sectionMenus.map((section) => {
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
