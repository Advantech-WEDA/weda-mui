import { Box, Typography } from '@mui/material';

import InformationRows from './InformationRows';
import InformationTable from './InformationTable';
import type { InformationSectionData } from './types';

interface IProps {
  section: InformationSectionData;
  sectionRef: (el: HTMLDivElement | null) => void;
}

export default function InformationSection({ section, sectionRef }: IProps) {
  return (
    <Box ref={sectionRef} sx={{ mb: 5 }}>
      <Typography variant="h5" sx={{ p: 2 }}>
        {section.title}
      </Typography>

      {section.type === 'rows' && <InformationRows rows={section.rows ?? []} />}

      {section.type === 'table' && (
        <InformationTable
          columns={section.tableColumns ?? []}
          rows={section.tableRows ?? []}
        />
      )}
    </Box>
  );
}
