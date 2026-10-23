import { Box, Paper } from '@mui/material';
import clsx from 'clsx';

interface IProps {
  activeTab: string;
  onTabClick: (tab: string) => void;
  items: {
    key: string;
    label: string;
  }[];
  className?: string;
  itemClassName?: string;
  activeClassName?: string;
}
export default function SideTabs({
  activeTab,
  onTabClick,
  items,
  className,
  itemClassName,
  activeClassName,
}: IProps) {
  return (
    <Paper elevation={0} className={className} sx={{ fontSize: '16px' }}>
      {items.map((item) => {
        const isActive = activeTab === item.key;

        return (
          <Box
            key={item.key}
            onClick={() => onTabClick(item.key)}
            className={clsx(itemClassName, isActive && activeClassName)}
          >
            {item.label}
          </Box>
        );
      })}
    </Paper>
  );
}
