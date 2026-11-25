import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { SimpleConfirmDialog } from '@shared/ui';

import BasicInformation from '@/features/devices/components/DataStreamEditor/BasicInformation';
import type { useAddDataStreamDialog } from '@/features/devices/hooks/useAddDataStreamDialog';

type IProps = ReturnType<typeof useAddDataStreamDialog>;

export default function AddDataStreamDialog({
  open,
  values,
  errors,
  confirmOpen,
  submitting,
  handleClose,
  handleChange,
  handleSubmit,
  handleCloseConfirm,
  handleConfirm,
}: IProps) {
  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Add DataStream</DialogTitle>

        <DialogContent
          dividers
          sx={{
            py: 2,
            px: 3,

            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{ color: 'var(--error-main, #d32f2f)' }}
          >
            * Required
          </Typography>

          <Box
            className="editor-page"
            sx={{
              p: 0,
              minHeight: 0,
              backgroundColor: 'transparent',
              '& .editor-page__form': { p: 0, maxWidth: 'none' },
            }}
          >
            <BasicInformation
              mode="add"
              values={values}
              errors={errors}
              isSystemManaged={false}
              disabled={submitting}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>

        <DialogActions className="confirm-dialog-actions">
          <Button
            onClick={handleClose}
            className="confirm-dialog__button"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="confirm-dialog__button"
            disabled={submitting}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <SimpleConfirmDialog
        open={confirmOpen}
        title="Add DataStream"
        content="Are you sure you want to add this DataStream?"
        confirmLabel="Add"
        loading={submitting}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirm}
      />
    </>
  );
}
