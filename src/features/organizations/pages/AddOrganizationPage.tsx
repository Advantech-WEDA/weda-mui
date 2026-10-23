import EditorForm from '../components/EditorForm';
import { useOrganizationEditorPage } from '../hooks/useOrganizationEditorPage';

export default function AddOrganization() {
  const {
    parentOrgId,
    effectiveParentOrgId,
    orgName,
    description,
    parentOptions,
    orgTreeNodes,
    canSelectEmptyParent,
    canSubmit,
    currentUserId,
    adminOptions,
    selectedAdmins,
    submitting,
    setParentOrgId,
    setOrgName,
    setDescription,
    setSelectedAdmins,
    handleSubmit,
    handleCancel,
  } = useOrganizationEditorPage('add');

  return (
    <EditorForm
      mode="add"
      parentOrgId={parentOrgId}
      effectiveParentOrgId={effectiveParentOrgId}
      orgName={orgName}
      description={description}
      parentOptions={parentOptions}
      orgTreeNodes={orgTreeNodes}
      canSelectEmptyParent={canSelectEmptyParent}
      adminOptions={adminOptions}
      selectedAdmins={selectedAdmins}
      currentUserId={currentUserId}
      canSubmit={canSubmit}
      submitting={submitting}
      onParentChange={setParentOrgId}
      onOrgNameChange={setOrgName}
      onDescriptionChange={setDescription}
      onAdminsChange={setSelectedAdmins}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
