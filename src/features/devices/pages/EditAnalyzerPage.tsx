import { analyzersApi, type IAnalyzerItem } from '@features/analyzers';
import { Box } from '@mui/material';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { PageTableLoadingIndicator, useNotification } from '@shared/ui';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import EditorForm from '../components/AnalyzerEditor/EditorForm';
import JavaScriptEditorForm from '../components/AnalyzerEditor/JavaScriptEditorForm';
import { useAnalyzerEditorPage } from '../hooks/useAnalyzerEditorPage';
import { useJavaScriptAnalyzerEditorPage } from '../hooks/useJavaScriptAnalyzerEditorPage';

function EditTransferFunction() {
  return <EditorForm {...useAnalyzerEditorPage('edit')} />;
}

function EditJavaScript({ analyzer }: { analyzer: IAnalyzerItem }) {
  return (
    <JavaScriptEditorForm {...useJavaScriptAnalyzerEditorPage(analyzer)} />
  );
}

export default function EditAnalyzer() {
  const { deviceId, analyzerId } = useParams<{
    tenant: string;
    deviceId: string;
    analyzerId: string;
  }>();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const { showError } = useNotification();

  const [analyzer, setAnalyzer] = useState<IAnalyzerItem | null>(null);

  useEffect(() => {
    if (!currentOrgId || !deviceId || !analyzerId) return;

    const controller = new AbortController();

    analyzersApi
      .getAnalyzerById(
        { orgId: currentOrgId, deviceId, analyzerId },
        controller.signal
      )
      .then(setAnalyzer)
      .catch((error) => {
        if (axios.isCancel(error)) return;

        showError(error instanceof Error ? error.message : String(error));
      });

    return () => controller.abort();
  }, [currentOrgId, deviceId, analyzerId, showError]);

  if (!analyzer) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <PageTableLoadingIndicator />
      </Box>
    );
  }

  return analyzer.type === 'JavaScript' ? (
    <EditJavaScript key={analyzer.analyzerId} analyzer={analyzer} />
  ) : (
    <EditTransferFunction key={analyzer.analyzerId} />
  );
}
