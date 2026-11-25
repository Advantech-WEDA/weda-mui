import EditorForm from '../components/DataStreamEditor/EditorForm';
import { useDataStreamEditorPage } from '../hooks/useDataStreamEditorPage';

export default function AddDataStream() {
  return <EditorForm {...useDataStreamEditorPage('add')} />;
}
