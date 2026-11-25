import type { AnalyzerType } from '@features/analyzers';
import type { ComponentType } from 'react';
import { useSearchParams } from 'react-router-dom';

import EditorForm from '../components/AnalyzerEditor/EditorForm';
import JavaScriptEditorForm from '../components/AnalyzerEditor/JavaScriptEditorForm';
import { useAnalyzerEditorPage } from '../hooks/useAnalyzerEditorPage';
import { useJavaScriptAnalyzerEditorPage } from '../hooks/useJavaScriptAnalyzerEditorPage';

function AddTransferFunction() {
  return <EditorForm {...useAnalyzerEditorPage('add')} />;
}

function AddJavaScript() {
  return <JavaScriptEditorForm {...useJavaScriptAnalyzerEditorPage()} />;
}

const EDITORS: Record<AnalyzerType, ComponentType> = {
  TransferFunction: AddTransferFunction,
  JavaScript: AddJavaScript,
};

const DEFAULT_TYPE: AnalyzerType = 'TransferFunction';

const parseType = (value: string | null): AnalyzerType =>
  (Object.keys(EDITORS) as AnalyzerType[]).find(
    (type) => type.toLowerCase() === value?.toLowerCase()
  ) ?? DEFAULT_TYPE;

export default function AddAnalyzer() {
  const [searchParams] = useSearchParams();
  const type = parseType(searchParams.get('type'));
  const Editor = EDITORS[type];

  return <Editor key={type} />;
}
