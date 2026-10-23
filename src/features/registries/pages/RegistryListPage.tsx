import { Stack, Typography } from '@mui/material';
import {
  PageActionButton,
  PageListLayout,
  PageSearchField,
  SelectElement,
  SimpleConfirmDialog,
  SvgIcon,
} from '@shared/ui';

import TableSection from '../components/TableSection';
import { registryOptions, type RegistryType } from '../domain/types';
import { useRegistriesPage } from '../hooks/useRegistriesPage';

export default function Registries() {
  const {
    hasPermission,
    searchWord,
    setSearchWord,
    typeFilter,
    handleTypeFilterChange,
    handleAdd,
    handleClearFilters,
    tableSectionProps,
    dialogOpen,
    selectedItem,
    handleClose,
    handleConfirmDelete,
  } = useRegistriesPage();

  return (
    <PageListLayout
      title="Registries"
      toolbar={
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          {hasPermission && (
            <PageActionButton
              variant="contained"
              startIcon={
                <SvgIcon
                  name="Add"
                  className="page-action-btn__icon"
                  sx={{ color: 'var(--primary-contrastText)' }}
                />
              }
              onClick={handleAdd}
            >
              <Typography variant="button" className="page-action-btn--add">
                Add
              </Typography>
            </PageActionButton>
          )}

          <PageSearchField
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
          />

          <SelectElement
            value={typeFilter}
            onChange={(value) =>
              handleTypeFilterChange(value as RegistryType | '')
            }
            placeholder="Type"
            minWidth={120}
            options={registryOptions}
          />

          <PageActionButton variant="outlined" onClick={handleClearFilters}>
            <Typography variant="button" className="page-action-btn--clear">
              Clear filters
            </Typography>
          </PageActionButton>
        </Stack>
      }
    >
      <TableSection {...tableSectionProps} />

      <SimpleConfirmDialog
        open={dialogOpen}
        title="Warning: Deleting a registry may cause deployment failures for stacks that reference images from this registry."
        content={`Are you sure you want to delete registry "${selectedItem?.registryName}" (${selectedItem?.registryId})?`}
        confirmLabel="Delete"
        onClose={handleClose}
        onConfirm={handleConfirmDelete}
      />
    </PageListLayout>
  );
}
