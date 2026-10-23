import { Box } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { ICreateStackConfigPayload } from '../../../api/stacks.api.types';
import BasicInformation from './BasicInformation';
import ContainerImage from './ContainerImage';
import DockerComposeFile from './DockerComposeFile';
import EnvironmentVariables from './EnvironmentVariables';

interface IProps {
  stackData: ICreateStackConfigPayload;
}

export default function Information({ stackData }: IProps) {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeSection, setActiveSection] = useState('basic');

  const sectionMenus = useMemo(
    () => [
      {
        key: 'basic',
        title: 'Basic information',
      },
      {
        key: 'environment',
        title: 'Environment variables',
      },
      {
        key: 'container',
        title: 'Container / Image',
      },
      {
        key: 'compose',
        title: 'Docker compose file',
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

  const decodeBase64Utf8 = (base64: string) => {
    try {
      const binary = atob(base64);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

      return new TextDecoder().decode(bytes);
    } catch {
      return '';
    }
  };

  const parseContainerImages = (composeContent: string) => {
    const lines = composeContent.split('\n');
    const result: { containerName: string; image: string }[] = [];

    let currentService = '';

    lines.forEach((line) => {
      const serviceMatch = line.match(/^ {2}([a-zA-Z0-9_-]+):\s*$/);
      const imageMatch = line.match(/^\s*image:\s*(.+)\s*$/);

      if (serviceMatch) {
        currentService = serviceMatch[1];
      }

      if (currentService && imageMatch) {
        result.push({
          containerName: currentService,
          image: imageMatch[1].replace(/['"]/g, ''),
        });
      }
    });

    return result;
  };

  const environmentRows = useMemo(() => {
    return Object.entries(stackData?.environment ?? {}).map(([key, value]) => ({
      key,
      value: String(value ?? ''),
    }));
  }, [stackData?.environment]);

  const composeContent = useMemo(() => {
    return decodeBase64Utf8(stackData?.composeFileContent ?? '');
  }, [stackData?.composeFileContent]);

  const containerRows = useMemo(() => {
    return parseContainerImages(composeContent);
  }, [composeContent]);

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
        <BasicInformation
          stackData={stackData}
          information={sectionMenus.find((item) => item.key === 'basic')!}
          sectionRef={(el) => {
            sectionRefs.current['basic'] = el;
          }}
        />

        <EnvironmentVariables
          rows={environmentRows}
          information={sectionMenus.find((item) => item.key === 'environment')!}
          sectionRef={(el) => {
            sectionRefs.current['environment'] = el;
          }}
        />

        <ContainerImage
          rows={containerRows}
          information={sectionMenus.find((item) => item.key === 'container')!}
          sectionRef={(el) => {
            sectionRefs.current['container'] = el;
          }}
        />

        <DockerComposeFile
          content={composeContent}
          information={sectionMenus.find((item) => item.key === 'compose')!}
          sectionRef={(el) => {
            sectionRefs.current['compose'] = el;
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
