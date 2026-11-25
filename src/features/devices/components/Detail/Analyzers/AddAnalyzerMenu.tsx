import type { AnalyzerType } from '@features/analyzers';
import { Menu, MenuItem } from '@mui/material';

import {
  ANALYZER_TYPE_CONFIG,
  ANALYZER_TYPES,
} from '@/features/devices/components/Detail/Analyzers/analyzerDisplay';

interface IProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onSelect: (type: AnalyzerType) => void;
}

export default function AddAnalyzerMenu({
  anchorEl,
  onClose,
  onSelect,
}: IProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: {
          sx: {
            minWidth: 140,
            boxShadow: '0px 3px 8px rgba(0,0,0,0.16)',
          },
        },
      }}
    >
      {ANALYZER_TYPES.map((type) => (
        <MenuItem
          key={type}
          onClick={() => {
            onClose();
            onSelect(type);
          }}
        >
          {ANALYZER_TYPE_CONFIG[type].menuLabel}
        </MenuItem>
      ))}
    </Menu>
  );
}
