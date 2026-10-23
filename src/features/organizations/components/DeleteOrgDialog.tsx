import { Box } from '@mui/material';
import { RevokeDialog, SvgIcon } from '@shared/ui';

interface DeleteOrgDialogProps {
  open: boolean;
  orgName: string;
  inputValue: string;
  deviceCount: number | null;
  loadingDevices: boolean;
  canDelete: boolean;
  onInputChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteOrgDialog({
  open,
  orgName,
  inputValue,
  deviceCount,
  loadingDevices,
  canDelete,
  onInputChange,
  onClose,
  onConfirm,
}: DeleteOrgDialogProps) {
  const alert =
    !loadingDevices && deviceCount !== null ? (
      <Box
        className={`confirm-dialog__msg ${
          deviceCount === 0
            ? 'confirm-dialog__msg-success'
            : 'confirm-dialog__msg-error'
        }`}
      >
        <SvgIcon
          name={deviceCount === 0 ? 'CheckCircleFilled' : 'CancelFilled'}
          sx={{
            color:
              deviceCount === 0 ? 'var(--success-main)' : 'var(--error-main)',
          }}
        />
        {deviceCount === 0
          ? 'This organization has no devices and is eligible for deletion.'
          : `This organization has ${deviceCount} device(s) and cannot be deleted.`}
      </Box>
    ) : null;

  return (
    <RevokeDialog
      open={open}
      onClose={onClose}
      title="Delete Sub-organization"
      content={`Are you sure you want to delete "${orgName}"? This action cannot be undone. The organization and all associated data will be permanently deleted.`}
      inputLabel="Re-enter the organization name to confirm deletion"
      mismatchText="Organization name does not match."
      confirmName={orgName}
      inputValue={inputValue}
      confirmDisabled={!canDelete}
      onInputChange={onInputChange}
      onConfirm={onConfirm}
      alert={alert}
    />
  );
}
