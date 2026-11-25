import type { IAnalyzerItem } from '@features/analyzers';
import type { IDataStreamItem } from '@features/data-streams';
import { Typography } from '@mui/material';

import JavaScriptDetail from './JavaScriptDetail';
import TransferFunctionDetail from './TransferFunctionDetail';

interface IProps {
  analyzer: IAnalyzerItem;
  dataStreamsById: Map<string, IDataStreamItem>;
}

export default function AnalyzerDetailBody({
  analyzer,
  dataStreamsById,
}: IProps) {
  switch (analyzer.type) {
    case 'TransferFunction':
      return (
        <TransferFunctionDetail
          analyzer={analyzer}
          dataStreamsById={dataStreamsById}
        />
      );
    case 'JavaScript':
      return (
        <JavaScriptDetail
          analyzer={analyzer}
          dataStreamsById={dataStreamsById}
        />
      );
    default:
      return (
        <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
          {analyzer.type} analyzer details are not supported yet.
        </Typography>
      );
  }
}
