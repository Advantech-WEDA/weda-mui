import MemberEditorForm from '../components/MemberEditorForm';
import { useMemberEditorPage } from '../hooks/useMemberEditorPage';

export default function AddMember() {
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
  } = useMemberEditorPage('add');

  return (
    <MemberEditorForm
      mode="add"
      members={members}
      selectedIds={selectedIds}
      searchKeyword={searchInput}
      page={page}
      rowsPerPage={rowsPerPage}
      totalCount={totalCount}
      loading={loading}
      error={error}
      dialogOpen={dialogOpen}
      dialogSubmitOpen={dialogSubmitOpen}
      hasPermission={hasPermission}
      onSearchChange={handleSearchChange}
      onToggleAll={toggleAll}
      onToggleOne={toggleOne}
      onRoleChange={handleRoleChange}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      onOpenDialog={() => setDialogOpen(true)}
      onOpenSubmitDialog={() => setDialogSubmitOpen(true)}
      onCloseDialog={() => setDialogOpen(false)}
      onCloseSubmitDialog={() => setDialogSubmitOpen(false)}
      onSubmit={handleSubmit}
      onClearFilters={handleClearFilters}
    />
  );
}
