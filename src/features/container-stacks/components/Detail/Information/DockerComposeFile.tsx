import { Box, Button, Paper, Typography } from '@mui/material';

interface IProps {
  content: string;
  information: {
    key: string;
    title: string;
  };
  sectionRef: (el: HTMLDivElement | null) => void;
}

export default function DockerComposeFile({
  content,
  information,
  sectionRef,
}: IProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
  };

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
        <Box
          component="pre"
          sx={{
            px: 2,
            py: 1.5,
            height: 'auto',
            minHeight: 200,
            maxHeight: 525,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: content ? 'monospace' : 'inherit',
            color: content ? 'inherit' : 'text.secondary',
          }}
        >
          {content || 'No docker compose file content'}
        </Box>

        <Box
          sx={{
            p: 2,
            borderTop: '1px solid #eee',
          }}
        >
          <Button
            variant="outlined"
            size="small"
            sx={{
              textTransform: 'none',
              height: 42,
              minWidth: 157,
              fontSize: 15,
            }}
            onClick={handleCopy}
          >
            Copy to clipboard
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
