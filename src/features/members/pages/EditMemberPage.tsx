import MemberEditorForm from '../components/MemberEditorForm';
import { useMemberEditorPage } from '../hooks/useMemberEditorPage';

export default function EditMember() {
  const {
    members,
    selectedIds,
    searchInput,
    page,
    rowsPerPage,
    totalCount,
    loading,
    error,
    dialogOpen,
    dialogSubmitOpen,
    hasPermission,
    setDialogOpen,
    setDialogSubmitOpen,
    handleSearchChange,
    toggleAll,
    toggleOne,
    handleRoleChange,
    handlePageChange,
    handleRowsPerPageChange,
    handleSubmit,
    handleClearFilters,
  } = useMemberEditorPage('edit');

  return (
    <MemberEditorForm
      mode="edit"
      members={members}
      selectedIds={selectedIds}
      searchKeyword={searchInput}
      page={page}
      rowsPerPage={rowsPerPage}
      totalCount={totalCount}
      loading={loading}
      error={error}
      hasPermission={hasPermission}
      dialogOpen={dialogOpen}
      dialogSubmitOpen={dialogSubmitOpen}
      onSearchChange={handleSearchChange}
      onToggleAll={toggleAll}
      onToggleOne={toggleOne}
      onRoleChange={handleRoleChange}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      onOpenDialog={() => setDialogOpen(true)}
      onCloseDialog={() => setDialogOpen(false)}
      onOpenSubmitDialog={() => setDialogSubmitOpen(true)}
      onCloseSubmitDialog={() => setDialogSubmitOpen(false)}
      onSubmit={handleSubmit}
      onClearFilters={handleClearFilters}
    />
  );
}
