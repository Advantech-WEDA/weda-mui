import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { type SortOrder, useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { registriesApi } from '../api/registries.api';
import type { IRegistryItem } from '../api/registries.api.types';
import {
  applyRegistryChange,
  applyRegistryTypeChange,
  buildRegistryCredentialsPayload,
  INITIAL_REGISTRY_DATA,
  INITIAL_REGISTRY_ERRORS,
  isCredentialsCategory,
  isCredentialsComplete,
  validateRegistryForm,
} from '../domain/registry.rules';
import {
  type RegistryForm,
  type RegistryFormErrors,
  registryOptions,
  type RegistrySubmitPayload,
  type RegistryType,
  type TableHeaderSortKey,
} from '../domain/types';

export function useRegistriesPage() {
  const navigate = useAppNavigate();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [sortKey, setSortKey] = useState<TableHeaderSortKey>('RegistryName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [searchWord, setSearchWord] = useState('');
  const [typeFilter, setTypeFilter] = useState<RegistryType | ''>('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const { showError, showSuccess } = useNotification();

  const hasPermission = useManagementPermission().canManageRegistries;

  const { currentOrgId } = useOrgContentStore();

  const [selectedItem, setSelectedItem] = useState<IRegistryItem | null>(null);

  const [registriesList, setRegistriesList] = useState<IRegistryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const [totalCount, setTotalCount] = useState(0);

  const fetchRegistries = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setLoadError(false);

      try {
        const data = await registriesApi.getRegistries(
          {
            orgId: currentOrgId,
            skipCount: page * rowsPerPage,
            maxResultCount: rowsPerPage,
            sorting: `${sortKey} ${sortOrder}`,
          },
          signal
        );

        setRegistriesList(data.items);
        setTotalCount(data.totalCount);
      } catch (error) {
        if (axios.isCancel(error)) return;

        setRegistriesList([]);
        setLoadError(true);
        showError(
          error instanceof Error
            ? error.message
            : 'Failed to load container registries'
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [currentOrgId, page, rowsPerPage, sortKey, sortOrder, showError]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchRegistries(controller.signal);

    return () => controller.abort();
  }, [fetchRegistries]);

  const filteredRows = useMemo(() => {
    const keyword = searchWord.trim().toLowerCase();

    return (registriesList ?? []).filter((item) => {
      const registryName = item.registryName?.toLowerCase() ?? '';
      const registryId = item.registryId?.toLowerCase() ?? '';

      const matchKeyword =
        !keyword ||
        registryName.includes(keyword) ||
        registryId.includes(keyword);

      const matchType =
        !typeFilter ||
        item.registryEncryptedCredentials?.registryType === typeFilter;

      return matchKeyword && matchType;
    });
  }, [registriesList, searchWord, typeFilter]);

  const pagedRows = filteredRows;

  const hasFilter = Boolean(searchWord) || Boolean(typeFilter);

  const visibleTotalCount = hasFilter ? filteredRows.length : totalCount;

  const handleClearFilters = () => {
    setSearchWord('');
    setTypeFilter('');
    setSortKey('RegistryName');
    setSortOrder('asc');
  };

  const handleSort = (key: TableHeaderSortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      setPage(0);

      return;
    }

    setSortKey(key);
    setSortOrder('asc');
    setPage(0);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

  const handleOpenDeleteDialog = (row: IRegistryItem) => {
    setSelectedItem(row);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    if (!hasPermission) return;

    navigate('/registries/add');
  };

  const handleEdit = useCallback(
    (registryId: string) => {
      if (!hasPermission) return;

      navigate(`/registries/${registryId}/edit`);
    },
    [navigate, hasPermission]
  );

  const handleConfirmDelete = async () => {
    if (!selectedItem || !hasPermission) return;

    try {
      await registriesApi.deleteRegistry({
        orgId: selectedItem.orgId,
        registryId: selectedItem.registryId,
      });

      showSuccess('Registry deleted successfully');

      await fetchRegistries();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Delete registry failed';

      showError(message);
      console.error('[Delete registry] failed:', message);
    } finally {
      handleClose();
    }
  };

  const handleTypeFilterChange = (value: RegistryType | '') => {
    setTypeFilter(value);
  };

  const tableSectionProps = {
    rows: pagedRows,
    totalCount: visibleTotalCount,
    page,
    rowsPerPage,
    sortKey,
    sortOrder,
    loading,
    hasError: loadError,
    hasFilter,
    hasPermission,
    onSort: handleSort,
    onRetry: fetchRegistries,
    onClearAll: handleClearFilters,
    onPageChange: (newPage: number) => setPage(newPage),
    onRowsPerPageChange: (rows: number) => {
      setRowsPerPage(rows);
      setPage(0);
    },
    onDelete: handleOpenDeleteDialog,
    onEdit: handleEdit,
    onAdd: handleAdd,
  };

  return {
    hasPermission,
    searchWord,
    setSearchWord,
    typeFilter,
    handleTypeFilterChange,
    handleAdd,
    handleClearFilters,
    tableSectionProps,
    dialogOpen,
    selectedItem,
    handleClose,
    handleConfirmDelete,
  };
}

export function useRegistryEditorPage(mode: 'add' | 'edit') {
  const navigate = useAppNavigate();
  const { registryId } = useParams<{
    registryId: string;
  }>();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [errors, setErrors] = useState<RegistryFormErrors>(
    INITIAL_REGISTRY_ERRORS
  );
  const [registryData, setRegistryData] = useState<RegistryForm>(
    INITIAL_REGISTRY_DATA
  );
  const [credentialsDirty, setCredentialsDirty] = useState(false);

  const { showError, showSuccess } = useNotification();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);

  useEffect(() => {
    if (mode !== 'edit') return;

    const controller = new AbortController();

    const fetchRegistry = async () => {
      if (!registryId || !currentOrgId) return;

      try {
        const result = await registriesApi.getRegistryById(
          {
            orgId: currentOrgId,
            registryId,
          },
          controller.signal
        );
        const fetchedRegistryData: RegistryForm = {
          registryName: result.registryName || '',
          registryUrl: result.registryUrl || '',

          registryCredentials: {
            registryType:
              result.registryEncryptedCredentials.registryType ||
              INITIAL_REGISTRY_DATA.registryCredentials.registryType,
            accessKey:
              result.registryEncryptedCredentials.encryptedAccessKey || '',
            accessSecretKey:
              result.registryEncryptedCredentials.encryptedAccessSecretKey ||
              '',
            region: result.registryEncryptedCredentials.region || '',
            username: result.registryEncryptedCredentials.username || '',
            accessToken:
              result.registryEncryptedCredentials.encryptedAccessToken || '',
            userPassword:
              result.registryEncryptedCredentials.encryptedUserPassword || '',
          },
        };

        setRegistryData(fetchedRegistryData);
      } catch (error) {
        if (axios.isCancel(error)) return;

        showError(
          error instanceof Error
            ? error.message
            : 'Failed to load container registry'
        );
      }
    };

    fetchRegistry();

    return () => controller.abort();
  }, [mode, registryId, currentOrgId, showError]);

  const validate = () => {
    const { isValid, errors: newErrors } = validateRegistryForm(registryData);
    setErrors(newErrors);
    return isValid;
  };

  const handleConfirmCancel = () => {
    setCancelOpen(false);
    setSubmitOpen(false);
  };

  const handleSubmitConfirmOpen = () => {
    if (!validate()) return;
    setSubmitOpen(true);
  };

  const handleCancel = () => {
    handleConfirmCancel();
    navigate('/registries');
  };

  const handleOnChange = (
    category: string,
    registryType?: RegistryType,
    value?: string
  ) => {
    const shouldResetCredentials =
      mode === 'edit' && !credentialsDirty && isCredentialsCategory(category);

    setRegistryData((prev) => {
      const base = shouldResetCredentials
        ? applyRegistryTypeChange(prev, prev.registryCredentials.registryType)
        : prev;
      return applyRegistryChange(base, category, registryType, value);
    });

    if (shouldResetCredentials) setCredentialsDirty(true);
  };

  const canSubmit =
    mode === 'add' ||
    (credentialsDirty &&
      isCredentialsComplete(registryData.registryCredentials));

  const handleSubmit = async () => {
    if (!currentOrgId) return;

    const submitPayload: RegistrySubmitPayload = {
      registryName: registryData.registryName,
      registryUrl: registryData.registryUrl,
      registryCredentials: buildRegistryCredentialsPayload(
        registryData.registryCredentials
      ),
    };

    try {
      if (mode === 'add') {
        await registriesApi.postRegistry({
          orgId: currentOrgId,
          registryData: submitPayload,
        });
        showSuccess('Registry created successfully');
      } else {
        if (!registryId) return;
        await registriesApi.putRegistryById({
          orgId: currentOrgId,
          registryId,
          registryData: submitPayload,
        });
        showSuccess(
          `Registry [${registryData?.registryName}] updated successfully`
        );
      }

      handleConfirmCancel();
      navigate('/registries');
    } catch (err: unknown) {
      const fallback =
        mode === 'add' ? 'Create Registry failed' : 'Update Registry failed';

      const message = err instanceof Error ? err.message : fallback;
      showError(message);

      console.error(
        `[${mode === 'add' ? 'AddRegistry' : 'EditRegistry'}] Submit failed:`,
        message
      );
    } finally {
      handleConfirmCancel();
    }
  };

  return {
    cancelOpen,
    submitOpen,
    registryData,
    errors,
    credentialsDirty,
    canSubmit,
    setCancelOpen,
    handleOnChange,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
  };
}

export function useRegistryDetailPage() {
  const navigate = useAppNavigate();
  const { registryId } = useParams<{
    registryId: string;
  }>();

  const { showError, showSuccess } = useNotification();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const hasPermission = useManagementPermission().canManageRegistries;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [registryData, setRegistryData] = useState<IRegistryItem>({
    registryName: '',
    registryUrl: '',
    createdAt: '',
    registryId: '',
    orgId: '',

    registryEncryptedCredentials: {
      registryType: registryOptions[0].value,
      encryptedAccessKey: undefined,
      encryptedAccessSecretKey: undefined,
      region: undefined,
      username: undefined,
      encryptedAccessToken: undefined,
      encryptedUserPassword: undefined,
    },
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchRegistry = async () => {
      if (!registryId || !currentOrgId) return;

      try {
        const result = await registriesApi.getRegistryById(
          {
            orgId: currentOrgId,
            registryId,
          },
          controller.signal
        );
        setRegistryData({
          registryId: result.registryId,
          registryName: result.registryName,
          registryUrl: result.registryUrl,
          createdAt: result.createdAt,
          orgId: result.orgId,
          registryEncryptedCredentials: {
            registryType: result.registryEncryptedCredentials.registryType,
            encryptedAccessKey:
              result.registryEncryptedCredentials.encryptedAccessKey,
            encryptedAccessSecretKey:
              result.registryEncryptedCredentials.encryptedAccessSecretKey,
            region: result.registryEncryptedCredentials.region,
            username: result.registryEncryptedCredentials.username,
            encryptedAccessToken:
              result.registryEncryptedCredentials.encryptedAccessToken,
            encryptedUserPassword:
              result.registryEncryptedCredentials.encryptedUserPassword,
          },
        });
      } catch (error) {
        if (axios.isCancel(error)) return;

        showError(
          error instanceof Error
            ? error.message
            : 'Failed to load container registry'
        );
      }
    };

    fetchRegistry();

    return () => controller.abort();
  }, [registryId, currentOrgId, showError]);

  const handleClose = () => setDialogOpen(false);

  const handleOpenDelete = () => setDialogOpen(true);

  const handleEdit = useCallback(
    (id: string) => {
      if (!hasPermission) return;
      navigate(`/registries/${id}/edit`);
    },
    [navigate, hasPermission]
  );

  const handleConfirmDelete = async () => {
    if (!registryData || !hasPermission) return;

    try {
      await registriesApi.deleteRegistry({
        orgId: currentOrgId,
        registryId: registryId!,
      });

      showSuccess('Registry deleted successfully');

      await registriesApi.getRegistries({
        orgId: currentOrgId,
        skipCount: 0,
        maxResultCount: 20,
        sorting: 'RegistryName asc',
      });

      handleClose();
      navigate('/registries');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Delete registry failed';
      showError(message);
      console.error('[Delete registry] failed:', message);
    } finally {
      handleClose();
    }
  };

  return {
    registryData,
    registryId,
    dialogOpen,
    setDialogOpen,
    handleOpenDelete,
    handleClose,
    handleEdit,
    handleConfirmDelete,
  };
}
