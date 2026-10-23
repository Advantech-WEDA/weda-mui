import { getAppBasePath } from '@shared/lib/appRoute';
import { getTenant } from '@shared/lib/baseUrl';

export function apiPath(path: string): string {
  const tenantPath = getTenant();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${getAppBasePath(tenantPath)}${normalizedPath}`;
}
