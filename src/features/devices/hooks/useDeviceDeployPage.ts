import {
  type ContainerStackTableRow,
  type IStackConfigsItem,
  type StackVersionItem,
  type TableHeaderSortKey,
  useDeploymentsStore,
} from '@features/container-stacks';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useHasManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { type SortOrder, useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useDeviceStore } from '../store/useDeviceStore';

function buildStackRows(
  items: IStackConfigsItem[],
  disabledRevisionIds: Set<string>
): ContainerStackTableRow[] {
  const stackMap = new Map<string, ContainerStackTableRow>();

  items.forEach((item) => {
    const versionItem: StackVersionItem = {
      stackRevisionId: item.stackRevisionId,
      version: item.version,
    };

    if (!stackMap.has(item.stackConfigId)) {
      stackMap.set(item.stackConfigId, {
        stackConfigId: item.stackConfigId,
        stackName: item.stackName,
        type: item.type,
        orgId: item.orgId,
        selectedVersion: item.version,
        versions: [versionItem],
        currentVersion: versionItem,
      });

      return;
    }

    stackMap.get(item.stackConfigId)?.versions.push(versionItem);
  });

  return Array.from(stackMap.values()).map((stack) => {
    const sortedVersions = [...stack.versions].sort(
      (a, b) => b.version - a.version
    );

    const defaultVersion =
      sortedVersions.find(
        (item) => !disabledRevisionIds.has(item.stackRevisionId)
      ) ?? sortedVersions[0];

    return {
      ...stack,
      versions: sortedVersions,
      selectedVersion: defaultVersion.version,
      currentVersion: defaultVersion,
    };
  });
}

export function useDeviceDeployPage() {
  const navigate = useAppNavigate();

  const { deviceId } = useParams<{
    deviceId: string;
    tenant: string;
  }>();

  const { currentOrgId } = useOrgContentStore();

  const { showError, showSuccess } = useNotification();
  const hasPermission = useHasManagementPermission();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const [selectedStackConfigIds, setSelectedStackConfigIds] = useState<
    string[]
  >([]);

  const [stackTableRowRows, setStackTableRowRows] = useState<
    ContainerStackTableRow[]
  >([]);

  const POST_DEPLOY_STACK_TO_DEVICES = useDeploymentsStore(
    (s) => s.POST_DEPLOY_STACK_TO_DEVICES
  );

  const [searchWord, setSearchWord] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortKey, setSortKey] = useState<TableHeaderSortKey>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [totalCount, setTotalCount] = useState<number>(0);

  const deviceItems = useDeviceStore((s) => s.deviceItems);
  const loading = useDeploymentsStore((s) => s.loading);
  const deploymentItems = useDeploymentsStore((s) => s.deploymentItems);
  const GET_STACK_CONFIGS = useDeploymentsStore((s) => s.GET_STACK_CONFIGS);
  const GET_ALL_DEPLOYMENTS = useDeploymentsStore((s) => s.GET_ALL_DEPLOYMENTS);
  const GET_ALL_DEVICES = useDeviceStore((s) => s.GET_ALL_DEVICES);

  const pageTitle = `Deploy Container Stack to “${deviceItems.find((f) => f.deviceId === deviceId)?.deviceName}”`;

  const fetchStacks = useCallback(
    async (
      disabledRevisionIds: Set<string>,
      signal?: AbortSignal
    ): Promise<void> => {
      if (!currentOrgId) {
        showError('No Org ID');
        return;
      }

      try {
        const stackResponse = await GET_STACK_CONFIGS(
          {
            orgId: currentOrgId,
            skipCount: page * rowsPerPage,
            maxResultCount: rowsPerPage,
            sorting: `${sortKey} ${sortOrder}`,

            type: typeFilter || undefined,
          },
          signal
        );

        const newRows = buildStackRows(
          stackResponse.items ?? [],
          disabledRevisionIds
        );

        setStackTableRowRows(newRows);
        setTotalCount(stackResponse.totalCount ?? 0);
      } catch (error) {
        if (axios.isCancel(error)) return;

        const message = error instanceof Error ? error.message : String(error);
        showError(message);
      }
    },
    [
      currentOrgId,
      GET_STACK_CONFIGS,
      page,
      rowsPerPage,
      sortKey,
      sortOrder,
      typeFilter,
      showError,
    ]
  );

  const fetchDevices = useCallback(
    async (signal?: AbortSignal) => {
      if (!currentOrgId) return;

      try {
        await GET_ALL_DEVICES({ orgId: currentOrgId }, signal);
      } catch (error) {
        if (axios.isCancel(error)) return;

        throw error;
      }
    },
    [currentOrgId, GET_ALL_DEVICES]
  );

  const fetchDeployments = useCallback(
    async (signal?: AbortSignal): Promise<string[]> => {
      if (!currentOrgId || !deviceId) return [];

      try {
        const response = await GET_ALL_DEPLOYMENTS(
          { orgId: currentOrgId, deviceIds: [deviceId] },
          signal
        );

        return response.items.map((item) => item.stackRevisionId);
      } catch (error) {
        if (axios.isCancel(error)) return [];

        const message = error instanceof Error ? error.message : String(error);
        showError(message);
        return [];
      }
    },
    [currentOrgId, deviceId, GET_ALL_DEPLOYMENTS, showError]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchDevices(controller.signal);

    (async () => {
      const deployedRevisionIds = await fetchDeployments(controller.signal);

      await fetchStacks(new Set(deployedRevisionIds), controller.signal);
    })();

    return () => controller.abort();
  }, [fetchDeployments, fetchDevices, fetchStacks]);

  const deployedStackRevisionIds = useMemo(
    () => new Set(deploymentItems.map((item) => item.stackRevisionId)),
    [deploymentItems]
  );

  const rows = useMemo(() => {
    const keyword = searchWord.trim().toLowerCase();

    return (stackTableRowRows ?? []).filter((item) => {
      const stackName = item.stackName?.toLowerCase() ?? '';

      const matchKeyword = !keyword || stackName.includes(keyword);

      const matchType = !typeFilter || item.type === typeFilter;

      return matchKeyword && matchType;
    });
  }, [stackTableRowRows, searchWord, typeFilter]);

  const hasFilter = Boolean(searchWord || typeFilter);

  const pagedRows = rows;

  const pageStackConfigIds = useMemo(() => {
    return pagedRows
      .filter(
        (item) =>
          !deployedStackRevisionIds.has(item.currentVersion.stackRevisionId)
      )
      .map((item) => item.stackConfigId)
      .filter((stackConfigId): stackConfigId is string =>
        Boolean(stackConfigId)
      );
  }, [pagedRows, deployedStackRevisionIds]);

  const handleClearFilters = () => {
    setSearchWord('');
    setTypeFilter('');
    setSortKey('createdAt');
    setSortOrder('asc');
    setPage(0);
  };

  const handleSort = (key: TableHeaderSortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }

    setPage(0);
  };

  const handleSearchChange = (value: string) => {
    setSearchWord(value);
    setPage(0);
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setPage(0);
  };

  const handleVersionChange = (stackConfigId: string, version: number) => {
    setStackTableRowRows((prev) =>
      prev.map((row) => {
        if (row.stackConfigId !== stackConfigId) return row;

        const currentVersion =
          row.versions.find((item) => item.version === version) ??
          row.currentVersion;

        return {
          ...row,
          selectedVersion: version,
          currentVersion,
        };
      })
    );
  };

  const handleSelectStackConfig = (stackConfigId: string) => {
    setSelectedStackConfigIds((prev) =>
      prev.includes(stackConfigId)
        ? prev.filter((id) => id !== stackConfigId)
        : [...prev, stackConfigId]
    );
  };

  const handleSelectAll = (stackConfigIds: string[]) => {
    const isAllSelected = stackConfigIds.every((id) =>
      selectedStackConfigIds.includes(id)
    );

    setSelectedStackConfigIds((prev) =>
      isAllSelected
        ? prev.filter((id) => !stackConfigIds.includes(id))
        : [...new Set([...prev, ...stackConfigIds])]
    );
  };

  const handleConfirmCancel = () => {
    setCancelOpen(false);
    setSubmitOpen(false);
    setStackTableRowRows([]);
    setSelectedStackConfigIds([]);
  };

  const handleCancel = () => {
    handleConfirmCancel();
    navigate(`/devices/${deviceId}/container-stacks`);
  };

  const handleSubmitConfirmOpen = () => {
    if (!hasPermission) return;

    setSubmitOpen(true);
  };

  const handleSubmit = async () => {
    if (!hasPermission) return;

    if (!currentOrgId) {
      showError('Organization is required');
      return;
    }

    if (!deviceId) {
      showError('Device is required');
      return;
    }

    if (selectedStackConfigIds.length === 0) {
      showError('Please select at least one stack config');
      return;
    }

    const deployPayloads = selectedStackConfigIds
      .map((selectedId) => {
        const stack = stackTableRowRows.find(
          (item) => item.stackConfigId === selectedId
        );

        if (!stack) return null;

        return {
          stackName: stack.stackName,
          payload: {
            orgId: currentOrgId,
            stackConfigId: stack.stackConfigId,
            stackRevisionId: stack.currentVersion.stackRevisionId,
            deviceIds: [deviceId],
          },
        };
      })
      .filter(
        (
          item
        ): item is {
          stackName: string;
          payload: {
            orgId: string;
            stackConfigId: string;
            stackRevisionId: string;
            deviceIds: string[];
          };
        } => item !== null
      );

    const successList: string[] = [];
    const failedList: string[] = [];

    for (const item of deployPayloads) {
      try {
        await POST_DEPLOY_STACK_TO_DEVICES(item.payload);

        successList.push(item.stackName);
      } catch (error) {
        console.error('[DeployDevice] Deploy failed:', {
          stackName: item.stackName,
          payload: item.payload,
          error,
        });

        failedList.push(item.stackName);
      }
    }

    if (successList.length > 0) {
      showSuccess(`Deploy successfully: ${successList.join(', ')}`);
    }

    if (failedList.length > 0) {
      showError(`Deploy failed: ${failedList.join(', ')}`);
      return;
    }

    handleConfirmCancel();
    navigate(`/devices/${deviceId}/container-stacks`);
  };

  return {
    cancelOpen,
    submitOpen,
    selectedStackConfigIds,
    handleSelectStackConfig,
    handleSelectAll,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
    setCancelOpen,

    pageTitle,
    hasPermission,
    loading,
    pagedRows,
    pageStackConfigIds,
    deployedStackRevisionIds,
    searchWord,
    typeFilter,
    page,
    rowsPerPage,
    sortKey,
    sortOrder,

    visibleTotalCount: hasFilter ? rows.length : totalCount,
    hasFilter,
    setPage,
    setRowsPerPage,
    handleSearchChange,
    handleTypeFilterChange,
    handleSort,
    handleClearFilters,
    handleVersionChange,
  };
}
