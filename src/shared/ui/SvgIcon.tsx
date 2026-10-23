import { styled, type SxProps, type Theme } from '@mui/material/styles';
import React from 'react';

import { type IconName, icons } from '@/assets/icons';

type IProps = {
  name: IconName;
  size?: number;
  fillOpacity?: number;
  selected?: boolean;
  sx?: SxProps<Theme>;
  className?: string;
  color?: string;
  onClick?: () => void;
};

const IconRoot = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 0,
  flexShrink: 0,
});

const SvgIcon: React.FC<IProps> = ({
  name,
  size = 24,
  fillOpacity = 0.54,
  selected = undefined,
  sx,
  className,
  color = 'var(--action-active)',
  onClick,
}) => {
  const IconComponent = icons[name];
  if (!IconComponent) return null;

  const baseFillOpacity = selected === false ? fillOpacity : 1;

  return (
    <IconRoot
      className={className}
      onClick={onClick}
      sx={[
        {
          width: size,
          height: size,
          fillOpacity: baseFillOpacity,
          color: color,
          '& svg': {
            width: '100%',
            height: '100%',
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <IconComponent />
    </IconRoot>
  );
};

export default SvgIcon;
