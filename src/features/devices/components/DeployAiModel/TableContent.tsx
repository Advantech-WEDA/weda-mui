import { Checkbox, MenuItem, Select, TableCell, TableRow } from '@mui/material';

import type { AiModelDeployTableRow } from '@/features/devices/domain/types';

interface IProps {
  row: AiModelDeployTableRow;
  selected: boolean;
  hasPermission: boolean;
  onSelect: (modelId: string) => void;
  onEditionChange: (modelId: string, edition: string) => void;
}

export default function TableContent({
  row,
  selected,
  hasPermission,
  onSelect,
  onEditionChange,
}: IProps) {
  const isRowSelectable = row.editions.some((edition) => !edition.disabled);
  const selectedEditionOption = row.editions.find(
    (edition) => edition.edition === row.selectedEdition
  );

  return (
    <TableRow hover selected={selected}>
      <TableCell>
        <Checkbox
          size="small"
          checked={selected}
          disabled={!hasPermission || !isRowSelectable}
          onChange={() => onSelect(row.modelId)}
        />
      </TableCell>

      <TableCell sx={{ padding: 'var(--padding--1) var(--padding--2)' }}>
        {row.modelName}
      </TableCell>

      <TableCell sx={{ padding: 'var(--padding--1) var(--padding--2)' }}>
        <Select
          size="small"
          value={row.selectedEdition}
          disabled={!isRowSelectable}
          onChange={(e) => onEditionChange(row.modelId, e.target.value)}
          sx={{
            width: 168,
            height: 40,
            backgroundColor: '#fff',
          }}
        >
          {row.editions.map((option) => (
            <MenuItem
              key={option.edition}
              value={option.edition}
              disabled={option.disabled}
            >
              {option.edition}
              {option.disabled ? ' (Deployed)' : ''}
            </MenuItem>
          ))}
        </Select>
      </TableCell>

      <TableCell sx={{ padding: 'var(--padding--1) var(--padding--2)' }}>
        {selectedEditionOption?.fileName ?? '-'}
      </TableCell>
    </TableRow>
  );
}
