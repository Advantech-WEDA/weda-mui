import type { SxProps, Theme } from '@mui/material';

export const DIVIDER_BORDER = '1px solid var(--divider, rgba(0, 0, 0, 0.12))';
const CLICKABLE_LAYER_BG =
  'var(--library-clickable-layer, rgba(0, 0, 0, 0.00))';

export const paperSx: SxProps<Theme> = {
  m: 2,
  overflow: 'hidden',
  borderRadius: 1,
  border: DIVIDER_BORDER,
};

export const headerCellSx: SxProps<Theme> = {
  padding: 'var(--15, 12px) var(--2, 16px)',
  fontWeight: 'var(--fontWeightMedium, 500)',
  fontSize: 'var(--font-size-0875-rem, 14px)',
  background: CLICKABLE_LAYER_BG,
  borderBottom: DIVIDER_BORDER,
};

export const labelCellSx: SxProps<Theme> = {
  width: 200,
  flexShrink: 0,
  padding: 'var(--15, 12px) var(--2, 16px) var(--15, 12px) var(--4, 32px)',
  display: 'flex',
  alignItems: 'center',
  fontWeight: 'var(--fontWeightMedium, 500)',
  fontSize: 'var(--font-size-0875-rem, 14px)',
  color: 'var(--text-primary, rgba(0, 0, 0, 0.87))',
};

export const plainLabelCellSx: SxProps<Theme> = {
  ...labelCellSx,
  padding: 'var(--15, 12px) var(--2, 16px)',
};

export const valueCellSx: SxProps<Theme> = {
  flex: 1,
  padding: 'var(--15, 12px) var(--2, 16px)',
  display: 'flex',
  alignItems: 'center',
  fontSize: 'var(--typography-body2, 14px)',
  fontWeight: 'var(--fontWeightRegular, 400)',
  color: 'var(--text-primary, rgba(0, 0, 0, 0.87))',
  wordBreak: 'break-word',
};

export const rowSx = (isLast: boolean): SxProps<Theme> => ({
  background: CLICKABLE_LAYER_BG,
  borderBottom: isLast ? 'none' : DIVIDER_BORDER,
});
