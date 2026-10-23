import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import {
  flattenTree,
  resolveNextPath,
} from '@shared/session/switchOrganizationUtils';
import { useIAmStore } from '@shared/session/useIAmStore';
import {
  type IUserOrgItem,
  useOrgContentStore,
} from '@shared/session/useOrgContentStore';
import { SvgIcon } from '@shared/ui';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const ORG_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type OrgLabelProps = {
  node: IUserOrgItem;
  currentOrgName?: string | null;
};

type SwitchOrganizationDialogProps = {
  open: boolean;
  onClose: () => void;
};

function OrgLabel({ node, currentOrgName }: OrgLabelProps) {
  const isCurrentName = currentOrgName ? node.name === currentOrgName : false;

  return (
    <Box className="org-label">
      <Box className="org-label-left">
        <Typography variant="subtitle2" color="textPrimary" noWrap>
          {node.name} {isCurrentName ? <span>(Current)</span> : null}
        </Typography>

        <Typography variant="body2" color="textSecondary" noWrap>
          {node.orgId}
        </Typography>
      </Box>
    </Box>
  );
}

function renderTree(
  nodes: IUserOrgItem[] | null,
  selected: string | null,
  depth: number,
  currentOrgName?: string | null
): React.ReactNode {
  if (!nodes) return null;

  return nodes.map((node) => (
    <TreeItem
      key={node.orgId}
      itemId={node.orgId}
      className={`tree-depth-${depth}`}
      label={<OrgLabel node={node} currentOrgName={currentOrgName} />}
    >
      {node.children &&
        renderTree(node.children, selected, depth + 1, currentOrgName)}
    </TreeItem>
  ));
}

const SwitchOrganizationDialog: React.FC<SwitchOrganizationDialogProps> = ({
  open,
  onClose,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [orgTreeData, setOrgTreeData] = useState<IUserOrgItem[]>([]);

  const { setCurrentOrg, currentOrgName } = useOrgContentStore();
  const GET_ALL_USER_ORGS_BY_USER_ID = useOrgContentStore(
    (s) => s.GET_ALL_USER_ORGS_BY_USER_ID
  );

  const userId = useIAmStore((s) => s.userIAmUserProfile?.sub);

  const { tenant } = useParams();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!open || !userId) return;

    const isOrgId = ORG_ID_PATTERN.test(debouncedSearch);

    GET_ALL_USER_ORGS_BY_USER_ID({
      userId,
      orgId: isOrgId ? debouncedSearch : undefined,
      orgName: isOrgId ? undefined : debouncedSearch || undefined,
    }).then((res) => {
      const items = res?.items ?? [];
      setOrgTreeData(items);
      setExpanded(flattenTree(items).map((n) => n.orgId));
    });
  }, [open, userId, debouncedSearch, GET_ALL_USER_ORGS_BY_USER_ID]);

  const flatTree = useMemo(() => flattenTree(orgTreeData), [orgTreeData]);

  const searchResults = useMemo(() => {
    const keyword = debouncedSearch.toLowerCase();

    if (!keyword) return [];

    return flatTree.filter((n) => {
      const nameMatch = (n.name ?? '').toLowerCase().includes(keyword);
      const orgIdMatch = (n.orgId ?? '').toLowerCase().includes(keyword);
      return nameMatch || orgIdMatch;
    });
  }, [debouncedSearch, flatTree]);

  const isSearching = debouncedSearch.length > 0;
  const hasResults = searchResults.length > 0;

  const handleSelectById = (orgId: string) => {
    setSelected(orgId);
  };

  const handleSelectByNode = (node: IUserOrgItem) => {
    setSelected(node.orgId);
  };

  const handleClose = () => {
    setSelected(null);
    setSearch('');
    setDebouncedSearch('');
    onClose();
  };

  const handleSwitch = () => {
    if (!tenant || !selected) return;

    const targetNode = flatTree.find((item) => item.orgId === selected);
    if (!targetNode) return;

    setCurrentOrg(targetNode.orgId, targetNode.name ?? '');

    const nextPath = resolveNextPath({
      tenant,
      currentPathname: location.pathname,
      targetNode,
    });

    navigate(nextPath);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      slotProps={{
        paper: {
          className: 'switch-org-dialog',
        },
      }}
    >
      <DialogTitle className="switch-org-dialog-title">
        Switch Organization
      </DialogTitle>

      <DialogContent className="switch-org-dialog-content">
        <Box
          className={`switch-org-search-box ${!hasResults ? 'empty-results' : ''}`}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="switch-org-search-field"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SvgIcon
                      name="SearchFilled"
                      sx={{ color: 'var(--action-active)' }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {isSearching ? (
          hasResults ? (
            <Box className="search-results">
              {searchResults.map((node) => (
                <Box
                  key={node.orgId}
                  className={`search-result-item ${
                    selected === node.orgId ? 'selected' : ''
                  }`}
                  onClick={() => handleSelectByNode(node)}
                >
                  <Box className="search-result-left">
                    <Typography
                      variant="subtitle2"
                      color="textPrimary"
                      noWrap
                      className="search-result-title"
                    >
                      {node.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" noWrap>
                      {node.parentName ?? '(Root)'}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box className="search-empty">
              <Typography variant="h5" gutterBottom>
                No results found.
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                className="search-empty-desc"
              >
                Try adjusting your search or filter options to find what you are
                looking for.
              </Typography>

              <Button
                variant="outlined"
                className="search-empty-btn"
                onClick={() => {
                  setSearch('');
                  setDebouncedSearch('');
                }}
              >
                Clear all
              </Button>
            </Box>
          )
        ) : (
          <SimpleTreeView
            className="switch-org-tree"
            selectedItems={selected ?? ''}
            expandedItems={expanded}
            onItemSelectionToggle={(event, itemId) => {
              const el = event.target as Element;

              if (el.closest('.MuiTreeItem-iconContainer')) return;

              handleSelectById(itemId);
            }}
            onItemExpansionToggle={(event, itemId) => {
              const el = event.target as HTMLElement;

              if (!el.closest('.MuiTreeItem-iconContainer')) return;

              setExpanded((prev) =>
                prev.includes(itemId)
                  ? prev.filter((id) => id !== itemId)
                  : [...prev, itemId]
              );
            }}
          >
            {renderTree(orgTreeData, selected, 0, currentOrgName)}
          </SimpleTreeView>
        )}
      </DialogContent>

      <DialogActions className="switch-org-actions">
        <Button
          variant="text"
          color="primary"
          className="switch-org-btn"
          onClick={handleClose}
        >
          Cancel
        </Button>

        <Button
          variant="text"
          color="primary"
          className="switch-org-btn"
          onClick={handleSwitch}
          disabled={!selected}
        >
          Switch
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SwitchOrganizationDialog;
