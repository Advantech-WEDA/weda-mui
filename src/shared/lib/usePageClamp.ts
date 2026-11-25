export function getLastValidPage(
  totalCount: number,
  rowsPerPage: number
): number {
  if (totalCount <= 0 || rowsPerPage <= 0) return 0;
  return Math.ceil(totalCount / rowsPerPage) - 1;
}

export function isPageOutOfRange(params: {
  page: number;
  totalCount: number;
  itemCount: number;
}): boolean {
  const { page, totalCount, itemCount } = params;
  return page > 0 && itemCount === 0 && totalCount > 0;
}

export function usePageClamp(params: {
  page: number;
  setPage: (page: number) => void;
  rowsPerPage: number;
  totalCount: number;
  itemCount: number;
  loading: boolean;
}): boolean {
  const { page, setPage, rowsPerPage, totalCount, itemCount, loading } = params;

  const outOfRange = isPageOutOfRange({ page, totalCount, itemCount });

  if (!loading && outOfRange) {
    const lastValidPage = getLastValidPage(totalCount, rowsPerPage);

    if (lastValidPage < page) setPage(lastValidPage);
  }

  return outOfRange;
}
