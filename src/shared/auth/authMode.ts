export function isAuthCodeMode(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_AUTH_MODE === 'authcode';
}
