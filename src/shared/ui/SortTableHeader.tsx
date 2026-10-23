import { Stack, TableCell } from '@mui/material';

import SvgIcon from './SvgIcon';

export type SortOrder = 'asc' | 'desc';

export type Column<TSortKey extends string = string> =
  | { sortKey: TSortKey; label: string; width?: number | string }
  | { sortKey?: never; label: string; width?: number | string };

interface IProps {
  label: string;
  width?: string;
  minWidth?: string;
  active: boolean;
  order: SortOrder;
  onClick: () => void;
  align?: 'left' | 'right' | 'center';
}

const SortTableHeader = ({
  label,
  width,
  minWidth,
  active,
  order,
  onClick,
  align,
}: IProps) => {
  return (
    <TableCell
      align={align}
      onClick={onClick}
      sx={{
        width,
        minWidth,
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
      }}
    >
      <Stack direction="row" spacing={0.5} alignItems="end">
        <span>{label}</span>
        {active ? (
          order === 'asc' ? (
            <SvgIcon
              name="ArrowUpwardFilled"
              sx={{ color: 'var(--action-active)' }}
            />
          ) : (
            <SvgIcon
              name="ArrowDownwardFilled"
              sx={{ color: 'var(--action-active)' }}
            />
          )
        ) : null}
      </Stack>
    </TableCell>
  );
};

export default SortTableHeader;
