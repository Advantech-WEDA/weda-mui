import '@app/styles/global.scss';
import 'react-medium-image-zoom/dist/styles.css';

import { completeSignInIfCallback } from '@shared/auth/authCodeSession';
import { isAuthCodeMode } from '@shared/auth/authMode';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';
import { initTheme } from '@/app/providers/themeMode';

initTheme();

const renderApp = () =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );

if (isAuthCodeMode()) {
  void completeSignInIfCallback().then((handled) => handled || renderApp());
} else {
  renderApp();
}
