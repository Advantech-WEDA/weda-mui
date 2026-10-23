import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Alert, type AlertColor } from '@mui/material';
import { useSnackbar } from 'notistack';

interface NotificationOptions {
  message: string;
  severity?: AlertColor;
}

const useNotification = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const getIcon = (severity: AlertColor) => {
    if (severity === 'error') {
      return <ErrorIcon sx={{ mr: 1, width: 22, height: 22 }} />;
    }

    if (severity === 'success') {
      return <CheckCircleIcon sx={{ mr: 1, width: 22, height: 22 }} />;
    }

    return undefined;
  };

  const showNotification = ({
    message,
    severity = 'success',
  }: NotificationOptions) => {
    enqueueSnackbar(message, {
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
      autoHideDuration: 3000,
      content: (key) => (
        <Alert
          key={key}
          icon={getIcon(severity)}
          variant="filled"
          severity={severity}
          onClose={() => closeSnackbar(key)}
          sx={{ maxWidth: 350 }}
        >
          {message}
        </Alert>
      ),
    });
  };

  const showSuccess = (message: string) => {
    showNotification({ message, severity: 'success' });
  };

  const showError = (message: string) => {
    showNotification({ message, severity: 'error' });
  };

  return { showNotification, showSuccess, showError };
};

export default useNotification;
