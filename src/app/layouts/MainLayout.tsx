import './layout.scss';

import LayoutHeader from '@app/layouts/Header';
import Sidebar from '@app/layouts/Sidebar';
import { Box, CssBaseline } from '@mui/material';
import clsx from 'clsx';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  return (
    <Box className="layout-root">
      <CssBaseline />

      <Box className="layout-header">
        <LayoutHeader />
      </Box>

      <Box className="layout-body">
        <Box
          className={clsx(
            'layout-sidebar',
            collapsed ? 'collapsed' : 'expanded'
          )}
        >
          <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
        </Box>

        <Box className="layout-content">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
