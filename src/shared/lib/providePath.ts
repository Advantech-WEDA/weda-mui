export const provideNonSlashPath = (pathName: string): string => {
  if (pathName.slice(-1) === '/') {
    const newPath = pathName.slice(0, -1);
    return newPath;
  }
  return pathName;
};
