export type DataStreamDataType =
  | 'double'
  | 'integer'
  | 'boolean'
  | 'string'
  | 'long'
  | 'application/json'
  | 'application/octet-stream'
  | 'image/png'
  | 'image/jpeg'
  | 'image/jpg';

export type DataStreamManagedBy = 'System' | 'User';

export type DataStreamSourceType =
  | 'CustomDevice'
  | 'Analyzer'
  | 'WedaNode'
  | 'WedaSubNode';
