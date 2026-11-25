import EditorForm from '../components/Editor/EditorForm';
import { useDataStreamBridgeEditorPage } from '../hooks/useDataStreamBridgeEditorPage';

export default function AddDataStreamBridgePage() {
  const editor = useDataStreamBridgeEditorPage('add');

  return <EditorForm mode="add" editor={editor} />;
}
