import { postUsersToOrg } from '@features/organizations';
import { fetchAllPages } from '@shared/api/fetchAllPages';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import {
  mapEditMemberOrgRoleToRoleType,
  mapOrgRoleToRoleType,
} from '../domain/member.rules';
import type { MemberItem, RoleType } from '../domain/types';
import { useMemberStore } from '../store/useMemberStore';

type EditMemberLocationState = {
  selectedIds?: string[];
};

export function useMemberEditorPage(mode: 'add' | 'edit') {
  const navigate = useAppNavigate();
  const location = useLocation();
  const { showError, showSuccess } = useNotification();
  const hasManagementPermission = useManagementPermission();

  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const getParentOrgId = useOrgContentStore((s) => s.getParentOrgId);

  const GET_ORG_USERS_BY_ORG_ID = useMemberStore(
    (s) => s.GET_ORG_USERS_BY_ORG_ID
  );
  const GET_ROOT_ORG_USERS = useMemberStore((s) => s.GET_ROOT_ORG_USERS);
  const POST_USERS = useMemberStore((s) => s.POST_USERS);
  const GET_EDIT_MEMBER_LIST = useMemberStore((s) => s.GET_EDIT_MEMBER_LIST);
  const PATCH_MEMBER_BY_ID = useMemberStore((s) => s.PATCH_MEMBER_BY_ID);
  const CLEAR_EDIT_MEMBER_LIST = useMemberStore(
    (s) => s.CLEAR_EDIT_MEMBER_LIST
  );
  const editMemberList = useMemberStore((s) => s.editMemberList);
  const editMemberListLoading = useMemberStore((s) => s.editMemberListLoading);
  const editMemberListError = useMemberStore((s) => s.editMemberListError);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSubmitOpen, setDialogSubmitOpen] = useState(false);

  const [allCandidates, setAllCandidates] = useState<MemberItem[]>([]);
  const [candidatesTotalCount, setCandidatesTotalCount] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const parentOrgId = useMemo(() => {
    if (mode !== 'add') return null;
    if (!currentOrgId) return null;
    return getParentOrgId();
  }, [mode, currentOrgId, getParentOrgId]);

  useEffect(() => {
    if (mode !== 'add') return;

    const timer = window.setTimeout(() => {
      setPage(0);
      setSearchKeyword(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [mode, searchInput]);

  useEffect(() => {
    if (mode !== 'add') return;

    let ignore = false;

    const fetchData = async () => {
      if (!currentOrgId) {
        setAllCandidates([]);
        setCandidatesTotalCount(0);
        return;
      }

      setFetchLoading(true);
      setFetchError(null);

      try {
        let candidateItems: MemberItem[];
        let totalCount: number;

        const requireList = <T>(list: T | null): T => {
          if (!list) throw new Error('Failed to fetch member list');
          return list;
        };

        if (parentOrgId) {
          const pageList = await GET_ORG_USERS_BY_ORG_ID({
            orgId: parentOrgId,
            skipCount: page * rowsPerPage,
            maxResultCount: rowsPerPage,
            name: searchKeyword || undefined,
            sorting: 'name asc',
          }).then(requireList);

          candidateItems = pageList.items.map((item) => ({
            id: item.userId,
            userId: item.userId,
            name: item.name || '-',
            email: item.email || '',
            role: mapOrgRoleToRoleType(item.orgRole),
            orgId: item.orgId,
          }));
          totalCount = pageList.totalCount;
        } else {
          const pageList = await GET_ROOT_ORG_USERS({
            skipCount: page * rowsPerPage,
            maxResultCount: rowsPerPage,
            sorting: 'name asc',
            filter: searchKeyword || undefined,
          }).then(requireList);

          candidateItems = (pageList.items ?? []).map((item) => ({
            id: item.userId,
            userId: item.userId,
            name:
              item.firstName || item.lastName
                ? `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim()
                : '-',
            email: item.email || '',

            role: mapOrgRoleToRoleType(),
            orgId: currentOrgId,
          }));
          totalCount = pageList.totalCount;
        }

        const existingMemberList = await fetchAllPages((pageParams) =>
          GET_ORG_USERS_BY_ORG_ID({
            orgId: currentOrgId,
            ...pageParams,
            sorting: 'name asc',
          }).then(requireList)
        );

        const existingUserIds = new Set(
          existingMemberList.items.map((item) => item.userId)
        );

        const filtered = candidateItems.filter(
          (item) => !existingUserIds.has(item.userId)
        );

        if (ignore) return;

        setAllCandidates(filtered);
        setCandidatesTotalCount(totalCount);
        setSelectedIds([]);
      } catch (error) {
        if (ignore) return;

        console.error('Fetch add member list failed:', error);
        setAllCandidates([]);
        setCandidatesTotalCount(0);
        setFetchError('Failed to fetch member list');
      } finally {
        if (!ignore) {
          setFetchLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, [
    mode,
    currentOrgId,
    parentOrgId,
    searchKeyword,
    page,
    rowsPerPage,
    GET_ORG_USERS_BY_ORG_ID,
    GET_ROOT_ORG_USERS,
  ]);

  const [members, setMembers] = useState<MemberItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const locationState = location.state as EditMemberLocationState | null;
  const incomingSelectedIds = useMemo(
    () => locationState?.selectedIds ?? [],
    [locationState?.selectedIds]
  );

  useEffect(() => {
    if (mode !== 'edit') return;
    if (!incomingSelectedIds.length) {
      navigate('/members', { replace: true });
    }
  }, [mode, incomingSelectedIds, navigate]);

  useEffect(() => {
    if (mode !== 'edit') return;
    CLEAR_EDIT_MEMBER_LIST();
  }, [mode, CLEAR_EDIT_MEMBER_LIST]);

  useEffect(() => {
    if (mode !== 'edit') return;
    if (!currentOrgId) return;
    if (!incomingSelectedIds.length) return;

    const controller = new AbortController();

    GET_EDIT_MEMBER_LIST(
      {
        orgId: currentOrgId,
        userIds: incomingSelectedIds,
      },
      controller.signal
    );

    return () => controller.abort();
  }, [mode, currentOrgId, incomingSelectedIds, GET_EDIT_MEMBER_LIST]);

  useEffect(() => {
    if (mode !== 'edit') return;

    if (!editMemberList?.length) {
      setMembers([]);
      setSelectedIds([]);
      return;
    }

    const mapped: MemberItem[] = editMemberList.map((item) => ({
      id: item.userId,
      userId: item.userId,
      name: item.name || '',
      email: item.email || '',
      role: mapEditMemberOrgRoleToRoleType(item.orgRole),
      orgId: item.orgId,
    }));

    setMembers(mapped);
    setSelectedIds(mapped.map((item) => item.id));
  }, [mode, editMemberList]);

  const filteredMembers = useMemo(() => {
    if (mode !== 'edit') return [];

    const keyword = searchInput.trim().toLowerCase();

    if (!keyword) return members;

    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(keyword) ||
        member.email.toLowerCase().includes(keyword)
    );
  }, [mode, members, searchInput]);

  const pagedFilteredMembers = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredMembers.slice(start, end);
  }, [filteredMembers, page, rowsPerPage]);

  const pagedMembers = mode === 'add' ? allCandidates : pagedFilteredMembers;
  const totalCount =
    mode === 'add' ? candidatesTotalCount : filteredMembers.length;
  const loading = mode === 'add' ? fetchLoading : editMemberListLoading;
  const error = mode === 'add' ? fetchError : editMemberListError;
  const hasPermission =
    mode === 'add'
      ? hasManagementPermission.canCreateRootMembers
      : hasManagementPermission.canManageMembers;

  const toggleAll = (checked: boolean) => {
    const pageIds = pagedMembers.map((m) => m.id);

    if (mode === 'add') {
      setSelectedIds(checked ? pageIds : []);
      return;
    }

    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
      return;
    }

    setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleRoleChange = (
    id: string,
    value: string | RoleType | undefined
  ) => {
    if (mode === 'add') {
      const roleValue = value as RoleType;
      setAllCandidates((prev) =>
        prev.map((m) => (m.id === id ? { ...m, role: roleValue } : m))
      );
      return;
    }

    if (!value) return;
    const roleValue = value as RoleType;

    setMembers((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, role: roleValue } : member
      )
    );
  };

  const handleSubmit = async () => {
    if (mode === 'add') {
      if (!currentOrgId) return;

      const selectedMembers = allCandidates.filter((m) =>
        selectedIds.includes(m.id)
      );

      if (selectedMembers.length === 0) return;

      try {
        if (parentOrgId) {
          await POST_USERS({
            orgId: currentOrgId,
            users: selectedMembers.map((m) => ({
              userId: m.userId,
              orgRole: m.role.toLowerCase(),
            })),
          });
        } else {
          await postUsersToOrg({
            orgId: currentOrgId,
            userData: selectedMembers.map((m) => ({
              userId: m.userId,
              orgRole: m.role?.toLowerCase(),
            })),
          });
        }

        setDialogOpen(false);

        showSuccess(`Added ${selectedMembers.length} member(s) successfully.`);
        navigate('/members');
      } catch (error) {
        console.error('Add member failed:', error);
        showError('Failed to add members. Please try again.');
      }

      return;
    }

    if (!currentOrgId) {
      console.warn('[EditMember] currentOrgId not found');
      return;
    }

    const selectedMembers = members.filter((member) =>
      selectedIds.includes(member.id)
    );

    if (!selectedMembers.length) {
      console.warn('[EditMember] no selected members');
      return;
    }

    setSubmitting(true);

    try {
      for (const member of selectedMembers) {
        await PATCH_MEMBER_BY_ID({
          orgId: currentOrgId,
          users: [
            { userId: member.userId, orgRole: member.role.toLowerCase() },
          ],
        });
      }

      setDialogOpen(false);
      showSuccess(`Updated ${selectedMembers.length} member(s) successfully.`);
      navigate('/members', { replace: true });
    } catch (error) {
      console.error('[EditMember] Edit member failed:', error);
      setDialogOpen(false);
      setDialogSubmitOpen(false);
      showError('Failed to update members. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setPage(0);

    if (mode === 'add') {
      setSearchKeyword('');
      setSelectedIds([]);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);

    if (mode === 'edit') {
      setPage(0);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);

    if (mode === 'add') {
      setSelectedIds([]);
    }
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setPage(0);

    if (mode === 'add') {
      setSelectedIds([]);
    }
  };

  return {
    members: pagedMembers,
    selectedIds,
    searchInput,
    page,
    rowsPerPage,
    totalCount,
    loading,
    error,
    dialogOpen,
    dialogSubmitOpen,
    hasPermission,
    submitting,
    setDialogOpen,
    setDialogSubmitOpen,
    handleSearchChange,
    toggleAll,
    toggleOne,
    handleRoleChange,
    handlePageChange,
    handleRowsPerPageChange,
    handleSubmit,
    handleClearFilters,
  };
}
