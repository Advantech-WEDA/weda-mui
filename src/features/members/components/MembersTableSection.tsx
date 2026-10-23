import { Pagination, type SortOrder } from '@shared/ui';

import type { IMemberItem } from '../api/members.api.types';
import MemberTable, { type TableHeaderSortKey } from './MemberTable';

interface MembersTableSectionProps {
  rows: IMemberItem[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  sortKey: TableHeaderSortKey;
  sortOrder: SortOrder;
  hasError?: boolean;
  onSort: (key: TableHeaderSortKey) => void;
  onRetry: () => void;
  onClearAll: () => void;
  onMemberDeleted: () => void;
  onPageChange: (_: unknown, newPage: number) => void;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const MembersTableSection = ({
  rows,
  totalCount,
  page,
  rowsPerPage,
  sortKey,
  sortOrder,
  hasError,
  onSort,
  onRetry,
  onClearAll,
  onMemberDeleted,
  onPageChange,
  onRowsPerPageChange,
}: MembersTableSectionProps) => {
  return (
    <>
      <MemberTable
        rows={rows}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        sortKey={sortKey}
        sortOrder={sortOrder}
        hasError={hasError}
        onSort={onSort}
        onRetry={onRetry}
        onClearAll={onClearAll}
        onMemberDeleted={onMemberDeleted}
      />

      {rows.length !== 0 && (
        <Pagination
          count={totalCount}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
    </>
  );
};

export default MembersTableSection;
