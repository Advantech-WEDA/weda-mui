import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useHasManagementPermission } from '@shared/session/useHasManagementPermission';
import { useNotification } from '@shared/ui';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { IClientCredentialResult } from '../api/client-credentials.api.types';
import { useClientCredentialStore } from '../store/useClientCredentialStore';

export function useClientCredentialListPage() {
  const clientCredentialList = useClientCredentialStore(
    (s) => s.clientCredentialList
  );
  const GET_CLIENT_CREDENTIALS = useClientCredentialStore(
    (s) => s.GET_CLIENT_CREDENTIALS
  );
  const DELETE_CLIENT_CREDENTIALS = useClientCredentialStore(
    (s) => s.DELETE_CLIENT_CREDENTIALS
  );

  const { showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const fetchClientCredentials = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);

      try {
        await GET_CLIENT_CREDENTIALS(signal);
        setLoadError(false);
      } catch (error) {
        if (axios.isCancel(error)) return;

        setLoadError(true);
        showError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch client credentials'
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [GET_CLIENT_CREDENTIALS, showError]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchClientCredentials(controller.signal);

    return () => controller.abort();
  }, [fetchClientCredentials]);

  const hasPermission = useHasManagementPermission();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchWord, setSearchWord] = useState('');
  const [scopeFilter, setScopeFilter] = useState<string>('');
  const hasFilter = searchWord.trim() !== '' || scopeFilter !== '';
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] =
    useState<IClientCredentialResult | null>(null);
  const [inputValue, setInputValue] = useState('');

  const navigate = useAppNavigate();

  const filteredRows = useMemo(() => {
    let result = [...(clientCredentialList || [])];

    if (searchWord.trim()) {
      const lower = searchWord.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(lower));
    }

    if (scopeFilter) {
      result = result.filter((item) => item.scopes?.includes(scopeFilter));
    }

    return result;
  }, [searchWord, scopeFilter, clientCredentialList]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleClearFilters = () => {
    setSearchWord('');
    setScopeFilter('');
    setPage(0);
  };

  const handleAdd = () => {
    navigate('/client-credentials/add');
  };

  const handleOpenDialog = (row: IClientCredentialResult) => {
    setSelectedCredential(row);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setInputValue('');
  };

  const handleConfirm = async () => {
    if (!selectedCredential) return;

    const isMatched = inputValue.trim() === selectedCredential.name.trim();
    if (!isMatched) {
      console.warn('Name not match');
      return;
    }

    try {
      await DELETE_CLIENT_CREDENTIALS(selectedCredential.clientCredentialId);
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : 'Failed to delete client credential'
      );
    } finally {
      setDialogOpen(false);
      setInputValue('');
      setSelectedCredential(null);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchWord(value);
    setPage(0);
  };

  const handleScopeFilterChange = (value: string) => {
    setScopeFilter(value);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setPage(0);
  };

  return {
    hasPermission,
    page,
    rowsPerPage,
    searchWord,
    scopeFilter,
    hasFilter,
    dialogOpen,
    selectedCredential,
    inputValue,
    setInputValue,
    filteredRows,
    pagedRows,
    loading,
    hasError: loadError,
    handleClearFilters,
    handleAdd,
    handleOpenDialog,
    handleCloseDialog,
    handleConfirm,
    handleRetryFetch: fetchClientCredentials,
    handleSearchChange,
    handleScopeFilterChange,
    handlePageChange,
    handleRowsPerPageChange,
  };
}
