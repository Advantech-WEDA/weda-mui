import { SimpleConfirmDialog } from '@shared/ui';

import Detail from '../components/Detail';
import { useRegistryDetailPage } from '../hooks/useRegistriesPage';

export default function DetailRegistry() {
  const {
    registryData,
    registryId,
    dialogOpen,
    setDialogOpen,
    handleOpenDelete,
    handleEdit,
    handleConfirmDelete,
  } = useRegistryDetailPage();

  return (
    <>
      <Detail
        registryData={registryData}
        onDelete={handleOpenDelete}
        onEdit={handleEdit}
      />

      <SimpleConfirmDialog
        open={dialogOpen}
        title="Delete Registry"
        content={`Are you sure you want to delete registry "${registryData?.registryName}" (${registryId})? This action cannot be undone.`}
        confirmLabel="Delete"
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
