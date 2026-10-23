import { getAppBasePath } from '@shared/lib/appRoute';
import { getTenant } from '@shared/lib/baseUrl';

const tenantPath = getTenant();
const homePath = getAppBasePath(tenantPath);

export const breadcrumbs = {
  home: { label: 'Home', to: homePath },
  organizations: {
    list: { label: 'Organizations', to: `${homePath}/organizations` },
  },
  members: {
    list: { label: 'Members', to: `${homePath}/members` },
  },
  aiModels: {
    list: { label: 'AI Models', to: `${homePath}/ai-models` },
    deployments: {
      label: 'Deployments',
      to: `${homePath}/ai-models/:modelId/editions/:edition/deployment`,
    },
  },
  devices: {
    list: { label: 'Devices', to: `${homePath}/devices` },
    containerStacks: {
      label: 'Container Stacks',
      to: `${homePath}/devices/:deviceId/container-stacks`,
    },
    aiModels: {
      label: 'AI Models',
      to: `${homePath}/devices/:deviceId/ai-models`,
    },
  },
  stacks: {
    list: { label: 'Container Stacks', to: `${homePath}/container-stacks` },
    deployments: {
      label: 'Deployments',
      to: `${homePath}/container-stacks/:stackConfigId/:stackRevisionId/deployment`,
    },
  },
  registries: {
    list: { label: 'Registries', to: `${homePath}/registries` },
  },
  mqttBrokerConfigs: {
    list: {
      label: 'MQTT Broker Configs',
      to: `${homePath}/mqtt-broker-configs`,
    },
  },
  clientCredentials: {
    list: {
      label: 'Client Credentials',
      to: `${homePath}/client-credentials`,
    },
  },
};
