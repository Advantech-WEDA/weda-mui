import { Backdrop, CircularProgress, Portal, Typography } from '@mui/material';
import { usePendingWritesStore } from '@shared/api/pendingWrites';

export default function GlobalLoadingOverlay() {
  const pending = usePendingWritesStore((s) => s.count > 0);

  return (
    <Portal>
      <Backdrop
        open={pending}
        sx={{
          color: '#fff',
          zIndex: 2100,
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress color="inherit" />
        <Typography variant="body1" color="inherit">
          Loading...
        </Typography>
      </Backdrop>
    </Portal>
  );
}
