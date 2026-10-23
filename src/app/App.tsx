import { RouterProvider } from 'react-router-dom';

import { AppThemeProvider } from '@/app/providers/theme';
import { router } from '@/app/router';

export function App() {
  return (
    <AppThemeProvider>
      <RouterProvider router={router} />
    </AppThemeProvider>
  );
}
