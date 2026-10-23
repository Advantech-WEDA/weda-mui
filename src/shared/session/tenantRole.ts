export function isTenantAdmin(
  claims: { role?: string } | null | undefined
): boolean {
  return claims?.role === 'admin';
}
