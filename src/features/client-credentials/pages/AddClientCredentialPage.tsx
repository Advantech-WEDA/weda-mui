import './AddClientCredentialPage.scss';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ScrollSideTabs } from '@shared/ui';
import { useRef } from 'react';

import AddBasicInformation from '../components/AddBasicInformation';
import AddScopes from '../components/AddScopes';
import { useAddClientCredentialPage } from '../hooks/useAddClientCredentialPage';

const TAB_ITEMS = [
  { key: 'basic', label: 'Basic information' },
  { key: 'scopes', label: 'Scopes' },
];

export default function AddClientCredential() {
  const {
    basicInfo,
    scopes,
    scopeError,
    nameError,
    openDialog,
    clientData,
    handleBasicChange,
    handleScopeChange,
    handleSubmit,
    handleCloseDialog,
    handleCancel,
    handleCopy,
  } = useAddClientCredentialPage();

  const basicRef = useRef<HTMLDivElement | null>(null);
  const scopesRef = useRef<HTMLDivElement | null>(null);
  const sections = [
    {
      key: 'basic',
      ref: basicRef,
      id: 'basic-section',
    },
    {
      key: 'scopes',
      ref: scopesRef,
      id: 'scopes-section',
    },
  ];

  return (
    <Box className="add-client">
      <Paper className="add-client-paper" elevation={0}>
        <Box className="add-client-header">
          <Box className="add-client-title-wrap">
            <Typography
              variant="h4"
              sx={{ fontSize: '32px' }}
              className="add-client-title"
            >
              Add Client Credential
            </Typography>

            <Typography
              sx={{ fontSize: '14px' }}
              className="add-client-required"
            >
              *Required
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              className="add-client-button"
              sx={{
                textTransform: 'none',
                px: 2,
                py: 1,
                minWidth: 81,
                fontSize: 15,
                height: 42,
              }}
              onClick={handleCancel}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              className="add-client-button"
              onClick={handleSubmit}
              sx={{
                textTransform: 'none',
                px: 2,
                py: 1,
                minWidth: 83,
                fontSize: 15,
                height: 42,
              }}
            >
              Submit
            </Button>
          </Stack>
        </Box>

        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box className="add-client-body" sx={{ flexShrink: 0, flex: 1 }}>
            <Box id="basic-section" ref={basicRef}>
              <AddBasicInformation
                value={basicInfo}
                onChange={handleBasicChange}
                error={nameError}
              />
            </Box>
            <Box id="scopes-section" ref={scopesRef}>
              <AddScopes
                scopes={scopes}
                onScopeChange={handleScopeChange}
                error={scopeError}
              />

              <Stack className="add-client-bottom" direction="row" spacing={1}>
                <Button size="small" variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="small" variant="contained" onClick={handleSubmit}>
                  Submit
                </Button>
              </Stack>
            </Box>
          </Box>

          <Box
            sx={{
              width: 272,
              pr: 2,
            }}
          >
            <ScrollSideTabs sections={sections} tabItems={TAB_ITEMS} />
          </Box>
        </Box>
      </Paper>

      <Dialog
        open={openDialog}
        onClose={(_, reason) => {
          if (reason === 'backdropClick') return;
          handleCloseDialog();
        }}
        slotProps={{
          paper: {
            className: 'confirm-dialog',
          },
        }}
        sx={{ zIndex: 2000 }}
      >
        <DialogTitle className="confirm-dialog__title">
          Client Credential Created
        </DialogTitle>

        <DialogContent className="confirm-dialog__content">
          <Typography className="confirm-dialog__message">
            Copy your client secret now. You won’t be able to view it again.
          </Typography>

          <TextField
            label="Client ID"
            fullWidth
            size="small"
            className="confirm-dialog__textfield"
            margin="normal"
            value={clientData?.clientId || ''}
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                  <IconButton
                    className="confirm-dialog__icon_button"
                    onClick={() => handleCopy(clientData?.clientId || '')}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                ),
              },
            }}
          />

          <TextField
            label="Client secret"
            fullWidth
            size="small"
            className="confirm-dialog__textfield"
            margin="normal"
            value={clientData?.clientSecret || ''}
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                  <IconButton
                    className="confirm-dialog__icon_button"
                    onClick={() => handleCopy(clientData?.clientSecret || '')}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                ),
              },
            }}
          />
        </DialogContent>

        <DialogActions className="confirm-dialog__actions">
          <Button
            className="confirm-dialog__button"
            onClick={handleCloseDialog}
          >
            Close
          </Button>
          <Button
            className="confirm-dialog__button"
            onClick={() =>
              handleCopy(
                `Client ID: ${clientData?.clientId || ''}\nClient Secret: ${clientData?.clientSecret || ''}`
              )
            }
          >
            Copy to clipboard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
