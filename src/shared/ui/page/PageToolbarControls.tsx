import './PageToolbarControls.scss';

import {
  Button,
  type ButtonProps,
  InputAdornment,
  TextField,
  type TextFieldProps,
} from '@mui/material';
import clsx from 'clsx';

import SvgIcon from '../SvgIcon';

export const PageActionButton = ({ className, ...props }: ButtonProps) => {
  return <Button className={clsx('page-action-btn', className)} {...props} />;
};

type PageSearchFieldProps = Omit<TextFieldProps, 'slotProps'>;

export const PageSearchField = ({
  className,
  disabled,
  ...props
}: PageSearchFieldProps) => {
  return (
    <TextField
      placeholder="Search"
      className={clsx('page-search-field', className)}
      disabled={disabled}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SvgIcon
                name="SearchFilled"
                className="page-search-field__icon"
                sx={{
                  color: disabled
                    ? 'var(--action-disabled)'
                    : 'var(--action-active)',
                }}
              />
            </InputAdornment>
          ),
        },
      }}
      {...props}
    />
  );
};
