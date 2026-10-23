/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_ORIGIN: string;

  readonly VITE_AUTH_MODE?: string;

  readonly VITE_AUTH_CLIENT_ID?: string;
}

interface Window {
  __ENV__?: {
    tenantType: 'singleTenant' | 'saas';
  };
}

declare module '*.svg?react' {
  import * as React from 'react';

  const ReactComponent: React.FC<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  export default ReactComponent;
}
