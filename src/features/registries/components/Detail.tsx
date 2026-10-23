import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { formatLocalTime } from '@shared/lib/dayjs';
import { AppChip, Breadcrumbs } from '@shared/ui';
import { useParams } from 'react-router-dom';

import type { IRegistryItem } from '../api/registries.api.types';
import { REGISTRY_TYPE_CHIP } from './registryTypeChip';

interface IProps {
  registryData?: IRegistryItem;
  onDelete: (registryId: string) => void;
  onEdit: (registryId: string) => void;
}

type RegistryCredentialField = {
  label: string;
  key: string;
  mask?: boolean;
};

const CREDENTIAL_FIELDS_MAP: Record<string, RegistryCredentialField[]> = {
  AwsECR: [
    { label: 'Region', key: 'region' },
    { label: 'Access Key', key: 'encryptedAccessKey', mask: true },
    {
      label: 'Access Secret Key',
      key: 'encryptedAccessSecretKey',
      mask: true,
    },
  ],

  AzureACR: [
    { label: 'User Name', key: 'username' },
    { label: 'Password', key: 'encryptedUserPassword', mask: true },
  ],

  DockerHub: [
    { label: 'User Name', key: 'username' },
    { label: 'Access Token', key: 'encryptedAccessToken', mask: true },
  ],

  Custom: [
    { label: 'User Name', key: 'username' },
    { label: 'Password', key: 'encryptedUserPassword', mask: true },
  ],
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" sx={{ minHeight: 32 }}>
      <Typography
        sx={{
          width: { xs: 120, sm: 216 },
          minWidth: 80,
          fontSize: 13,
          color: '#424242',
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>

      {typeof value === 'string' ? (
        <Typography
          sx={{ fontSize: 13, color: '#000', wordBreak: 'break-all' }}
        >
          {value || '-'}
        </Typography>
      ) : (
        value
      )}
    </Stack>
  );
}

function getDisplayValue(value: unknown, mask?: boolean) {
  if (!value) return '-';

  if (mask) return '**********';

  return String(value);
}

export default function Detail({ registryData, onDelete, onEdit }: IProps) {
  const { registryId } = useParams<{
    registryId: string;
  }>();

  const credentials = registryData?.registryEncryptedCredentials;
  const registryType = credentials?.registryType;
  const typeChip = registryType ? REGISTRY_TYPE_CHIP[registryType] : undefined;

  const credentialFields = registryType
    ? CREDENTIAL_FIELDS_MAP[registryType] || []
    : [];

  return (
    <Box className="editor-page">
      <Box className="editor-page__header">
        <Breadcrumbs />
        <Box className="editor-page__header-top">
          <Box className="editor-page__header-title" sx={{ minWidth: 0 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              flexWrap="wrap"
              useFlexGap
            >
              <Typography
                variant="h4"
                sx={{
                  lineHeight: 1.2,
                  fontWeight: 600,
                }}
              >
                {registryData?.registryName || '-'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {typeChip ? (
                  <AppChip
                    tone={typeChip.tone}
                    appearance="plain"
                    label={typeChip.label}
                  />
                ) : (
                  <AppChip />
                )}
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: 'error.main',
                  fontSize: 13,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  pt: '2px',
                  wordBreak: 'break-all',
                }}
              >
                Registry ID: {registryId}
              </Typography>
            </Stack>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            className="editor-page__header-actions"
          >
            <Button
              variant="outlined"
              className="editor-page__header-actions-btn-cancel"
              onClick={() => registryId && onEdit(registryId)}
            >
              Edit
            </Button>

            <Button
              variant="outlined"
              color="error"
              className="editor-page__header-actions-btn-submit"
              onClick={() => registryId && onDelete(registryId)}
            >
              Delete
            </Button>
          </Stack>
        </Box>

        <Divider className="editor-page__header-divider" />
      </Box>

      <Box className="editor-page__content" sx={{ p: 2 }}>
        <Box className="editor-page__left">
          <Box
            id="basic-information-section"
            className="editor-page__left-section"
          >
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: '4px',
                borderColor: '#ddd',
              }}
            >
              <Box sx={{ px: 0.5, py: 0.5 }}>
                <InfoRow
                  label="Name"
                  value={registryData?.registryName || '-'}
                />

                <InfoRow
                  label="URL"
                  value={
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: 14,
                        color: '#0052cc',
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                      }}
                    >
                      {registryData?.registryUrl || '-'}
                    </Typography>
                  }
                />

                <InfoRow label="Type" value={registryType || '-'} />

                <InfoRow
                  label="Created"
                  value={
                    registryData?.createdAt
                      ? formatLocalTime(registryData.createdAt)
                      : '-'
                  }
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography sx={{ fontSize: 15, fontWeight: 700, mb: 2 }}>
                Credentials
              </Typography>

              <Box
                sx={{
                  bgcolor: '#f5f5f5',
                  borderRadius: '4px',
                  px: 1.5,
                  py: 1.5,
                }}
              >
                {credentialFields.length > 0 ? (
                  credentialFields.map((field) => (
                    <InfoRow
                      key={field.key}
                      label={field.label}
                      value={
                        <Typography
                          sx={{
                            fontSize: 13,
                            color: '#000',
                            fontFamily: 'monospace',
                            wordBreak: 'break-all',
                          }}
                        >
                          {getDisplayValue(
                            credentials?.[
                              field.key as keyof typeof credentials
                            ],
                            field.mask
                          )}
                        </Typography>
                      }
                    />
                  ))
                ) : (
                  <Typography sx={{ fontSize: 13, color: '#757575' }}>
                    No credentials information
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
