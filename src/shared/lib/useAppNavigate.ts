import { type NavigateOptions, useNavigate, useParams } from 'react-router-dom';

import { getAppBasePath } from './appRoute';

export function useAppNavigate() {
  const { tenant } = useParams<'tenant'>();
  const navigate = useNavigate();

  if (!tenant) {
    throw new Error('useAppNavigate must be used under a /:tenant route');
  }

  return (path: string | number, options?: NavigateOptions) => {
    if (typeof path === 'number') {
      navigate(path);
      return;
    }

    navigate(`${getAppBasePath(tenant)}${path}`, options);
  };
}
