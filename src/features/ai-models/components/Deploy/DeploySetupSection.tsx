import { Box, InputAdornment, TextField, Typography } from '@mui/material';
import { SelectElement } from '@shared/ui';

import {
  ALGORITHM_OPTIONS,
  APPLY_OPTIONS,
  type ChecksumAlgorithm,
  DEFAULT_MAX_USAGE_PERCENT,
  type DeployApplyAction,
  type DeployPreCheckAction,
  type DeploySetup,
  type DeploySetupErrors,
  type DeployValidateAction,
  type EditionChecksumStatus,
  PRE_CHECK_OPTIONS,
  VALIDATE_OPTIONS,
} from '@/features/ai-models/domain/deploySetup';

interface IProps {
  setup: DeploySetup;
  errors: DeploySetupErrors;
  checksumStatus?: EditionChecksumStatus;

  showExpectedChecksum?: boolean;
  onChange: (patch: Partial<DeploySetup>) => void;
}

const PRE_CHECK_HELPER: Record<DeployPreCheckAction, string> = {
  NOOP: 'The device starts downloading right away without checking its free disk space.',
  CHECK_DISK_USAGE:
    'The device checks its disk usage before downloading. The deployment is rejected if usage already exceeds the maximum below.',
};

const MAX_USAGE_HELPER =
  'The highest disk usage the device may have before the download starts. The deployment is rejected if the current usage is above this value.';

const VALIDATE_HELPER: Record<DeployValidateAction, string> = {
  NOOP: 'The device trusts the downloaded file without checking it again.',
  CHECKSUM_VERIFY:
    'After the download, the device calculates the file’s checksum and compares it with the expected value. The model is not applied if they differ.',
};

const EXPECTED_CHECKSUM_HELPER =
  'The checksum recorded when the edition was uploaded. The device compares the downloaded file against it.';

const APPLY_HELPER: Record<DeployApplyAction, string> = {
  NOOP: 'The model file reaches the device, but the running container keeps serving the old edition until a follow-up deployment applies it.',
  ATOMIC_SWAP_AND_RESTART_CONTAINER:
    'The device replaces the active model file in one step, then restarts the selected container to load it. The container is briefly unavailable.',
};

const getChecksumHelperText = (
  status: EditionChecksumStatus,
  error: string | undefined
) => {
  if (status === 'loading') return 'Loading the edition’s checksum...';
  if (status === 'error') return 'Couldn’t load the edition’s checksum.';
  return error ?? EXPECTED_CHECKSUM_HELPER;
};

const requiredLabel = (text: string) => (
  <>
    {text} <span className="required">*</span>
  </>
);

export default function DeploySetupSection({
  setup,
  errors,
  checksumStatus = 'idle',
  showExpectedChecksum = true,
  onChange,
}: IProps) {
  return (
    <>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5">Deploy setup</Typography>
      </Box>

      <Box className="editor-page__form" sx={{ px: 2 }}>
        <Box className="editor-page__form-wrapper">
          <SelectElement
            required
            fullWidth
            label={requiredLabel('Pre-check')}
            value={setup.preCheck}
            options={PRE_CHECK_OPTIONS}
            helperText={PRE_CHECK_HELPER[setup.preCheck]}
            onChange={(value) =>
              onChange({
                preCheck: value as DeployPreCheckAction,

                ...(value === 'CHECK_DISK_USAGE' && {
                  maxUsagePercent: DEFAULT_MAX_USAGE_PERCENT,
                }),
              })
            }
          />
        </Box>

        {setup.preCheck === 'CHECK_DISK_USAGE' && (
          <Box className="editor-page__form-wrapper">
            <TextField
              fullWidth
              size="small"
              className="editor-page__form-wrapper-textfield"
              label={requiredLabel('Maximum disk usage')}
              value={setup.maxUsagePercent}
              error={Boolean(errors.maxUsagePercent)}
              helperText={errors.maxUsagePercent ?? MAX_USAGE_HELPER}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                  inputProps: { inputMode: 'numeric' },
                },
              }}
              onChange={(e) =>
                onChange({
                  maxUsagePercent: e.target.value.replace(/\D/g, ''),
                })
              }
            />
          </Box>
        )}

        <Box className="editor-page__form-wrapper">
          <SelectElement
            required
            fullWidth
            label={requiredLabel('Validate')}
            value={setup.validate}
            options={VALIDATE_OPTIONS}
            helperText={VALIDATE_HELPER[setup.validate]}
            onChange={(value) =>
              onChange({ validate: value as DeployValidateAction })
            }
          />
        </Box>

        {setup.validate === 'CHECKSUM_VERIFY' && (
          <>
            <Box className="editor-page__form-wrapper">
              <SelectElement
                required
                fullWidth
                label={requiredLabel('Algorithm')}
                value={setup.algorithm}
                options={ALGORITHM_OPTIONS}
                onChange={(value) =>
                  onChange({ algorithm: value as ChecksumAlgorithm })
                }
              />
            </Box>

            {showExpectedChecksum && (
              <Box className="editor-page__form-wrapper">
                <TextField
                  fullWidth
                  size="small"
                  className="editor-page__form-wrapper-textfield"
                  label={requiredLabel('Expected checksum')}
                  value={
                    checksumStatus === 'loaded' ? setup.expectedChecksum : ''
                  }
                  disabled
                  error={
                    checksumStatus === 'error' ||
                    (checksumStatus === 'loaded' &&
                      Boolean(errors.expectedChecksum))
                  }
                  helperText={getChecksumHelperText(
                    checksumStatus,
                    errors.expectedChecksum
                  )}
                />
              </Box>
            )}
          </>
        )}

        <Box className="editor-page__form-wrapper">
          <SelectElement
            required
            fullWidth
            label={requiredLabel('Apply')}
            value={setup.apply}
            options={APPLY_OPTIONS}
            helperText={APPLY_HELPER[setup.apply]}
            onChange={(value) =>
              onChange({ apply: value as DeployApplyAction })
            }
          />
        </Box>
      </Box>
    </>
  );
}
