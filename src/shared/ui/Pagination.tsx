import './Pagination.scss';

import {
  Box,
  type SxProps,
  TablePagination,
  type TablePaginationProps,
  type Theme,
} from '@mui/material';

interface IProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: TablePaginationProps['onPageChange'];
  onRowsPerPageChange: TablePaginationProps['onRowsPerPageChange'];
  rowsPerPageOptions?: number[];
  sx?: SxProps<Theme>;

  bare?: boolean;
}

const Pagination = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [20, 50, 100],
  sx,
  bare = false,
}: IProps) => {
  const pagination = (
    <TablePagination
      component="div"
      sx={{
        fontSize: 16,
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        '& .MuiTablePagination-toolbar': {
          minHeight: 40,
          fontSize: 16,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 3,
          rowGap: 1,
          '& .MuiTablePagination-actions': {
            marginLeft: 0,
            display: 'flex',
            alignItems: 'center',
          },
        },

        '& .MuiTablePagination-select': {
          height: '40px',
          minHeight: '40px',
          lineHeight: '24px',
          px: 1.5,
          py: 1,
          m: 0,
          borderRadius: 'var(--borderRadius, 4px)',
          border:
            '1px solid var(--_components-input-outlined-enabledBorder, rgba(0, 0, 0, 0.23))',
          display: 'flex',
          alignItems: 'center',
          '& div': {
            padding: 0,
            border: 'none',
          },
        },

        '& p': {
          fontSize: '16px',
          lineHeight: '24px',
        },

        '& .MuiTablePagination-selectIcon': {
          right: '12px',
        },
      }}
      count={count}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      rowsPerPageOptions={rowsPerPageOptions}
      labelRowsPerPage={null}
      slotProps={{
        select: {
          renderValue: (value) => `Rows per page: ${value}`,
        },
      }}
    />
  );

  if (bare) {
    return <Box>{pagination}</Box>;
  }

  return <div className="page-pagination-bar">{pagination}</div>;
};

export default Pagination;
