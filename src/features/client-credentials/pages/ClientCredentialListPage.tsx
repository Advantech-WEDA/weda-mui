import './ClientCredentialListPage.scss';

import { Box, Typography } from '@mui/material';
import { ScrollSideTabs } from '@shared/ui';
import { useRef } from 'react';

import ClientCredentialsTable from '../components/ClientCredentialsTable';
import { useClientCredentialListPage } from '../hooks/useClientCredentialListPage';

const TAB_ITEMS = [{ key: 'clientCredentials', label: 'Client credentials' }];

function ClientCredentials() {
  const listPage = useClientCredentialListPage();

  const clientCredentialsRef = useRef<HTMLDivElement | null>(null);

  const sections = [
    {
      key: 'clientCredentials',
      ref: clientCredentialsRef,
      id: 'client-credentials-section',
    },
  ];

  return (
    <Box
      className="client-credentials-page"
      sx={{ backgroundColor: 'var(--background-color)', padding: '24px' }}
    >
      <Typography
        variant="h4"
        sx={{ fontSize: 32 }}
        className="client-credentials-title"
      >
        OAuth 2.0 Client Credentials
      </Typography>

      <Box className="client-credentials-content">
        <Box className="client-credentials-main">
          <Box
            id="client-credentials-section"
            ref={clientCredentialsRef}
            className="client-credentials-section"
          >
            <Box className="client-credentials-section-header">
              <Typography
                variant="h5"
                className="client-credentials-section-header-title"
              >
                Client credentials
              </Typography>
            </Box>

            <ClientCredentialsTable {...listPage} />
          </Box>
        </Box>
        <ScrollSideTabs sections={sections} tabItems={TAB_ITEMS} />
      </Box>
    </Box>
  );
}

export default ClientCredentials;
