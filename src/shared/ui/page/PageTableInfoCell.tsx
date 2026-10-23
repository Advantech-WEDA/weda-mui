import './PageTableInfoCell.scss';

import { Box, TableCell, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface IProps {
  primary: ReactNode;
  secondary?: ReactNode;
}

const PageTableInfoCell = ({ primary, secondary }: IProps) => {
  return (
    <Box>
      <Typography variant="body2" className="page-table-info-cell__primary">
        {primary}
      </Typography>

      {secondary && (
        <Typography
          variant="body2"
          color="text.secondary"
          className="page-table-info-cell__secondary"
        >
          {secondary}
        </Typography>
      )}
    </Box>
  );
};

export const PageTableEllipsisCell = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <TableCell className="page-table-info-cell__ellipsis">{children}</TableCell>
  );
};

export default PageTableInfoCell;
