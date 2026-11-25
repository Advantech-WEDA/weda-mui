import EditorForm from '../components/Editor/EditorForm';
import { useDataStreamBridgeEditorPage } from '../hooks/useDataStreamBridgeEditorPage';

export default function EditDataStreamBridgePage() {
  const editor = useDataStreamBridgeEditorPage('edit');

  return <EditorForm mode="edit" editor={editor} />;
}
