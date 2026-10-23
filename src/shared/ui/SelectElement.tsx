import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import clsx from 'clsx';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface IProps<T extends string = string> {
  value: string | T | '';
  options: SelectOption[];
  onChange: (value: string | T | '') => void;
  minWidth?: number | string;
  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  loading?: boolean;
  clearable?: boolean;
  fullWidth?: boolean;
  width?: number | string;
  height?: number;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
  menuMaxHeight?: number;
  name?: string;
  id?: string;
  className?: string;
  required?: boolean;
}

const SelectElement = <T extends string = string>({
  value,
  options,
  onChange,
  placeholder = '-- Select --',
  label,
  helperText,
  error = false,
  disabled = false,
  loading = false,
  fullWidth = false,
  minWidth = 160,
  width,
  height = 40,
  size = 'small',
  name,
  id,
  className,
  sx,
  required = false,
}: IProps<T>) => {
  const labelId = id ? `${id}-label` : undefined;

  const normalizedValue = value ?? '';

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value as string | T | '');
  };

  const selectedOption = options.find((item) => item.value === normalizedValue);

  return (
    <FormControl
      fullWidth={fullWidth}
      error={error}
      disabled={disabled}
      size={size}
      className={clsx('select', className)}
      sx={{
        minWidth: fullWidth ? undefined : minWidth,
        width,
      }}
    >
      {label ? <InputLabel id={labelId}>{label}</InputLabel> : null}

      <Stack
        direction="row"
        alignItems="flex-end"
        spacing={0.5}
        className="select__stack"
      >
        <Select
          id={id}
          name={name}
          labelId={labelId}
          value={normalizedValue}
          label={label}
          displayEmpty
          onChange={handleChange}
          fullWidth={fullWidth}
          disabled={disabled || loading}
          renderValue={(selected) => {
            if (!selected) {
              return (
                <Typography
                  component="span"
                  sx={{
                    color: 'text.disabled',
                  }}
                >
                  {placeholder}
                </Typography>
              );
            }

            return (
              <Typography
                component="span"
                sx={{
                  color: 'text.primary',
                }}
              >
                {selectedOption?.label ?? selected}
              </Typography>
            );
          }}
          MenuProps={{
            disableAutoFocusItem: true,
            PaperProps: {
              sx: {
                elevation: 8,
              },
            },
            MenuListProps: {
              autoFocusItem: false,
            },
            slotProps: {
              paper: {
                onMouseDown: (e: { preventDefault: () => void }) => {
                  e.preventDefault();
                },
              },
            },
          }}
          sx={[
            {
              height,
              flex: 1,
              '& .MuiSelect-select': {
                py: 1,
                px: 1.5,
              },
            },
            ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
          ]}
        >
          {!required && (
            <MenuItem value="">
              <Typography
                component="span"
                sx={{
                  color: 'text.disabled',
                }}
              >
                {placeholder}
              </Typography>
            </MenuItem>
          )}

          {options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              sx={{
                '&.Mui-selected': {
                  color: 'primary.main',
                },
                '&.Mui-selected:hover': {
                  backgroundColor: 'var(--action-hover)',
                },
              }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
};

export default SelectElement;
