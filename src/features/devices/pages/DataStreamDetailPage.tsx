import { RevokeDialog } from '@shared/ui';

import DetailContent from '../components/DataStreamDetail/DetailContent';
import { useDataStreamDetailPage } from '../hooks/useDataStreamDetailPage';

export default function DataStreamDetailPage() {
  const {
    deleteOpen,
    inputValue,
    deleteTargetName,
    deleteConfirmName,
    canConfirmDelete,
    setInputValue,
    handleCloseDelete,
    handleConfirmDelete,
    ...detail
  } = useDataStreamDetailPage();

  return (
    <>
      <DetailContent {...detail} />

      <RevokeDialog
        open={deleteOpen}
        title="Delete DataStream"
        content={`Are you sure you want to delete DataStream "${deleteTargetName}"?`}
        inputLabel="Re-enter the Display name or DataStream name to confirm deletion"
        mismatchText="Display name or DataStream name does not match."
        confirmName={deleteConfirmName}
        confirmDisabled={!canConfirmDelete}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
