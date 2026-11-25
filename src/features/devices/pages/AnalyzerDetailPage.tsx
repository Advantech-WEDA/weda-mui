import { RevokeDialog } from '@shared/ui';

import DetailContent from '../components/AnalyzerDetail/DetailContent';
import { useAnalyzerDetailPage } from '../hooks/useAnalyzerDetailPage';

export default function AnalyzerDetailPage() {
  const {
    deleteOpen,
    inputValue,
    deleteTargetName,
    canConfirmDelete,
    setInputValue,
    handleCloseDelete,
    handleConfirmDelete,
    ...detail
  } = useAnalyzerDetailPage();

  return (
    <>
      <DetailContent {...detail} />

      <RevokeDialog
        open={deleteOpen}
        title="Delete Analyzer"
        content={`Are you sure you want to delete Analyzer "${deleteTargetName}"?`}
        inputLabel="Re-enter the Analyzer name to confirm deletion"
        mismatchText="Analyzer name does not match."
        confirmName={deleteTargetName}
        confirmDisabled={!canConfirmDelete}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
