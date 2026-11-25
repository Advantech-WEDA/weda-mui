export type MqttProtocolVersion = '' | 'V310' | 'V311' | 'V500';

export type MqttAuthType = 'UsernamePassword';

export type TableHeaderSortKey = 'Name' | 'CreationTime';

export const mqttProtocolVersionOptions: {
  label: string;
  value: MqttProtocolVersion;
}[] = [
  { label: 'V310', value: 'V310' },
  { label: 'V311', value: 'V311' },
  { label: 'V500', value: 'V500' },
];

export interface MqttBrokerCredentialsInput {
  username: string;
  password: string;
}

export interface MqttBrokerForm {
  name: string;
  brokerEndpoint: string;
  mqttProtocolVersion: MqttProtocolVersion;
  credentials: MqttBrokerCredentialsInput;
}

export type MqttBrokerFormErrors = {
  name: string;
  brokerEndpoint: string;
  username: string;
  password: string;
};
