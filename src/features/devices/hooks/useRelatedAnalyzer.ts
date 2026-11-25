import { analyzersApi, type IAnalyzerItem } from '@features/analyzers';
import { dataStreamsApi, type IDataStreamItem } from '@features/data-streams';
import { fetchAllPages } from '@shared/api/fetchAllPages';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

export function useRelatedAnalyzer(dataStream: IDataStreamItem | null) {
  const { deviceId } = useParams<{ tenant: string; deviceId: string }>();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const { showError } = useNotification();

  const analyzerId =
    dataStream?.dataSource?.type === 'Analyzer'
      ? dataStream.dataSource.sourceEntityId
      : null;

  const [analyzer, setAnalyzer] = useState<IAnalyzerItem | null>(null);
  const [loading, setLoading] = useState(Boolean(analyzerId));
  const [dataStreams, setDataStreams] = useState<IDataStreamItem[]>([]);

  useEffect(() => {
    if (!currentOrgId || !deviceId || !analyzerId) {
      setAnalyzer(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchAnalyzer = async () => {
      setLoading(true);

      try {
        const data = await analyzersApi.getAnalyzerById(
          { orgId: currentOrgId, deviceId, analyzerId },
          controller.signal
        );

        setAnalyzer(data);
      } catch (error) {
        if (axios.isCancel(error)) return;

        setAnalyzer(null);
        showError(error instanceof Error ? error.message : String(error));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchAnalyzer();

    return () => controller.abort();
  }, [currentOrgId, deviceId, analyzerId, showError]);

  useEffect(() => {
    if (!currentOrgId || !deviceId || !analyzerId) return;

    const controller = new AbortController();

    fetchAllPages((paging) =>
      dataStreamsApi.getDataStreamsList(
        { orgId: currentOrgId, deviceId, ...paging },
        controller.signal
      )
    )
      .then((result) => setDataStreams(result.items))
      .catch((error) => {
        if (axios.isCancel(error)) return;

        console.error('[Related analyzer] data stream lookup failed:', error);
      });

    return () => controller.abort();
  }, [currentOrgId, deviceId, analyzerId]);

  const dataStreamsById = useMemo(
    () => new Map(dataStreams.map((s) => [s.dataStreamId, s])),
    [dataStreams]
  );

  return { analyzer, loading, dataStreamsById };
}
