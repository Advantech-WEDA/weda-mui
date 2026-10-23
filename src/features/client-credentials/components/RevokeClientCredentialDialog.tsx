import { TextField } from '@mui/material';
import { ConfirmDialog } from '@shared/ui';

interface IProps {
  open: boolean;
  onClose: () => void;
  credentialName: string;
  inputValue: string;

  setInputValue: (value: string) => void;
  onConfirm: () => void | Promise<void>;
}

const RevokeClientCredentialDialog = ({
  open,
  onClose,
  credentialName,
  inputValue,
  setInputValue,
  onConfirm,
}: IProps) => {
  const isMatched = inputValue.trim() === credentialName.trim();

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Revoke Client Credential"
      content={
        <span style={{ whiteSpace: 'pre-wrap' }}>
          {`Are you sure you want to revoke “${credentialName}”? This action cannot be undone. Any applications or scripts using these credentials will immediately lose access to the API.`}
        </span>
      }
      actions={[
        {
          label: 'Cancel',
          onClick: onClose,
          variant: 'text',
          color: 'primary',
        },
        {
          label: 'Revoke',
          onClick: () => {
            void onConfirm();
          },
          variant: 'text',
          color: 'primary',
          disabled: !isMatched,
        },
      ]}
    >
      <TextField
        fullWidth
        size="small"
        className="confirm-dialog__textfield"
        label="Re-enter the credential name to confirm revocation"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        error={inputValue.length > 0 && !isMatched}
        helperText={
          inputValue.length > 0 && !isMatched
            ? 'Credential name does not match'
            : ' '
        }
      />
    </ConfirmDialog>
  );
};

export default RevokeClientCredentialDialog;
