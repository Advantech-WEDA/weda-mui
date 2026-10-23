import './ConfirmDialog.scss';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';

export type DialogAction = {
  label: string;
  onClick: () => void;
  color?: 'inherit' | 'primary' | 'secondary' | 'error';
  variant?: 'text' | 'outlined' | 'contained';
  disabled?: boolean;
};

interface IProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content?: React.ReactNode;
  actions?: DialogAction[];
  children?: ReactNode;
}

const ConfirmDialog = ({
  open,
  onClose,
  title,
  content,
  actions,
  children,
}: IProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          className: 'confirm-dialog',
        },
      }}
      sx={{ zIndex: 2000 }}
      disableRestoreFocus
      disableEnforceFocus
    >
      <DialogTitle className="confirm-dialog__title">{title}</DialogTitle>

      <DialogContent className="confirm-dialog__content">
        {content && (
          <Typography className="confirm-dialog__message">{content}</Typography>
        )}

        {children && <Box className="confirm-dialog__extra">{children}</Box>}
      </DialogContent>

      <DialogActions className="confirm-dialog-actions">
        {actions?.map((action, idx) => (
          <Button
            key={`${action.label}-${idx}`}
            onClick={action.onClick}
            color={action.color || 'primary'}
            variant={action.variant || 'text'}
            disabled={action.disabled}
            className="confirm-dialog__button"
            sx={{ textTransform: 'none' }}
          >
            {action.label}
          </Button>
        ))}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
