import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  if (command === 'serve' && !env.VITE_ORIGIN) {
    throw new Error(
      [
        '',
        '  VITE_ORIGIN is not set.',
        '',
        '  VITE_ORIGIN names the backend this dev server proxies to. Create .env',
        '  from the example and set your own value:',
        '',
        '    cp .env.example .env',
        '',
        '  See "Configuration" in README.md.',
        '',
      ].join('\n')
    );
  }

  const isAuthCodeMode = env.VITE_AUTH_MODE === 'authcode';

  return {
    base: './',

    server: {
      port: 9001,

      strictPort: isAuthCodeMode,
      proxy: {
        ...(isAuthCodeMode && {
          '/identity/connect/token': {
            target: env.VITE_ORIGIN,
            changeOrigin: true,
            secure: false,
          },
        }),
        '/platform': {
          target: env.VITE_ORIGIN,
          changeOrigin: true,
          secure: false,
        },
        '/central/portal/api': {
          target: env.VITE_ORIGIN,
          changeOrigin: true,
          secure: false,
        },
        '/central/weda/api': {
          target: env.VITE_ORIGIN,
          changeOrigin: true,
          secure: false,
        },
        '/api': {
          target: env.VITE_ORIGIN,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        '@app': resolve(__dirname, './src/app'),
        '@features': resolve(__dirname, './src/features'),
        '@shared': resolve(__dirname, './src/shared'),
        '@': resolve(__dirname, './src'),
      },
    },
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
      svgr({
        svgrOptions: {
          icon: true,
          expandProps: false,
          svgProps: {
            fill: 'currentColor',
          },
        },
      }),
    ],
  };
});
