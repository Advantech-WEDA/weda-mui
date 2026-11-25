import type {
  DataStreamDataType,
  DataStreamManagedBy,
  DataStreamSourceType,
} from '../domain/types';

export interface IDataStreamSource {
  type: DataStreamSourceType | null;

  sourceEntityId: string | null;
}

export interface IDataStreamItem {
  dataStreamId: string;

  dataStreamName: string | null;
  displayName: string | null;
  description: string | null;

  unitDisplay: string | null;
  dataType: DataStreamDataType;
  recordToDataLake: boolean;
  managedBy: DataStreamManagedBy;

  dataSource?: IDataStreamSource | null;

  creationTime?: string | null;

  lastModificationTime?: string | null;
}

export interface IDataStreamsList {
  items: IDataStreamItem[] | null;
  totalCount: number;
}

export interface ICreateDataStreamRequest {
  dataStreamName: string;

  displayName?: string | null;

  description?: string | null;

  unitDisplay?: string | null;
  dataType: DataStreamDataType;

  recordToDataLake?: boolean;
}

export type IUpdateDataStreamRequest = ICreateDataStreamRequest;

export interface IPatchDataStreamRequest {
  displayName?: string | null;

  description?: string | null;

  unitDisplay?: string | null;
  recordToDataLake?: boolean | null;
}

export interface IDataStreamDataObject {
  timestamp: string;
  value: unknown;
}

export interface IDataStreamLatestValueItem {
  dataStreamId: string;
  dataStreamName: string | null;

  dataType: string | null;
  displayName: string | null;
  unitDisplay: string | null;
  dataObject: IDataStreamDataObject;
}

export interface IDeviceDataStreamsLatest {
  deviceId: string | null;

  time: string;

  dataStreams: IDataStreamLatestValueItem[] | null;
}

export interface IDataStreamLatestValue {
  deviceId: string | null;
  dataStreamId: string;
  dataStreamName: string | null;

  dataType: string | null;
  dataObject: IDataStreamDataObject;
}

export interface IDataStreamHistorical {
  deviceId: string | null;
  dataStreamId: string;

  start: string;

  end: string;
  dataType: DataStreamDataType;

  dataObjects: IDataStreamDataObject[] | null;

  nextCursor: number | null;
  hasMore: boolean;
}
