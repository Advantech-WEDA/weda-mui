import { dataStreamsApi } from '@features/data-streams';
import { devicesApi } from '@features/devices';
import { fetchAllPages, MAX_PAGE_SIZE } from '@shared/api/fetchAllPages';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import { useEffect, useMemo, useRef, useState } from 'react';

import { dataStreamBridgesApi } from '../api/dataStreamBridges.api';
import type { IDataStreamBridgeDetail } from '../api/dataStreamBridges.api.types';

export const DATA_STREAMS_REFRESH_INTERVAL = 5000;

export interface BridgeDataStreamRow {
  index: number;
  deviceId: string;
  deviceName: string;
  dataStreamId: string;
  dataStreamName: string;
  targetJsonPath: string;
}

interface IParams {
  bridgeId?: string;
  bridgeData: IDataStreamBridgeDetail | null;
  hasPermission: boolean;
  fetchBridge: (options?: {
    signal?: AbortSignal;
    silent?: boolean;
  }) => Promise<boolean>;
}

export function useBridgeDataStreamsTab({
  bridgeId,
  bridgeData,
  hasPermission,
  fetchBridge,
}: IParams) {
  const navigate = useAppNavigate();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const { showError, showSuccess } = useNotification();

  const [searchWord, setSearchWord] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [deviceNames, setDeviceNames] = useState<Record<string, string>>({});
  const [streamNames, setStreamNames] = useState<Record<string, string>>({});
  const requestedDeviceIds = useRef(new Set<string>());

  const [devicesDone, setDevicesDone] = useState(false);
  const [resolvedDeviceIds, setResolvedDeviceIds] = useState<Set<string>>(
    new Set()
  );

  const [deleteTarget, setDeleteTarget] = useState<BridgeDataStreamRow | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  const bindings = useMemo(() => bridgeData?.bindings ?? [], [bridgeData]);

  useEffect(() => {
    const timer = window.setInterval(
      () => void fetchBridge({ silent: true }),
      DATA_STREAMS_REFRESH_INTERVAL
    );

    return () => window.clearInterval(timer);
  }, [fetchBridge]);

  useEffect(() => {
    if (!currentOrgId) return;

    const controller = new AbortController();

    fetchAllPages(
      (paging) =>
        devicesApi.getDevices(
          { orgId: currentOrgId, ...paging },
          controller.signal
        ),
      MAX_PAGE_SIZE
    )
      .then((data) =>
        setDeviceNames(
          Object.fromEntries(
            data.items.map((device) => [device.deviceId, device.deviceName])
          )
        )
      )

      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setDevicesDone(true);
      });

    return () => controller.abort();
  }, [currentOrgId]);

  useEffect(() => {
    if (!currentOrgId) return;

    const deviceIds = new Set(bindings.map((binding) => binding.deviceId));

    deviceIds.forEach((deviceId) => {
      if (!deviceId || requestedDeviceIds.current.has(deviceId)) return;

      requestedDeviceIds.current.add(deviceId);

      fetchAllPages(
        (paging) =>
          dataStreamsApi.getDataStreamsList({
            orgId: currentOrgId,
            deviceId,
            ...paging,
          }),
        MAX_PAGE_SIZE
      )
        .then((data) =>
          setStreamNames((prev) => ({
            ...prev,
            ...Object.fromEntries(
              data.items.map((stream) => [
                stream.dataStreamId,
                stream.dataStreamName ||
                  stream.displayName ||
                  stream.dataStreamId,
              ])
            ),
          }))
        )

        .catch(() => requestedDeviceIds.current.delete(deviceId))
        .finally(() =>
          setResolvedDeviceIds((prev) => new Set(prev).add(deviceId))
        );
    });
  }, [bindings, currentOrgId]);

  const namesLoading =
    !devicesDone ||
    bindings.some(
      (binding) =>
        !!binding.deviceId && !resolvedDeviceIds.has(binding.deviceId)
    );

  const rows = useMemo<BridgeDataStreamRow[]>(
    () =>
      bindings.map((binding, index) => ({
        index,
        deviceId: binding.deviceId,
        deviceName: deviceNames[binding.deviceId] || binding.deviceId,
        dataStreamId: binding.dataStreamId,
        dataStreamName:
          streamNames[binding.dataStreamId] || binding.dataStreamId,
        targetJsonPath: binding.targetJsonPath,
      })),
    [bindings, deviceNames, streamNames]
  );

  const filteredRows = useMemo(() => {
    const keyword = searchWord.trim().toLowerCase();
    if (!keyword) return rows;

    return rows.filter((row) =>
      [row.deviceName, row.deviceId, row.dataStreamName, row.targetJsonPath]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    );
  }, [rows, searchWord]);

  const lastPage = Math.max(
    0,
    Math.ceil(filteredRows.length / rowsPerPage) - 1
  );
  const currentPage = Math.min(page, lastPage);

  const pagedRows = filteredRows.slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  const handleSearchChange = (value: string) => {
    setSearchWord(value);
    setPage(0);
  };

  const handleRefresh = async () => {
    const isFetched = await fetchBridge();

    if (isFetched) showSuccess('DataStream list refreshed');
  };

  const handleEditBridge = () => {
    if (!hasPermission || !bridgeId) return;

    navigate(`/data-stream-bridges/${bridgeId}/edit`);
  };

  const canDeleteBinding = hasPermission && bindings.length > 1;

  const handleOpenDelete = (row: BridgeDataStreamRow) => {
    if (!canDeleteBinding) return;

    setDeleteTarget(row);
  };

  const handleCloseDelete = () => setDeleteTarget(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !bridgeId || !currentOrgId || deleting) return;

    setDeleting(true);

    try {
      await dataStreamBridgesApi.patchDataStreamBridge({
        orgId: currentOrgId,
        bridgeId,
        data: {
          bindings: bindings.filter((_, index) => index !== deleteTarget.index),
        },
      });

      showSuccess(
        `DataStream [${deleteTarget.dataStreamName}] removed from the bridge`
      );
      await fetchBridge();
    } catch (err: unknown) {
      showError(
        err instanceof Error ? err.message : 'Failed to remove DataStream'
      );
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return {
    hasPermission,
    searchWord,
    pagedRows,
    totalCount: filteredRows.length,
    hasFilter: !!searchWord.trim(),
    hasBindings: rows.length > 0,
    namesLoading,
    page: currentPage,
    rowsPerPage,
    setPage,
    setRowsPerPage: (value: number) => {
      setRowsPerPage(value);
      setPage(0);
    },
    canDeleteBinding,
    deleteTarget,
    deleting,
    handleSearchChange,
    handleClearSearch: () => handleSearchChange(''),
    handleRefresh,
    handleEditBridge,
    handleOpenDelete,
    handleCloseDelete,
    handleConfirmDelete,
  };
}
