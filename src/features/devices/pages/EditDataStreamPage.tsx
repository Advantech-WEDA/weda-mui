import EditorForm from '../components/DataStreamEditor/EditorForm';
import { useDataStreamEditorPage } from '../hooks/useDataStreamEditorPage';

export default function EditDataStream() {
  return <EditorForm {...useDataStreamEditorPage('edit')} />;
}
