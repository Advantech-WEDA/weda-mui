import ConfirmDialog from './ConfirmDialog';

interface UnsavedChangesDialogProps {
  open: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
}

export default function UnsavedChangesDialog({
  open,
  onKeepEditing,
  onDiscard,
}: UnsavedChangesDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onKeepEditing}
      title="Unsaved Changes"
      content="Do you want to leave this page? Any unsaved changes will be lost."
      actions={[
        { label: 'Keep editing', onClick: onKeepEditing },
        { label: 'Don’t save', onClick: onDiscard },
      ]}
    />
  );
}
