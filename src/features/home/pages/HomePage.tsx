import './HomePage.scss';

import { Box, Typography } from '@mui/material';

function Home() {
  return (
    <Box component="article" className="home-announcement">
      <Typography
        variant="h4"
        component="h2"
        className="announcement-title"
        gutterBottom
      >
        Version Information
      </Typography>

      <Typography
        variant="body1"
        className="announcement-version"
        sx={{ mb: 3 }}
      >
        Version: V1.2.0
      </Typography>

      <Box component="section" className="announcement-section" sx={{ mb: 4 }}>
        <Typography variant="h5" component="h3" gutterBottom>
          Feature Overview
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          This project currently provides the following core functionalities:
        </Typography>

        <Box component="ul" className="announcement-list" sx={{ pl: 3, m: 0 }}>
          <Box component="li">
            <Typography variant="body1">User Management</Typography>
          </Box>

          <Box component="li">
            <Typography variant="body1">Organization Management</Typography>
          </Box>

          <Box component="li">
            <Typography variant="body1">Device Management</Typography>
          </Box>

          <Box component="li">
            <Typography variant="body1">
              Create Client Credential for Third-Party Use
            </Typography>
          </Box>

          <Box component="li">
            <Typography variant="body1">Container Stack Management</Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">Container Stack Deployment</Typography>
          </Box>

          <Box component="li">
            <Typography variant="body1">Registries</Typography>
          </Box>

          <Box component="li">
            <Typography variant="body1">AI Model Deployment</Typography>
          </Box>
        </Box>
      </Box>

      <Box component="section" className="announcement-section" sx={{ mb: 4 }}>
        <Typography variant="h5" component="h3" gutterBottom>
          Coming Soon
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          Future development will continue to expand the feature set, including
          but not limited to:
        </Typography>

        <Box component="ul" className="announcement-list" sx={{ pl: 3, m: 0 }}>
          <Box component="li">
            <Typography variant="body1">MQTT Broker Configs </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">DataStream Bridges </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">Analyzer </Typography>
          </Box>
        </Box>
      </Box>

      <Box component="section" className="announcement-section">
        <Typography variant="h5" component="h3" gutterBottom>
          Our Commitment
        </Typography>

        <Typography variant="body1">
          We will continue enhancing the platform with more comprehensive and
          powerful management capabilities to better support your needs.
        </Typography>
      </Box>
    </Box>
  );
}

export default Home;
