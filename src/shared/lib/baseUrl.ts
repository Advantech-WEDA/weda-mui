const getSegments = (): string[] => {
  return window.location.pathname.split('/').filter(Boolean);
};

export const getTenant = (): string => {
  const segments = getSegments();
  return segments.length > 0 ? `${segments[0]}` : 'central';
};
