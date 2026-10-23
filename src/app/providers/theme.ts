import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';

export const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#1976d2' },
      },
    },
  },
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(
    ThemeProvider,
    { theme },
    React.createElement(CssBaseline, null),
    children
  );
}
