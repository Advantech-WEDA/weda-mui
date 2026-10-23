import { Box, Button, IconButton, TextField } from '@mui/material';
import { SvgIcon } from '@shared/ui';
import type { ReactNode } from 'react';

import { formatFileSize } from '@/features/ai-models/components/fileSizeDisplay';
import type { FileHashState } from '@/features/ai-models/domain/fileHash';
import { EDITION_NAME_MAX_LENGTH } from '@/features/ai-models/domain/validateRules';

export interface IEditionFieldsInput {
  editionName: string;
  editionNameDisabled: boolean;
  description: string;
  showFile: boolean;
  fileDisabled?: boolean;
  file: File | null;
  existingFileName?: string | null;
  fileHash?: FileHashState;
}

export interface IEditionFieldsErrors {
  edition?: boolean;
  editionMessage?: string;
  description?: boolean;
  descriptionMessage?: string;
  file?: boolean;
  fileMessage?: string;
}

interface IProps {
  beforeContent?: ReactNode;

  input: IEditionFieldsInput;
  errors?: IEditionFieldsErrors;

  onEditionNameChange?: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFileChange?: (file: File | null) => void;
  onCancelHash?: () => void;
  onRetryHash?: () => void;
}

export default function EditionFields({
  beforeContent,

  input: {
    editionName,
    editionNameDisabled,
    description,
    showFile,
    fileDisabled = false,
    file,
    existingFileName,
    fileHash = { status: 'idle' },
  },
  errors: {
    edition: editionNameError = false,
    editionMessage: editionNameHelperText = '',
    description: descriptionError = false,
    descriptionMessage: descriptionHelperText = '',
    file: fileError = false,
    fileMessage: fileHelperText = '',
  } = {},

  onEditionNameChange,
  onDescriptionChange,
  onFileChange,
  onCancelHash,
  onRetryHash,
}: IProps) {
  const displayFileName = file?.name ?? existingFileName ?? '';

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;

    onFileChange?.(nextFile);
    event.target.value = '';
  };

  return (
    <Box className="editor-page__form">
      {beforeContent}

      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          className="editor-page__form-wrapper-textfield"
          label={
            <>
              Edition name <span className="required">*</span>
            </>
          }
          multiline
          minRows={1}
          maxRows={5}
          value={editionName}
          disabled={editionNameDisabled}
          error={editionNameError}
          helperText={editionNameError ? editionNameHelperText : ''}
          slotProps={{
            input: {
              inputProps: {
                maxLength: EDITION_NAME_MAX_LENGTH,
              },
            },
          }}
          onChange={(e) => onEditionNameChange?.(e.target.value)}
        />

        {!editionNameDisabled && (
          <Box className="editor-page__form-wrapper-helper">
            {editionName.trim().length}/{EDITION_NAME_MAX_LENGTH}
          </Box>
        )}
      </Box>

      <Box className="editor-page__form-wrapper">
        <TextField
          fullWidth
          size="small"
          className="editor-page__form-wrapper-description"
          label="Description"
          multiline
          minRows={1}
          maxRows={5}
          value={description}
          error={descriptionError}
          helperText={descriptionError ? descriptionHelperText : ''}
          slotProps={{
            input: {
              inputProps: {
                maxLength: 500,
              },
              sx: {
                padding: '16px 12px',
              },
            },
          }}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />

        <Box className="editor-page__form-wrapper-helper">
          {description.trim().length}/500
        </Box>
      </Box>

      {showFile && (
        <Box className="editor-page__form-wrapper">
          <TextField
            fullWidth
            size="small"
            label={
              <>
                File <span className="required">*</span>
              </>
            }
            value={displayFileName}
            disabled={fileDisabled}
            error={fileError || fileHash.status === 'error'}
            helperText={
              fileError
                ? fileHelperText
                : fileHash.status === 'error'
                  ? fileHash.message
                  : fileHash.status === 'cancelled'
                    ? 'File preparation cancelled. Retry to continue.'
                    : ''
            }
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                  <IconButton
                    component="label"
                    size="small"
                    disabled={fileDisabled}
                  >
                    <SvgIcon
                      name="FileUploadOutlined"
                      sx={{
                        color: fileDisabled
                          ? 'var(--action-disabled)'
                          : 'var(--action-active)',
                      }}
                    />

                    <input
                      hidden
                      type="file"
                      disabled={fileDisabled}
                      onChange={handleFileChange}
                    />
                  </IconButton>
                ),
              },
            }}
          />

          {file && !fileError && (
            <Box className="editor-page__form-wrapper-helper">
              {formatFileSize(file.size)}
              {fileHash.status === 'hashing' && (
                <span role="status">
                  {' '}
                  · Preparing file: {fileHash.progress}%
                </span>
              )}
              {fileHash.status === 'done' && ' · Ready to upload'}
            </Box>
          )}
          {file && fileHash.status === 'hashing' && onCancelHash && (
            <Button size="small" onClick={onCancelHash}>
              Cancel preparation
            </Button>
          )}
          {file &&
            (fileHash.status === 'error' || fileHash.status === 'cancelled') &&
            onRetryHash && (
              <Button size="small" onClick={onRetryHash}>
                Retry preparation
              </Button>
            )}
        </Box>
      )}
    </Box>
  );
}
