import { Box, TextField } from '@mui/material';
import { SelectElement } from '@shared/ui';

import { MQTT_BROKER_NAME_MAX_LENGTH } from '../domain/mqttBroker.rules';
import {
  type MqttBrokerForm,
  type MqttBrokerFormErrors,
  mqttProtocolVersionOptions,
} from '../domain/types';

interface IProps {
  mode: 'add' | 'edit';
  formData: MqttBrokerForm;
  errors: MqttBrokerFormErrors;
  onChange: (
    field: 'name' | 'brokerEndpoint' | 'mqttProtocolVersion',
    value: string
  ) => void;
}

export default function BasicInformation({
  mode,
  formData,
  errors,
  onChange,
}: IProps) {
  return (
    <Box className="editor-page__form">
      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          className="editor-page__form-wrapper-textfield"
          label={
            <>
              Broker name <span className="required">*</span>
            </>
          }
          value={formData.name}
          error={!!errors.name}
          helperText={errors.name}
          slotProps={{
            htmlInput: { maxLength: MQTT_BROKER_NAME_MAX_LENGTH },
          }}
          onChange={(e) => onChange('name', e.target.value)}
        />

        <Box className="editor-page__form-wrapper-helper">
          {formData.name.length}/{MQTT_BROKER_NAME_MAX_LENGTH}
        </Box>
      </Box>

      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          className="editor-page__form-wrapper-textfield"
          label={
            <>
              Broker endpoint <span className="required">*</span>
            </>
          }
          placeholder="mqtt://host:port"
          value={formData.brokerEndpoint}
          error={!!errors.brokerEndpoint}
          helperText={errors.brokerEndpoint}
          onChange={(e) => onChange('brokerEndpoint', e.target.value)}
        />
      </Box>

      <Box className="editor-page__form-wrapper">
        <SelectElement
          className="editor-page__form-wrapper-select"
          value={formData.mqttProtocolVersion}
          onChange={(value) => onChange('mqttProtocolVersion', value)}
          label={
            <>
              Protocol version
              {mode === 'add' && <span className="required">*</span>}
            </>
          }
          required
          options={mqttProtocolVersionOptions}
        />
      </Box>
    </Box>
  );
}
