import { Box, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface InfoSectionRow {
  label: string;
  value: ReactNode;
}

interface IProps {
  title: string;
  rows: InfoSectionRow[];
  sectionRef: (el: HTMLDivElement | null) => void;
}

export default function InfoSection({ title, rows, sectionRef }: IProps) {
  return (
    <Box ref={sectionRef} sx={{ mb: 5 }}>
      <Typography variant="h5" sx={{ p: 2 }}>
        {title}
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
        {rows.map(({ label, value }, index) => (
          <Stack
            key={label}
            direction="row"
            sx={{
              minHeight: 44,
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
                flexShrink: 0,
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
        ))}
      </Paper>
    </Box>
  );
}
