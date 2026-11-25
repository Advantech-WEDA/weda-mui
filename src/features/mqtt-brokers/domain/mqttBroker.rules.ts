import type {
  MqttBrokerForm,
  MqttBrokerFormErrors,
  MqttProtocolVersion,
} from './types';

export const MQTT_BROKER_NAME_MAX_LENGTH = 128;

const MQTT_ENDPOINT_SCHEMES = ['mqtt', 'mqtts'];
const MAX_PORT = 65535;

export function getBrokerEndpointError(endpoint: string): string {
  if (/\s/.test(endpoint)) {
    return 'Broker endpoint must not contain spaces.';
  }

  const schemeMatch = /^([a-z][a-z0-9+.-]*):\/\//i.exec(endpoint);
  if (
    !schemeMatch ||
    !MQTT_ENDPOINT_SCHEMES.includes(schemeMatch[1].toLowerCase())
  ) {
    return 'Broker endpoint must start with mqtt:// or mqtts://.';
  }
  const rest = endpoint.slice(schemeMatch[0].length);

  const match = /^(\[[0-9a-f:.]+\]|[^:/?#[\]@]+)(?::(\d*))?$/i.exec(rest);
  if (!match) {
    return 'Enter a valid broker endpoint, e.g. mqtt://broker.example.com:1883.';
  }

  const port = match[2];
  if (!port) {
    return 'Broker endpoint must include a port, e.g. mqtt://broker.example.com:1883.';
  }

  const portNumber = Number(port);
  if (portNumber < 1 || portNumber > MAX_PORT) {
    return `Port must be between 1 and ${MAX_PORT}.`;
  }

  return '';
}

export const INITIAL_MQTT_BROKER_ERRORS: MqttBrokerFormErrors = {
  name: '',
  brokerEndpoint: '',
  username: '',
  password: '',
};

export const INITIAL_MQTT_BROKER_DATA: MqttBrokerForm = {
  name: '',
  brokerEndpoint: '',
  mqttProtocolVersion: 'V311',
  credentials: { username: '', password: '' },
};

export function shouldSubmitMqttCredentials(
  mode: 'add' | 'edit',
  data: MqttBrokerForm,
  isChangingCredentials: boolean
): boolean {
  if (mode === 'add') return true;
  if (!isChangingCredentials) return false;

  return !!data.credentials.username.trim() || !!data.credentials.password;
}

export function validateMqttBrokerForm(
  data: MqttBrokerForm,
  requireCredentials: boolean
): {
  isValid: boolean;
  errors: MqttBrokerFormErrors;
} {
  const errors: MqttBrokerFormErrors = {
    ...INITIAL_MQTT_BROKER_ERRORS,
  };

  const name = data.name.trim();
  if (!name) {
    errors.name = 'Broker name is required';
  } else if (name.length > MQTT_BROKER_NAME_MAX_LENGTH) {
    errors.name = `Broker name must not exceed ${MQTT_BROKER_NAME_MAX_LENGTH} characters.`;
  }

  const endpoint = data.brokerEndpoint.trim();
  if (!endpoint) {
    errors.brokerEndpoint = 'Broker endpoint is required';
  } else {
    errors.brokerEndpoint = getBrokerEndpointError(endpoint);
  }

  if (requireCredentials) {
    const username = data.credentials.username.trim();
    const password = data.credentials.password;

    if (!username) {
      errors.username = 'Username is required';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
  }

  return { isValid: Object.values(errors).every((v) => !v), errors };
}

type FormField =
  | 'name'
  | 'brokerEndpoint'
  | 'mqttProtocolVersion'
  | 'username'
  | 'password';

export function applyMqttBrokerChange(
  prev: MqttBrokerForm,
  field: FormField,
  value: string
): MqttBrokerForm {
  switch (field) {
    case 'name':
      return { ...prev, name: value };

    case 'brokerEndpoint':
      return { ...prev, brokerEndpoint: value };

    case 'mqttProtocolVersion':
      return { ...prev, mqttProtocolVersion: value as MqttProtocolVersion };

    case 'username':
      return {
        ...prev,
        credentials: { ...prev.credentials, username: value },
      };

    case 'password':
      return {
        ...prev,
        credentials: { ...prev.credentials, password: value },
      };

    default:
      return prev;
  }
}
