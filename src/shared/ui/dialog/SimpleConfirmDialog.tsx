import ConfirmDialog from './ConfirmDialog';

interface IProps {
  open: boolean;
  title: string;
  content: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function SimpleConfirmDialog({
  open,
  title,
  content,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  onClose,
  onConfirm,
}: IProps) {
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
          disabled: loading,
        },
        {
          label: confirmLabel,
          onClick: () => void onConfirm(),
          variant: 'text',
          color: 'primary',
          disabled: loading,
        },
      ]}
    />
  );
}
