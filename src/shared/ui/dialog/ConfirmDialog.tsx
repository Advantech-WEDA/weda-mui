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
import { useEffect, useRef, useState } from 'react';

export type DialogAction = {
  label: string;

  onClick: () => void | Promise<unknown>;
  color?: 'inherit' | 'primary' | 'secondary' | 'error';
  variant?: 'text' | 'outlined' | 'contained';
  disabled?: boolean;

  isCancel?: boolean;
};

interface IProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content?: React.ReactNode;
  actions?: DialogAction[];
  children?: ReactNode;
}

type SubmitPhase = 'idle' | 'pending' | 'locked';

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  typeof (value as PromiseLike<unknown> | undefined)?.then === 'function';

const ConfirmDialog = ({
  open,
  onClose,
  title,
  content,
  actions,
  children,
}: IProps) => {
  const [phase, setPhase] = useState<SubmitPhase>('idle');

  const phaseRef = useRef<SubmitPhase>('idle');
  const openRef = useRef(open);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setPhase('idle');
  }

  useEffect(() => {
    openRef.current = open;
    if (open) phaseRef.current = 'idle';
  }, [open]);

  const updatePhase = (next: SubmitPhase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const isCancelAction = (action: DialogAction) =>
    action.isCancel ?? action.onClick === onClose;

  const handleActionClick = (action: DialogAction) => {
    if (!openRef.current || phaseRef.current === 'pending') return;

    if (isCancelAction(action)) {
      action.onClick();
      return;
    }

    if (phaseRef.current === 'locked') return;

    phaseRef.current = 'pending';
    let result: void | Promise<unknown>;
    try {
      result = action.onClick();
    } catch (error) {
      updatePhase('idle');
      throw error;
    }

    if (!isPromiseLike(result)) {
      updatePhase('locked');
      return;
    }

    setPhase('pending');
    const release = () => {
      if (phaseRef.current !== 'pending') return;
      updatePhase('idle');
    };
    result.then(release, (error: unknown) => {
      release();

      console.error(error);
    });
  };

  const handleDialogClose = () => {
    if (phaseRef.current === 'pending') return;
    onClose();
  };

  const isActionDisabled = (action: DialogAction) => {
    if (action.disabled || !open || phase === 'pending') return true;
    return phase === 'locked' && !isCancelAction(action);
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
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
            onClick={() => handleActionClick(action)}
            color={action.color || 'primary'}
            variant={action.variant || 'text'}
            disabled={isActionDisabled(action)}
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
