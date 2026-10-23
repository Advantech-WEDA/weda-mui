export type ThemeMode = 'light';

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === 'light';

export const initTheme = () => {
  const saved = localStorage.getItem('theme');

  const mode: ThemeMode = isThemeMode(saved) ? saved : 'light';

  document.documentElement.setAttribute('data-theme', mode);
};

export const setTheme = (mode: ThemeMode) => {
  document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem('theme', mode);
};

export const getTheme = (): ThemeMode => {
  return (localStorage.getItem('theme') as ThemeMode) || 'light';
};

export const toggleTheme = () => {
  const next = 'light';

  setTheme(next);
};
