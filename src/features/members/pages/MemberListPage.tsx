import './MemberListPage.scss';

import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Breadcrumbs, SelectElement, SvgIcon } from '@shared/ui';

import { subOrgRoleOptions } from '../components/memberRoleOptions';
import MembersTableSection from '../components/MembersTableSection';
import type { RoleType } from '../domain/types';
import { useMemberListPage } from '../hooks/useMemberListPage';

const Members = () => {
  const {
    searchWord,
    roleFilter,
    page,
    rowsPerPage,
    sortKey,
    sortOrder,
    rows,
    totalCount,
    isInitialLoading,
    hasError,
    hasPermission,
    handleSort,
    handleAdd,
    handleClearFilters,
    handleRetryFetch,
    handleSearchChange,
    handleRoleFilterChange,
    handlePageChange,
    handleRowsPerPageChange,
  } = useMemberListPage();

  return (
    <Box className="members-list">
      <Paper elevation={0} className="members-paper">
        <Box sx={{ p: 2 }}>
          <Breadcrumbs />
          <Typography variant="h4" className="members-title">
            Members
          </Typography>
        </Box>

        <Box className="members-toolbar">
          <Stack direction="row" spacing={1} alignItems="center">
            {hasPermission && (
              <Button
                variant="contained"
                className="members-btn members-add-btn"
                startIcon={
                  <SvgIcon
                    name="AddOutlineFilled"
                    sx={{ color: 'var(--primary-contrastText)' }}
                  />
                }
                onClick={handleAdd}
              >
                <Typography variant="body1">Add</Typography>
              </Button>
            )}

            <TextField
              placeholder="Search"
              value={searchWord}
              className="members-search"
              onChange={(e) => handleSearchChange(e.target.value)}
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

            <SelectElement
              value={roleFilter}
              onChange={(value) =>
                handleRoleFilterChange(value as RoleType | '')
              }
              placeholder="Org role"
              minWidth={147}
              options={subOrgRoleOptions}
            />

            <Button
              className="members-btn"
              variant="outlined"
              onClick={handleClearFilters}
            >
              <Typography variant="body1">Clear filters</Typography>
            </Button>
          </Stack>
        </Box>

        {isInitialLoading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <MembersTableSection
            rows={rows}
            totalCount={totalCount}
            page={page}
            rowsPerPage={rowsPerPage}
            sortKey={sortKey}
            sortOrder={sortOrder}
            hasError={hasError}
            onSort={handleSort}
            onRetry={handleRetryFetch}
            onClearAll={handleClearFilters}
            onMemberDeleted={handleRetryFetch}
            onPageChange={(_, newPage) => handlePageChange(newPage)}
            onRowsPerPageChange={(e) =>
              handleRowsPerPageChange(parseInt(e.target.value, 10))
            }
          />
        )}
      </Paper>
    </Box>
  );
};

export default Members;
