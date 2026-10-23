const APP_ROUTE_SEGMENT = 'weda';

export const APP_ROUTE_PATTERN = `/:tenant/${APP_ROUTE_SEGMENT}`;

export const getAppBasePath = (tenant: string): string => {
  if (!tenant) {
    throw new Error('tenant is required to build the WEDA app path');
  }

  return `/${tenant}/${APP_ROUTE_SEGMENT}`;
};
