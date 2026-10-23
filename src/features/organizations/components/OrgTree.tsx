import './OrgTree.scss';

import { SimpleTreeView } from '@mui/x-tree-view';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { useState } from 'react';

import type { OrganizationNode } from '../domain/types';

interface IProps {
  value: string;
  nodes: OrganizationNode[];

  canSelectEmpty: boolean;
  onChange: (orgId: string) => void;
  disabled?: boolean;
}

const EMPTY_VALUE = '__empty__';

function renderTree(
  nodes: OrganizationNode[] | null,
  depth: number
): React.ReactNode {
  if (!nodes) return null;

  return nodes.map((node) => (
    <TreeItem
      key={node.orgId}
      itemId={node.orgId}
      label={node.name}
      className={`tree-depth-${depth}`}
    >
      {renderTree(node.children ?? null, depth + 1)}
    </TreeItem>
  ));
}

export default function OrgTree({
  value,
  nodes,
  canSelectEmpty,
  onChange,
  disabled,
}: IProps) {
  const selected = value || EMPTY_VALUE;

  const [expanded, setExpanded] = useState<string[]>([]);

  return (
    <SimpleTreeView
      disabledItemsFocusable={disabled}
      slotProps={{
        root: {
          className: 'org-tree',
        },
      }}
      sx={{
        '& .MuiTreeItem-content': {
          height: 40,
          padding: '8px 16px',
        },
      }}
      selectedItems={selected}
      expandedItems={expanded}
      onItemSelectionToggle={(event, itemId) => {
        const el = event.target as Element;

        if (el.closest('.MuiTreeItem-iconContainer')) {
          return;
        }

        onChange(itemId === EMPTY_VALUE ? '' : itemId);
      }}
      onItemExpansionToggle={(event, itemId) => {
        const el = event.target as HTMLElement;

        if (!el.closest('.MuiTreeItem-iconContainer')) {
          return;
        }

        setExpanded((prev) =>
          prev.includes(itemId)
            ? prev.filter((id) => id !== itemId)
            : [...prev, itemId]
        );
      }}
    >
      <TreeItem
        itemId={EMPTY_VALUE}
        label="-- Select --"
        disabled={!canSelectEmpty}
        sx={{
          '& > .MuiTreeItem-content .MuiTreeItem-iconContainer': {
            display: 'none',
          },
        }}
      />

      {renderTree(nodes, 0)}
    </SimpleTreeView>
  );
}
