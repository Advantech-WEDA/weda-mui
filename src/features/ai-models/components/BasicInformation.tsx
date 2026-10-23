import { Autocomplete, Box, TextField } from '@mui/material';
import { SvgIcon } from '@shared/ui';

import type { IAiModelItem } from '@/features/ai-models/api/aiModels.api.types';
import { MODEL_NAME_MAX_LENGTH } from '@/features/ai-models/domain/validateRules';

export interface IBasicInformationInput {
  aiModelItems: IAiModelItem[];
  modelNameInput: string;
  selectedModel: IAiModelItem | null;
  modelDescription: string;
}

export interface IBasicInformationErrors {
  modelName?: boolean;
  modelNameMessage?: string;
}

interface IProps {
  input: IBasicInformationInput;
  errors?: IBasicInformationErrors;
  onSelectExisting: (model: IAiModelItem | null) => void;
  onChangeNameInput: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export default function BasicInformation({
  input: { aiModelItems, modelNameInput, selectedModel, modelDescription },
  errors: { modelName: modelNameError = false, modelNameMessage = '' } = {},
  onSelectExisting,
  onChangeNameInput,
  onDescriptionChange,
}: IProps) {
  return (
    <Box className="editor-page__form">
      <Box className="editor-page__form-wrapper">
        <Autocomplete
          freeSolo
          fullWidth
          size="small"
          className="editor-page__form-wrapper-textfield"
          popupIcon={<SvgIcon name="ExpandMoreFilled" />}
          slotProps={{ listbox: { sx: { maxHeight: 400 } } }}
          options={aiModelItems}
          value={selectedModel}
          inputValue={modelNameInput}
          getOptionLabel={(option) =>
            typeof option === 'string' ? option : (option.modelName ?? '')
          }
          isOptionEqualToValue={(option, value) =>
            option.modelId === value.modelId
          }
          onChange={(_, newValue) => {
            if (newValue && typeof newValue !== 'string') {
              onSelectExisting(newValue);
              onChangeNameInput(newValue.modelName ?? '');
            }
          }}
          onInputChange={(_, newInputValue, reason) => {
            onChangeNameInput(newInputValue);

            if (reason === 'input') {
              onSelectExisting(null);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              multiline
              minRows={1}
              maxRows={5}
              label={
                <>
                  AI model name <span className="required">*</span>
                </>
              }
              error={modelNameError}
              helperText={modelNameError ? modelNameMessage : ''}
              slotProps={{
                htmlInput: {
                  ...params.inputProps,
                  maxLength: MODEL_NAME_MAX_LENGTH,
                },
              }}
            />
          )}
        />

        <Box className="editor-page__form-wrapper-helper">
          {modelNameInput.trim().length}/{MODEL_NAME_MAX_LENGTH}
        </Box>
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
          value={modelDescription}
          disabled={Boolean(selectedModel)}
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
          {modelDescription.trim().length}/500
        </Box>
      </Box>
    </Box>
  );
}
