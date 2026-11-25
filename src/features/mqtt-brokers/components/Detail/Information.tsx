import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import type { IMqttBrokerDetail } from '../../api/mqttBrokers.api.types';
import InformationSection from './InformationSection';

interface IProps {
  brokerData: IMqttBrokerDetail | null;
}

const SECTION_MENUS = [
  { key: 'basic', title: 'Basic information' },
  { key: 'connection', title: 'Connection settings' },
];

const display = (value?: string | null) => value || '-';

const displayBoolean = (value?: boolean) =>
  value === undefined ? '-' : value ? 'Yes' : 'No';

export default function Information({ brokerData }: IProps) {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeSection, setActiveSection] = useState('basic');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const sectionRows: Record<string, [string, string][]> = {
    basic: [
      ['Broker config ID', display(brokerData?.mqttConfigId)],
      ['Broker name', display(brokerData?.name)],
      ['Broker endpoint', display(brokerData?.brokerEndpoint)],
      ['Protocol version', display(brokerData?.mqttProtocolVersion)],
      ['In use', displayBoolean(brokerData?.isInUse)],
    ],
    connection: [
      ['Auth type', display(brokerData?.authType)],
      ['Stored credentials', displayBoolean(brokerData?.hasStoredCredentials)],
      ['Keep alive interval', display(brokerData?.keepAliveInterval)],
      ['Reconnect interval', display(brokerData?.reconnectInterval)],
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
      sx={{
        display: 'flex',
        gap: 3,
        alignItems: 'flex-start',
      }}
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
