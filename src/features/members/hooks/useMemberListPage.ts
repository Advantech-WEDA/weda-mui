import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { type SortOrder, useNotification } from '@shared/ui';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { IMemberList } from '../api/members.api.types';
import type { RoleType, TableHeaderSortKey } from '../domain/types';
import { useMemberStore } from '../store/useMemberStore';

export function useMemberListPage() {
  const [searchWord, setSearchWord] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleType | ''>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortKey, setSortKey] = useState<TableHeaderSortKey>('orgRole');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const navigate = useAppNavigate();

  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);

  const hasPermission = useManagementPermission().canCreateRootMembers;

  const { showError } = useNotification();

  const GET_ORG_USERS_BY_ORG_ID = useMemberStore(
    (s) => s.GET_ORG_USERS_BY_ORG_ID
  );

  const [memberList, setMemberList] = useState<IMemberList | null>(null);
  const [memberListLoading, setMemberListLoading] = useState(false);
  const [memberListError, setMemberListError] = useState<string | null>(null);

  const hasLoadedOnceRef = useRef(false);

  const fetchMembers = useCallback(
    async (signal?: AbortSignal) => {
      if (!currentOrgId) return;

      setMemberListLoading(true);
      setMemberListError(null);

      try {
        const data = await GET_ORG_USERS_BY_ORG_ID(
          {
            orgId: currentOrgId,
            skipCount: page * rowsPerPage,
            maxResultCount: rowsPerPage,
            name: searchKeyword || undefined,
            sorting: `${sortKey} ${sortOrder}`,
            orgRole: roleFilter || undefined,
          },
          signal
        );

        if (signal?.aborted) return;

        if (data) {
          setMemberList(data);
          return;
        }

        setMemberListError('Failed to fetch member list');
      } catch (error) {
        if (signal?.aborted) return;

        setMemberListError('Failed to fetch member list');
      } finally {
        if (!signal?.aborted) {
          setMemberListLoading(false);
          hasLoadedOnceRef.current = true;
        }
      }
    },
    [
      currentOrgId,
      page,
      rowsPerPage,
      searchKeyword,
      sortKey,
      sortOrder,
      roleFilter,
      GET_ORG_USERS_BY_ORG_ID,
    ]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchMembers(controller.signal);

    return () => controller.abort();
  }, [fetchMembers]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(0);
      setSearchKeyword(searchWord.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchWord]);

  useEffect(() => {
    if (memberListError) {
      showError(memberListError);
    }
  }, [memberListError, showError]);

  const handleSort = (key: TableHeaderSortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortOrder('asc');
    setPage(0);
  };

  const rows = memberList?.items ?? [];
  const totalCount = memberList?.totalCount ?? 0;
  const isInitialLoading = memberListLoading && !hasLoadedOnceRef.current;

  const handleAdd = () => {
    navigate('/members/add');
  };

  const handleClearFilters = () => {
    setSearchWord('');
    setSearchKeyword('');
    setRoleFilter('');
    setPage(0);
  };

  const handleSearchChange = (value: string) => {
    setSearchWord(value);
  };

  const handleRoleFilterChange = (value: RoleType | '') => {
    setRoleFilter(value);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  return {
    searchWord,
    roleFilter,
    page,
    rowsPerPage,
    sortKey,
    sortOrder,
    rows,
    totalCount,
    isInitialLoading,
    hasError: !!memberListError,
    hasPermission,
    handleSort,
    handleAdd,
    handleClearFilters,
    handleRetryFetch: fetchMembers,
    handleSearchChange,
    handleRoleFilterChange,
    handlePageChange,
    handleRowsPerPageChange,
  };
}
