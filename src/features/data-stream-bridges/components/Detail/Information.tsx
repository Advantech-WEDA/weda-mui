import { Box, Stack, Switch } from '@mui/material';
import { AppChip } from '@shared/ui';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import type { IDataStreamBridgeDetail } from '../../api/dataStreamBridges.api.types';
import { toBridgeDisplayStatus } from '../../domain/types';
import { bridgeStatusChipProps } from '../bridgeStatusDisplay';
import InformationSection from './InformationSection';

interface IProps {
  bridgeData: IDataStreamBridgeDetail | null;
  hasPermission: boolean;

  toggling: boolean;
  onToggleEnabled: () => void;
}

const SECTION_MENUS = [
  { key: 'basic', title: 'Basic information' },
  { key: 'mqtt', title: 'MQTT broker information' },
];

const display = (value?: string | number | null) =>
  value === undefined || value === null || value === '' ? '-' : String(value);

export default function Information({
  bridgeData,
  hasPermission,
  toggling,
  onToggleEnabled,
}: IProps) {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeSection, setActiveSection] = useState('basic');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const status = bridgeData
    ? toBridgeDisplayStatus({
        isEnabled: bridgeData.isEnabled,
        runtimeStatus: bridgeData.runtimeState?.status ?? null,
      })
    : null;

  const mqtt = bridgeData?.mqtt;

  const sectionRows: Record<string, [string, ReactNode][]> = {
    basic: [
      ['Bridge name', display(bridgeData?.name)],
      ['Output topic', display(mqtt?.outputTopic)],
      ['QoS', display(mqtt?.qos)],
      [
        'Runtime status',
        status ? <AppChip {...bridgeStatusChipProps(status)} /> : '-',
      ],
      [
        'Enable/Disable',
        bridgeData ? (
          <Stack direction="row" alignItems="center">
            <Switch
              size="small"
              checked={bridgeData.isEnabled}
              disabled={!hasPermission || toggling}
              onChange={onToggleEnabled}
            />
            {bridgeData.isEnabled ? 'Enabled' : 'Disabled'}
          </Stack>
        ) : (
          '-'
        ),
      ],
    ],
    mqtt: [
      ['MQTT broker name', display(mqtt?.mqttBrokerConfigName)],
      ['Broker endpoint', display(mqtt?.brokerEndpoint)],
      ['Auth type', display(mqtt?.authType)],
      ['Keep alive interval', display(mqtt?.keepAliveInterval)],
      ['Reconnect interval', display(mqtt?.reconnectInterval)],
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
