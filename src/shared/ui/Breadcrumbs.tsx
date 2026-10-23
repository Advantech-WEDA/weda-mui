import './Breadcrumbs.scss';

import { Breadcrumbs as MuiBreadcrumbs, Link as MuiLink } from '@mui/material';
import { Link, useMatches } from 'react-router-dom';

export interface IBreadcrumbItem {
  label: string;
  to?: string;
}

export interface IBreadcrumbHandle {
  breadcrumb: IBreadcrumbItem[];
}

export default function Breadcrumbs() {
  const matches = useMatches();

  const activeMatch = [...matches]
    .reverse()
    .find(
      (match) => (match.handle as IBreadcrumbHandle | undefined)?.breadcrumb
    );

  const items = (activeMatch?.handle as IBreadcrumbHandle | undefined)
    ?.breadcrumb;

  if (!items || items.length === 0) return null;

  const params = activeMatch?.params ?? {};

  const resolveTo = (to: string) =>
    to
      .split('/')
      .map((segment) =>
        segment.startsWith(':')
          ? (params[segment.slice(1)] ?? segment)
          : segment
      )
      .join('/');

  return (
    <MuiBreadcrumbs separator="" className="app-breadcrumbs">
      {items.map((item) => (
        <span key={item.label} className="app-breadcrumbs__item">
          {item.to ? (
            <MuiLink
              component={Link}
              to={resolveTo(item.to)}
              underline="hover"
              color="text.primary"
              className="app-breadcrumbs__link"
            >
              {item.label}
            </MuiLink>
          ) : (
            <span className="app-breadcrumbs__current">{item.label}</span>
          )}
          <span className="app-breadcrumbs__separator"> /</span>
        </span>
      ))}
    </MuiBreadcrumbs>
  );
}
