import type { ContainerStackTableRow } from '@features/container-stacks';
import {
  Checkbox,
  MenuItem,
  Select,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';

interface IProps {
  row: ContainerStackTableRow;
  selected: boolean;
  hasPermission: boolean;
  onSelect: (stackConfigId: string) => void;
  onVersionChange: (stackConfigId: string, version: number) => void;
  disabledRevisionIds: Set<string>;
}

export default function TableContent({
  row,
  selected,
  hasPermission,
  onSelect,
  onVersionChange,
  disabledRevisionIds,
}: IProps) {
  const isVersionDeployed = disabledRevisionIds.has(
    row.currentVersion.stackRevisionId
  );

  return (
    <TableRow hover selected={selected}>
      <TableCell>
        <Checkbox
          size="small"
          checked={selected}
          disabled={!hasPermission || isVersionDeployed}
          onChange={() => onSelect(row.stackConfigId)}
        />
      </TableCell>

      <TableCell sx={{ padding: 'var(--padding--1) var(--padding--2)' }}>
        <Typography variant="body2" className="page-table__info-name">
          {row.stackName ?? '-'}
        </Typography>
      </TableCell>

      <TableCell sx={{ padding: 'var(--padding--1) var(--padding--2)' }}>
        <Select
          size="small"
          value={row.selectedVersion}
          onChange={(e) =>
            onVersionChange(row.stackConfigId, Number(e.target.value))
          }
          sx={{
            width: 168,
            height: 40,
            backgroundColor: '#fff',
          }}
        >
          {row.versions.map((item, index) => (
            <MenuItem
              key={item.stackRevisionId}
              value={item.version}
              disabled={disabledRevisionIds.has(item.stackRevisionId)}
            >
              v{item.version}
              {index === 0 ? ' (Latest)' : ''}
            </MenuItem>
          ))}
        </Select>
      </TableCell>

      <TableCell sx={{ padding: 'var(--padding--1) var(--padding--2)' }}>
        {row.type}
      </TableCell>
    </TableRow>
  );
}
