import {
  Box,
  Button,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Breadcrumbs, SvgIcon } from '@shared/ui';

import DeleteOrgDialog from '../components/DeleteOrgDialog';
import TableSection from '../components/TableSection';
import { useOrganizationListPage } from '../hooks/useOrganizationListPage';

export default function Organizations() {
  const {
    rows,
    isLoading,
    hasError,
    searchWord,
    canCreateRootOrg,
    deleteDialog,
    setSearchWord,
    handleAdd,
    handleEdit,
    handleClearFilters,
    handleRetryFetch,
  } = useOrganizationListPage();

  return (
    <Box className="page-list">
      <Paper elevation={0} className="page-paper">
        <Box sx={{ p: 2, gap: '8px' }}>
          <Breadcrumbs />
          <Typography variant="h4" className="page-title">
            Organizations
          </Typography>
        </Box>

        <Box className="page-toolbar">
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="contained"
              className="page-btn"
              startIcon={
                <SvgIcon
                  name="Add"
                  sx={{ color: 'var(--primary-contrastText)' }}
                />
              }
              disabled={!canCreateRootOrg}
              onClick={handleAdd}
            >
              <Typography variant="body1">Add</Typography>
            </Button>

            <TextField
              placeholder="Search"
              value={searchWord}
              className="page-search"
              onChange={(e) => setSearchWord(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SvgIcon
                        name="SearchFilled"
                        sx={{ color: 'var(--action-active)' }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              variant="outlined"
              className="page-btn"
              onClick={handleClearFilters}
            >
              Clear all
            </Button>
          </Stack>
        </Box>

        <TableSection
          rows={rows}
          loading={isLoading}
          hasError={hasError}
          onClearAll={handleClearFilters}
          onRetry={handleRetryFetch}
          onEditOrg={handleEdit}
          onDeleteOrg={deleteDialog.handleOpenDialog}
        />
      </Paper>

      <DeleteOrgDialog
        open={deleteDialog.dialogOpen}
        orgName={deleteDialog.orgName}
        inputValue={deleteDialog.inputValue}
        deviceCount={deleteDialog.deviceCount}
        loadingDevices={deleteDialog.loading}
        canDelete={deleteDialog.canDelete}
        onInputChange={deleteDialog.setInputValue}
        onClose={deleteDialog.handleClose}
        onConfirm={deleteDialog.handleConfirm}
      />
    </Box>
  );
}
