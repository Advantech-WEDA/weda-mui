import './PageTableLoadingIndicator.scss';

import { CircularProgress } from '@mui/material';

interface IProps {
  size?: number;
}

const PageTableLoadingIndicator = ({ size = 24 }: IProps) => {
  return (
    <div className="page-table-loading-indicator">
      <CircularProgress size={size} />
    </div>
  );
};

export default PageTableLoadingIndicator;
