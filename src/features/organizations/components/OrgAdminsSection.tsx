import {
  Autocomplete,
  Avatar,
  Box,
  Chip,
  Popper,
  type PopperProps,
  TextField,
  Typography,
} from '@mui/material';

import type { OrgAdminOption } from '../domain/types';

export type { OrgAdminOption };

interface IProps {
  options: OrgAdminOption[];
  value: OrgAdminOption[];

  currentUserId?: string;
  parentOrgId?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  onChange: (value: OrgAdminOption[]) => void;
}

const getInitial = (name: string) => {
  return name?.trim()?.charAt(0)?.toUpperCase() || '?';
};

export default function OrgAdminsSection({
  options,
  value,
  currentUserId,
  disabled,
  onChange,
  error,
  helperText,
}: IProps) {
  const BottomPopper = (props: PopperProps) => {
    return (
      <Popper
        {...props}
        placement="bottom-start"
        modifiers={[
          {
            name: 'flip',
            enabled: false,
          },
          {
            name: 'preventOverflow',
            enabled: false,
          },
        ]}
      />
    );
  };

  const isSelf = (id: string) => id === currentUserId;

  const getSelfOption = () => {
    return options.find((opt) => isSelf(opt.id));
  };

  const normalizeAdmins = (newValue: OrgAdminOption[]) => {
    const hasSelf = newValue.some((item) => isSelf(item.id));
    const selfOption = getSelfOption();

    if (!selfOption || hasSelf) {
      return newValue;
    }

    return [selfOption, ...newValue];
  };

  return (
    <Box className="editor-page__form">
      <Box className="editor-page__form-wrapper">
        <Autocomplete
          multiple
          disablePortal
          disableCloseOnSelect
          disableClearable
          size="small"
          disabled={disabled}
          options={options}
          value={value}
          className="editor-page__form-wrapper-autocomplete"
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, selected) => option.id === selected.id}
          getOptionDisabled={(option) => isSelf(option.id)}
          onChange={(_, newValue) => {
            onChange(normalizeAdmins(newValue));
          }}
          slots={{
            popper: BottomPopper,
          }}
          slotProps={{
            paper: {
              className: 'editor-page__form-dropdown',
            },
            listbox: {
              className: 'editor-page__form-listbox',
            },
          }}
          renderValue={(selectedOptions, getItemProps) =>
            selectedOptions.map((option, index) => {
              const { key, onDelete, ...itemProps } = getItemProps({ index });
              const self = isSelf(option.id);

              return (
                <Chip
                  key={key}
                  {...itemProps}
                  size="small"
                  className={`editor-page__form-wrapper-chip ${
                    self ? 'is-self' : ''
                  }`}
                  avatar={
                    <Avatar className="editor-page__form-wrapper-chip-avatar">
                      {getInitial(option.name)}
                    </Avatar>
                  }
                  label={option.name}
                  onDelete={self ? undefined : onDelete}
                />
              );
            })
          }
          renderOption={(props, option) => {
            const self = isSelf(option.id);

            return (
              <Box
                component="li"
                {...props}
                className={`${props.className ?? ''} editor-page__form-wrapper-option ${
                  self ? 'is-self-option' : ''
                }`}
              >
                <Avatar className="editor-page__form-wrapper-option-avatar">
                  {getInitial(option.name)}
                </Avatar>

                <Box className="editor-page__form-wrapper-option-content">
                  <Typography variant="body2">{option.name}</Typography>

                  {option.email && (
                    <Typography variant="caption">({option.email})</Typography>
                  )}
                </Box>
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              error={error}
              helperText={helperText}
              label={
                <>
                  Org admins <span className="required">*</span>
                </>
              }
            />
          )}
        />
      </Box>
    </Box>
  );
}
