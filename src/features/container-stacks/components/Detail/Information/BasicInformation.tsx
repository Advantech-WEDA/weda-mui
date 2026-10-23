import { Box, Paper, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

import type { ICreateStackConfigPayload } from '../../../api/stacks.api.types';

interface IProps {
  stackData: ICreateStackConfigPayload;
  information: {
    key: string;
    title: string;
  };
  sectionRef: (el: HTMLDivElement | null) => void;
}

export default function BasicInformation({
  stackData,
  information,
  sectionRef,
}: IProps) {
  const { stackConfigId, stackRevisionId } = useParams<{
    stackConfigId: string;
    stackRevisionId: string;
  }>();

  const rows = [
    ['Stack config ID', stackConfigId ?? '-'],
    ['Latest revision ID', stackRevisionId ?? '-'],
    ['Type', stackData.type ?? '-'],
    ['Description', stackData.description ?? '-'],
  ];

  return (
    <Box ref={sectionRef} sx={{ mb: 5 }}>
      <Typography variant="h5" sx={{ p: 2 }}>
        {information.title}
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          m: 2,
          overflow: 'hidden',
          borderRadius: 1,
          border: '1px solid var(--divider, rgba(0, 0, 0, 0.12))',
        }}
      >
        {rows.length === 0 ? (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              fontSize: 14,
              color: 'text.secondary',
            }}
          >
            No basic information
          </Box>
        ) : (
          rows.map(([label, value], index) => (
            <Stack
              key={label}
              direction="row"
              sx={{
                backgroundColor:
                  ' var(--library-clickable-layer, rgba(0, 0, 0, 0.00));',
                borderBottom:
                  index !== rows.length - 1
                    ? '1px solid var(--divider, rgba(0, 0, 0, 0.12))'
                    : 'none',
              }}
            >
              <Box
                sx={{
                  width: 200,
                  px: 2,
                  py: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                {label}
              </Box>

              <Box
                sx={{
                  flex: 1,
                  px: 2,
                  py: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 14,
                  wordBreak: 'break-word',
                }}
              >
                {value}
              </Box>
            </Stack>
          ))
        )}
      </Paper>
    </Box>
  );
}
