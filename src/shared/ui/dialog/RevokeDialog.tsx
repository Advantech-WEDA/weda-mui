import { TextField } from '@mui/material';

import ConfirmDialog from './ConfirmDialog';

interface RevokeDialogProps {
  open: boolean;
  title: string;
  content: string;

  confirmName: string;
  inputValue: string;
  inputLabel?: string;
  mismatchText?: string;
  confirmDisabled?: boolean;
  deleteLabel?: string;
  cancelLabel?: string;
  loading?: boolean;

  alert?: React.ReactNode;

  onInputChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

const RevokeDialog = ({
  open,
  title,
  content,
  confirmName,
  inputValue,
  inputLabel,
  mismatchText,
  deleteLabel = 'Delete',
  cancelLabel = 'Cancel',
  confirmDisabled,
  alert,
  onInputChange,
  onClose,
  onConfirm,
}: RevokeDialogProps) => {
  const isMatched = inputValue.trim() === confirmName.trim();

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title={title}
      content={content}
      actions={[
        {
          label: cancelLabel,
          onClick: onClose,
          variant: 'text',
          color: 'primary',
        },
        {
          label: deleteLabel,
          onClick: () => void onConfirm(),
          variant: 'text',
          color: 'primary',
          disabled: confirmDisabled,
        },
      ]}
    >
      {alert}

      <TextField
        fullWidth
        size="small"
        className="confirm-dialog__textfield"
        label={inputLabel}
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        error={inputValue.length > 0 && !isMatched}
        helperText={inputValue.length > 0 && !isMatched ? mismatchText : ''}
      />
    </ConfirmDialog>
  );
};

export default RevokeDialog;
