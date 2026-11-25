import type { Column as SharedColumn } from '@shared/ui';

import type { TableHeaderSortKey } from '../domain/types';

export type MqttBrokerColumn = SharedColumn<TableHeaderSortKey>;

export const MQTT_BROKER_COLUMNS: MqttBrokerColumn[] = [
  { sortKey: 'Name', label: 'Broker name' },
  { label: 'Endpoint', width: 200 },
  { label: 'Protocol version', width: 200 },
  { label: 'DataStream Bridges', width: 200 },

  { sortKey: 'CreationTime', label: 'Date created', width: 200 },
  { label: 'Actions', width: 150 },
];
