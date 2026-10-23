import './PageListLayout.scss';

import { Box, Paper, Typography } from '@mui/material';
import type { ReactNode } from 'react';

import Breadcrumbs from '../Breadcrumbs';

interface IProps {
  title: ReactNode;
  subtitle?: ReactNode;
  summary?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  disableGutters?: boolean;
  hasBreadcrumbs?: boolean;
}

const PageListLayout = ({
  title,
  subtitle,
  summary,
  toolbar,
  children,
  disableGutters,
  hasBreadcrumbs = true,
}: IProps) => {
  return (
    <Box
      className={
        disableGutters
          ? 'page-list-layout page-list-layout--no-gutters'
          : 'page-list-layout'
      }
    >
      <Paper elevation={0} className="page-list-layout__paper">
        <Box className="page-list-layout__header">
          {hasBreadcrumbs && <Breadcrumbs />}

          <Typography variant="h4" className="page-list-layout__title">
            {title}
          </Typography>

          {subtitle && (
            <Typography variant="body2" color="var(--text-secondary)">
              {subtitle}
            </Typography>
          )}
        </Box>

        {summary}

        {toolbar && <Box className="page-list-layout__toolbar">{toolbar}</Box>}

        {children}
      </Paper>
    </Box>
  );
};

export default PageListLayout;
