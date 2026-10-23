import { Backdrop, CircularProgress } from '@mui/material';
import { ConfirmDialog } from '@shared/ui';

interface IProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const SignOutDialog = ({ open, loading, onClose, onConfirm }: IProps) => (
  <>
    <ConfirmDialog
      open={open}
      onClose={() => !loading && onClose()}
      title="Sign out"
      content="Are you sure you want to sign out from WISE Portal?"
      actions={[
        { label: 'Cancel', onClick: onClose, disabled: loading },
        {
          label: loading ? 'Signing out...' : 'Sign out',
          onClick: onConfirm,
          disabled: loading,
        },
      ]}
    />

    <Backdrop
      open={loading}
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.modal + 1 }}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  </>
);

export default SignOutDialog;
