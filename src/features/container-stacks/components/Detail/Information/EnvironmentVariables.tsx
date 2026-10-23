import { Box, Paper, Stack, Typography } from '@mui/material';

interface EnvRow {
  key: string;
  value: string;
}

interface IProps {
  rows: EnvRow[];
  information: {
    key: string;
    title: string;
  };
  sectionRef: (el: HTMLDivElement | null) => void;
}

export default function EnvironmentVariables({
  rows,
  information,
  sectionRef,
}: IProps) {
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
            No environment variables
          </Box>
        ) : (
          rows.map(({ key, value }, index) => (
            <Stack
              key={key}
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
                {key}
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
