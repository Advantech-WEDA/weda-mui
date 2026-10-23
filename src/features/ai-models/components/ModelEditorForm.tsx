import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import {
  Breadcrumbs,
  ConfirmDialog,
  ScrollSideTabs,
  SimpleConfirmDialog,
} from '@shared/ui';
import { type ReactNode, useMemo, useRef } from 'react';

export interface IEditorSection {
  key: string;
  label: string;
  content: ReactNode;
}

interface IProps {
  title: string;
  cancelOpen: boolean;
  submitOpen: boolean;
  submitting?: boolean;
  submitDisabled?: boolean;
  hasPermission: boolean;
  sections: IEditorSection[];
  submitDialogTitle: string;
  submitDialogContent: string;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: () => void | Promise<void>;
  onConfirmCancel: () => void | Promise<void>;
  onOpenCancelDialog: () => void;
  onOpenSubmitDialog: () => void;
}

export default function ModelEditorForm({
  title,
  cancelOpen,
  submitOpen,
  submitting = false,
  submitDisabled = false,
  hasPermission,
  sections,
  submitDialogTitle,
  submitDialogContent,
  submitLabel,
  onCancel,
  onSubmit,
  onConfirmCancel,
  onOpenCancelDialog,
  onOpenSubmitDialog,
}: IProps) {
  const sectionElements = useRef<Record<string, HTMLDivElement | null>>({});

  const tabItems = useMemo(
    () =>
      sections.map((section) => ({ key: section.key, label: section.label })),
    [sections]
  );

  const scrollSections = useMemo(
    () =>
      sections.map((section) => ({
        key: section.key,
        id: `${section.key}-section`,
        ref: {
          get current() {
            return sectionElements.current[section.key] ?? null;
          },
        } as React.RefObject<HTMLDivElement | null>,
      })),
    [sections]
  );

  return (
    <Box className="editor-page">
      <Box className="editor-page__header">
        <Breadcrumbs />

        <Box className="editor-page__header-top">
          <Box className="editor-page__header-title">
            <Typography
              variant="h4"
              title={title}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </Typography>
            <Typography variant="body2">*Required</Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            className="editor-page__header-actions"
          >
            <Button
              variant="outlined"
              className="editor-page__header-actions-btn-cancel"
              onClick={onOpenCancelDialog}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              className="editor-page__header-actions-btn-submit"
              disabled={!hasPermission || submitting || submitDisabled}
              onClick={onOpenSubmitDialog}
            >
              Submit
            </Button>
          </Stack>
        </Box>

        <Divider className="editor-page__header-divider" />
      </Box>

      <Box className="editor-page__content">
        <Box className="editor-page__left">
          {sections.map((section) => (
            <Box
              key={section.key}
              id={`${section.key}-section`}
              ref={(el: HTMLDivElement | null) => {
                sectionElements.current[section.key] = el;
              }}
              className="editor-page__left-section"
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="h5">{section.label}</Typography>
              </Box>

              {section.content}
            </Box>
          ))}

          <Stack direction="row" spacing={1} className="editor-page__footer">
            <Button
              size="small"
              variant="outlined"
              className="editor-page__footer__btn-cancel"
              onClick={onOpenCancelDialog}
            >
              Cancel
            </Button>

            <Button
              size="small"
              variant="contained"
              className="editor-page__footer__btn-submit"
              disabled={!hasPermission || submitting || submitDisabled}
              onClick={onOpenSubmitDialog}
            >
              Submit
            </Button>
          </Stack>
        </Box>

        <Box className="editor-page__right">
          <ScrollSideTabs sections={scrollSections} tabItems={tabItems} />
        </Box>
      </Box>

      <ConfirmDialog
        open={cancelOpen}
        onClose={onCancel}
        title="Unsaved Changes"
        content="Do you want to leave this page? Any unsaved changes will be lost."
        actions={[
          {
            label: 'Keep editing',
            onClick: onConfirmCancel,
          },
          {
            label: 'Don’t save',
            onClick: onCancel,
          },
        ]}
      />

      <SimpleConfirmDialog
        open={submitOpen}
        title={submitDialogTitle}
        content={submitDialogContent}
        confirmLabel={submitLabel}
        loading={submitting}
        onClose={onConfirmCancel}
        onConfirm={onSubmit}
      />
    </Box>
  );
}
