import type { IMqttBrokerListItem } from '@features/mqtt-brokers';
import { Box, TextField } from '@mui/material';
import { SelectElement } from '@shared/ui';
import { useMemo } from 'react';

import {
  type BasicField,
  type DataStreamBridgeForm,
  type DataStreamBridgeFormErrors,
  qosOptions,
} from '../../domain/types';

interface IProps {
  formData: DataStreamBridgeForm;
  errors: DataStreamBridgeFormErrors;
  brokers: IMqttBrokerListItem[];
  brokersLoading: boolean;
  onChange: (field: BasicField, value: string) => void;
}

export default function BasicInformation({
  formData,
  errors,
  brokers,
  brokersLoading,
  onChange,
}: IProps) {
  const brokerOptions = useMemo(() => {
    const options = brokers.map((broker) => ({
      label: broker.name ?? broker.mqttConfigId,
      value: broker.mqttConfigId,
    }));

    if (
      formData.mqttBrokerConfigId &&
      !options.some((o) => o.value === formData.mqttBrokerConfigId)
    ) {
      options.unshift({
        label: formData.mqttBrokerConfigId,
        value: formData.mqttBrokerConfigId,
      });
    }

    return options;
  }, [brokers, formData.mqttBrokerConfigId]);

  return (
    <Box className="editor-page__form">
      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          className="editor-page__form-wrapper-textfield"
          label={
            <>
              Bridge name <span className="required">*</span>
            </>
          }
          value={formData.name}
          error={!!errors.name}
          helperText={errors.name}
          slotProps={{ htmlInput: { maxLength: 256 } }}
          onChange={(e) => onChange('name', e.target.value)}
        />
      </Box>

      <Box className="editor-page__form-wrapper">
        <SelectElement
          fullWidth
          className="editor-page__form-wrapper-select"
          value={formData.mqttBrokerConfigId}
          onChange={(value) => onChange('mqttBrokerConfigId', value)}
          label={
            <>
              MQTT broker <span className="required">*</span>
            </>
          }
          placeholder="Select an MQTT broker"
          required
          loading={brokersLoading}
          error={!!errors.mqttBrokerConfigId}
          helperText={errors.mqttBrokerConfigId}
          options={brokerOptions}
        />
      </Box>

      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          className="editor-page__form-wrapper-textfield"
          label={
            <>
              Output topic <span className="required">*</span>
            </>
          }
          value={formData.outputTopic}
          error={!!errors.outputTopic}
          helperText={errors.outputTopic}
          slotProps={{ htmlInput: { maxLength: 512 } }}
          onChange={(e) => onChange('outputTopic', e.target.value)}
        />
      </Box>

      <Box className="editor-page__form-wrapper">
        <SelectElement
          fullWidth
          className="editor-page__form-wrapper-select"
          value={String(formData.qos)}
          onChange={(value) => onChange('qos', value)}
          label={
            <>
              QoS <span className="required">*</span>
            </>
          }
          required
          options={qosOptions}
        />
      </Box>
    </Box>
  );
}
