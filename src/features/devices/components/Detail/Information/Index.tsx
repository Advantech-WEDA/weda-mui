import { Box } from '@mui/material';
import { formatLocalTime } from '@shared/lib/dayjs';
import { AppChip } from '@shared/ui';
import { useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import type {
  IDataStreamsLatestResponse,
  IDeviceCapabilityItem,
  IDeviceItem,
} from '../../../api/devices.api.types';
import {
  connectivityChipProps,
  deviceStatusChipProps,
} from '../../deviceStatusDisplay';
import InformationSection from './InformationSection';
import { normalizeCapabilities } from './mapper';
interface IProps {
  deviceData?: IDeviceItem;
  deviceLatestData?: IDataStreamsLatestResponse | null;
  capabilityItems?: IDeviceCapabilityItem | null;
}

export default function Information({
  deviceData,
  deviceLatestData,
  capabilityItems,
}: IProps) {
  const { deviceId } = useParams<{
    tenant: string;
    deviceId: string;
  }>();

  const displayDeviceData = useMemo(() => {
    if (!deviceData) return null;

    return {
      ...deviceData,
      lastSeen: deviceLatestData?.time ?? deviceData.lastSeen,
    };
  }, [deviceData, deviceLatestData]);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeSection, setActiveSection] = useState('basic');

  const informationSections = useMemo(() => {
    const reported = capabilityItems?.data?.reported;

    const sections = reported ? normalizeCapabilities(reported) : [];

    const deviceBasicSection = {
      key: 'basic',
      title: 'Basic information',
      type: 'rows' as const,
      rows: [
        {
          label: 'Device ID',
          value: displayDeviceData?.deviceId || deviceId || '-',
        },
        {
          label: 'Model',
          value: displayDeviceData?.hwModel || '-',
        },
        {
          label: 'Device Status',
          value: displayDeviceData?.status ? (
            <AppChip {...deviceStatusChipProps(displayDeviceData.status)} />
          ) : (
            '-'
          ),
        },
        {
          label: 'Connectivity',
          value: (
            <AppChip
              {...connectivityChipProps(
                displayDeviceData?.lastSeen ? 'Connected' : 'Disconnected'
              )}
            />
          ),
        },
        {
          label: 'Last Connected',
          value: formatLocalTime(displayDeviceData?.lastSeen) || '-',
        },
        {
          label: 'Registration Time',
          value: formatLocalTime(displayDeviceData?.createdAt) || '-',
        },
      ],
    };

    const withoutBasic = sections.filter((section) => section.key !== 'basic');

    return [deviceBasicSection, ...withoutBasic];
  }, [capabilityItems, displayDeviceData, deviceId]);

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
        {informationSections.map((section) => (
          <InformationSection
            key={section.key}
            section={section}
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
        {informationSections.map((section) => {
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
