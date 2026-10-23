import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Paper,
  Typography,
} from '@mui/material';

interface IProps {
  data: unknown;
}

export default function InformationJson({ data }: IProps) {
  return (
    <Accordion variant="outlined" disableGutters>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontSize={14}>View raw data</Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            maxHeight: 420,
            overflow: 'auto',
            backgroundColor: 'var(--mui-palette-background-default)',
          }}
        >
          <Box
            component="pre"
            sx={{
              m: 0,
              fontSize: 12,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {JSON.stringify(data, null, 2)}
          </Box>
        </Paper>
      </AccordionDetails>
    </Accordion>
  );
}
