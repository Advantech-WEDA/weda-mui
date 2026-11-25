import { useState } from 'react';

import RevokeDialog from './RevokeDialog';

interface IProps {
  open: boolean;
  title: string;
  content: string;

  confirmName: string;

  nameLabel?: string;
  inputLabel?: string;
  mismatchText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function DeleteConfirmDialog({
  open,
  title,
  content,
  confirmName,
  nameLabel = 'name',
  inputLabel,
  mismatchText,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading = false,
  onClose,
  onConfirm,
}: IProps) {
  const [inputValue, setInputValue] = useState('');

  const isMatched =
    confirmName.trim().length > 0 && inputValue.trim() === confirmName.trim();

  const capitalized = nameLabel.charAt(0).toUpperCase() + nameLabel.slice(1);

  return (
    <RevokeDialog
      open={open}
      title={title}
      content={content}
      confirmName={confirmName}
      inputLabel={
        inputLabel ?? `Re-enter the ${nameLabel} name to confirm deletion`
      }
      mismatchText={mismatchText ?? `${capitalized} name does not match.`}
      deleteLabel={confirmLabel}
      cancelLabel={cancelLabel}
      confirmDisabled={!isMatched || loading}
      inputValue={inputValue}
      onInputChange={setInputValue}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
