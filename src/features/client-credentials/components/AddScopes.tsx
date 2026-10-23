import './AddScopes.scss';

import {
  Box,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import type { ScopeItem } from '../domain/types';

export type { ScopeItem };

type IProps = {
  scopes: ScopeItem[];
  onScopeChange: (id: string, key: 'read' | 'write', checked: boolean) => void;
  error?: boolean;
};

export default function AddScopes({ scopes, onScopeChange, error }: IProps) {
  const toggleAll = (key: 'read' | 'write', checked: boolean): void => {
    scopes.forEach((item) => {
      const isAllowed = key === 'read' ? item.canRead : item.canWrite;

      if (isAllowed) {
        onScopeChange(item.id, key, checked);
      }
    });
  };

  const getSelectableItems = (key: 'read' | 'write'): ScopeItem[] => {
    return scopes.filter((item) =>
      key === 'read' ? item.canRead : item.canWrite
    );
  };

  const getCheckedAll = (key: 'read' | 'write'): boolean => {
    const selectableItems = getSelectableItems(key);
    if (selectableItems.length === 0) return false;

    return selectableItems.every((item) =>
      key === 'read' ? item.read : item.write
    );
  };

  const getIndeterminate = (key: 'read' | 'write'): boolean => {
    const selectableItems = getSelectableItems(key);
    if (selectableItems.length === 0) return false;

    const checkedCount = selectableItems.filter((item) =>
      key === 'read' ? item.read : item.write
    ).length;

    return checkedCount > 0 && checkedCount < selectableItems.length;
  };

  return (
    <Box className="scopes">
      <Box className="scopes-header">
        <Typography variant="h5" className="scopes-title">
          Scopes
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          className="scopes-desc"
        >
          Authorize the scope of access associated with this credential.
        </Typography>
      </Box>

      <Paper
        className={`scopes-table-wrap ${error ? 'scopes-error' : ''}`}
        elevation={0}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell className="scopes-table-cell">Scope name</TableCell>

              <TableCell width={200} className="scopes-table-cell">
                <Checkbox
                  size="small"
                  checked={getCheckedAll('read')}
                  indeterminate={getIndeterminate('read')}
                  onChange={(e) => toggleAll('read', e.target.checked)}
                  sx={{
                    p: 0,
                    m: 0,
                    mr: 1.5,
                  }}
                />
                Read
              </TableCell>

              <TableCell width={200} className="scopes-table-cell">
                <Checkbox
                  size="small"
                  checked={getCheckedAll('write')}
                  indeterminate={getIndeterminate('write')}
                  onChange={(e) => toggleAll('write', e.target.checked)}
                  sx={{
                    p: 0,
                    m: 0,
                    mr: 1.5,
                  }}
                />
                Write
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {scopes.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="scopes-table-cell">
                  <Typography variant="subtitle2" className="scopes-name">
                    {item.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    className="scopes-desc-text"
                  >
                    {item.description}
                  </Typography>
                </TableCell>

                <TableCell className="scopes-table-cell">
                  <Checkbox
                    size="small"
                    checked={item.read}
                    disabled={!item.canRead}
                    onChange={(e) =>
                      onScopeChange(item.id, 'read', e.target.checked)
                    }
                    sx={{ p: 0, m: 0 }}
                  />
                </TableCell>

                <TableCell className="scopes-table-cell">
                  <Checkbox
                    size="small"
                    checked={item.write}
                    disabled={!item.canWrite}
                    onChange={(e) =>
                      onScopeChange(item.id, 'write', e.target.checked)
                    }
                    sx={{ p: 0, m: 0 }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {error && (
        <Typography className="scopes-error-text">
          Select at least one scope.
        </Typography>
      )}
    </Box>
  );
}
