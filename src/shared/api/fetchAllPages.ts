export const MAX_PAGE_SIZE = 100;

interface IPagedResponse<T> {
  items: T[] | null;
  totalCount: number;
}

export const fetchAllPages = async <T>(
  fetchPage: (page: {
    skipCount: number;
    maxResultCount: number;
  }) => Promise<IPagedResponse<T>>,
  pageSize: number = MAX_PAGE_SIZE
): Promise<{ items: T[]; totalCount: number }> => {
  const maxResultCount = Math.min(Math.max(1, pageSize), MAX_PAGE_SIZE);

  const firstPage = await fetchPage({ skipCount: 0, maxResultCount });

  const totalPages = Math.ceil(firstPage.totalCount / maxResultCount);

  const restPages = await Promise.all(
    Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) =>
      fetchPage({ skipCount: (i + 1) * maxResultCount, maxResultCount })
    )
  );

  return {
    totalCount: firstPage.totalCount,
    items: [firstPage, ...restPages].flatMap((page) => page.items ?? []),
  };
};
