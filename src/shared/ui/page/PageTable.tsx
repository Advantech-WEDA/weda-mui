import './PageTable.scss';

import {
  Paper,
  type SxProps,
  Table,
  TableContainer,
  TableRow,
  type TableRowProps,
  type Theme,
} from '@mui/material';
import clsx from 'clsx';
import type { ReactNode } from 'react';

interface IProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
}

const PageTable = ({ children, sx }: IProps) => {
  return (
    <TableContainer className="page-table" component={Paper} elevation={0}>
      <Table sx={sx}>{children}</Table>
    </TableContainer>
  );
};

export const PageTableRow = ({ className, ...props }: TableRowProps) => {
  return (
    <TableRow
      className={clsx('page-table__row', className)}
      {...props}
    ></TableRow>
  );
};

export default PageTable;
