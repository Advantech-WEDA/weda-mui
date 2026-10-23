import './DetailPageLayout.scss';

import { Box, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import type { ReactNode } from 'react';

import Breadcrumbs from '../Breadcrumbs';

export interface IDetailPageTab {
  label: string;
  value: string;
  component: ReactNode;
  disabled?: boolean;
}

interface IProps {
  title: ReactNode;
  onBack: () => void;
  actions?: ReactNode;
  tabs: IDetailPageTab[];
  activeTab: string;
  onChangeTab: (value: string) => void;
  contentKey?: string;
}

export default function DetailPageLayout({
  title,
  actions,
  tabs,
  activeTab,
  onChangeTab,
  contentKey,
}: IProps) {
  return (
    <Box className="detail-page">
      <Box className="detail-page__header">
        <Breadcrumbs />

        <Box className="detail-page__header-top">
          <Box className="detail-page__header-title">
            <Box className="detail-page__back">
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ minWidth: 0 }}
              >
                <Typography
                  variant="h4"
                  color="text.primary"
                  title={typeof title === 'string' ? title : undefined}
                  sx={{
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {title}
                </Typography>
              </Stack>
            </Box>
          </Box>

          {actions && (
            <Stack
              direction="row"
              spacing={1}
              className="detail-page__header-actions"
            >
              {actions}
            </Stack>
          )}
        </Box>
      </Box>

      {tabs.length > 1 && (
        <>
          <Box className="detail-page__tabs">
            <Tabs
              value={activeTab}
              onChange={(_, value) => onChangeTab(value)}
              sx={{
                minHeight: 42,

                '& .MuiTab-root': {
                  minHeight: 42,
                  textTransform: 'none',
                  fontSize: 14,
                },
              }}
            >
              {tabs.map((item) => (
                <Tab
                  key={item.value}
                  label={item.label}
                  value={item.value}
                  disabled={item.disabled}
                />
              ))}
            </Tabs>
          </Box>
          <Divider />
        </>
      )}

      <Box
        key={contentKey}
        className="detail-page__content"
        sx={{
          mt: 3,
        }}
      >
        {tabs.find((item) => item.value === activeTab)?.component}
      </Box>
    </Box>
  );
}
