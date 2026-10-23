import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useHasManagementPermission } from '@shared/session/useHasManagementPermission';
import { SvgIcon } from '@shared/ui';

import type { IEnvironmentVariable } from '../domain/types';

interface IProps {
  environmentVariables: IEnvironmentVariable[];
  onEnvironmentVariablesChange: (items: IEnvironmentVariable[]) => void;
}

export default function EnvironmentVariables({
  environmentVariables,
  onEnvironmentVariablesChange,
}: IProps) {
  const hasPermission = useHasManagementPermission();

  const handleAddEnv = () => {
    onEnvironmentVariablesChange([
      ...environmentVariables,
      {
        id: crypto.randomUUID(),
        key: '',
        value: '',
      },
    ]);
  };

  const handleDeleteEnv = (id: string) => {
    onEnvironmentVariablesChange(
      environmentVariables.filter((item) => item.id !== id)
    );
  };

  const handleEnvChange = (
    id: string,
    field: 'key' | 'value',
    value: string
  ) => {
    onEnvironmentVariablesChange(
      environmentVariables.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <Box className="editor-page__form-wrapper">
      <Stack spacing={2} p={2}>
        <Button
          variant="contained"
          size="small"
          sx={{ width: 120, textTransform: 'none' }}
          className="page-btn page-add-btn"
          disabled={!hasPermission}
          startIcon={
            <SvgIcon name="Add" sx={{ color: 'var(--primary-contrastText)' }} />
          }
          onClick={handleAddEnv}
        >
          Add
        </Button>
      </Stack>
      <Stack spacing={2} p={2}>
        <Paper variant="outlined" className="env-table">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ height: '56px' }}>
                <TableCell width={200}>Index</TableCell>
                <TableCell width={400}>Key</TableCell>
                <TableCell width={400}>Value</TableCell>
                <TableCell width={200}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {environmentVariables.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    sx={{
                      height: 400,
                      p: 0,
                      borderBottom: 'none',
                    }}
                  >
                    <Box
                      className="env-empty"
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        gap: 1,
                      }}
                    >
                      <Typography variant="h6">
                        No environment variables, yet.
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Click the "+" button to add environment variables here!
                      </Typography>

                      <Button
                        variant="contained"
                        size="small"
                        startIcon={
                          <SvgIcon
                            name="Add"
                            sx={{ color: 'var(--primary-contrastText)' }}
                          />
                        }
                        onClick={handleAddEnv}
                        sx={{ width: 120, textTransform: 'none', mt: 1 }}
                      >
                        Add
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                environmentVariables.map((item, index) => (
                  <TableRow key={item.id} sx={{ height: '56px' }}>
                    <TableCell sx={{ px: 2, py: 1, width: 200 }}>
                      {index + 1}
                    </TableCell>

                    <TableCell sx={{ px: 2, py: 1, width: 400 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Key"
                        value={item.key}
                        onChange={(e) =>
                          handleEnvChange(item.id, 'key', e.target.value)
                        }
                      />
                    </TableCell>

                    <TableCell sx={{ px: 2, py: 1, width: 400 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Value"
                        value={item.value}
                        onChange={(e) =>
                          handleEnvChange(item.id, 'value', e.target.value)
                        }
                      />
                    </TableCell>

                    <TableCell sx={{ px: 2, py: 1, width: 200 }}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteEnv(item.id)}
                      >
                        <SvgIcon
                          name="DeleteOutlined"
                          sx={{ color: 'var(--action-active)' }}
                        />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      </Stack>
    </Box>
  );
}
