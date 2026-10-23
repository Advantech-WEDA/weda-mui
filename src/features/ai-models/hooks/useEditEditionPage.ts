import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { IAiModelEditionDetail } from '@/features/ai-models/api/aiModels.api.types';
import { uploadEditionFile } from '@/features/ai-models/api/uploadEdition';
import { validateFileSize } from '@/features/ai-models/domain/validateRules';
import { useFileHash } from '@/features/ai-models/hooks/useFileHash';
import { useAIModelsStore } from '@/features/ai-models/store/useAIModelsStore';

export function useEditEditionPage() {
  const navigate = useAppNavigate();
  const { modelId, edition } = useParams<{
    tenant: string;
    modelId: string;
    edition: string;
  }>();
  const decodedEdition = edition ? decodeURIComponent(edition) : undefined;

  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const hasPermission = useManagementPermission().canManageAiModels;
  const { showError, showSuccess } = useNotification();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [detail, setDetail] = useState<IAiModelEditionDetail | null>(null);
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState(false);
  const [descriptionErrorMessage, setDescriptionErrorMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState(false);
  const [fileErrorMessage, setFileErrorMessage] = useState('');
  const { fileHash, startHash, cancelHash, retryHash, getFileHash } =
    useFileHash();

  const loading = useAIModelsStore((s) => s.loading);
  const GET_AI_MODEL_EDITION = useAIModelsStore((s) => s.GET_AI_MODEL_EDITION);
  const PATCH_AI_MODEL_EDITION = useAIModelsStore(
    (s) => s.PATCH_AI_MODEL_EDITION
  );

  useEffect(() => {
    if (!currentOrgId || !modelId || !decodedEdition) return;

    let cancelled = false;

    const fetchDetail = async () => {
      try {
        const data = await GET_AI_MODEL_EDITION({
          orgId: currentOrgId,
          modelId,
          edition: decodedEdition,
        });

        if (cancelled) return;

        setDetail(data);
        setDescription(data.description ?? '');
      } catch (error: unknown) {
        if (cancelled) return;

        const message =
          error instanceof Error ? error.message : 'Fetch edition failed';

        showError(message);
        navigate('/ai-models');
      }
    };

    fetchDetail();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrgId, modelId, decodedEdition]);

  const handleConfirmCancel = () => {
    setCancelOpen(false);
    setSubmitOpen(false);
  };

  const handleFileChange = (nextFile: File | null) => {
    if (submitting) return;

    if (!nextFile) {
      startHash(null);
      setFile(null);
      setFileError(false);
      setFileErrorMessage('');
      return;
    }

    const sizeMessage = validateFileSize(nextFile);

    if (sizeMessage) {
      startHash(null);
      setFile(null);
      setFileError(true);
      setFileErrorMessage(sizeMessage);
      return;
    }

    setFileError(false);
    setFileErrorMessage('');
    setFile(nextFile);
    startHash(nextFile);
  };

  const handleCancel = () => {
    handleConfirmCancel();
    navigate('/ai-models');
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);

    if (value.trim()) {
      setDescriptionError(false);
      setDescriptionErrorMessage('');
    }
  };

  const handleSubmitConfirmOpen = () => {
    const descriptionValid =
      description.trim().length > 0 && description.trim().length <= 200;
    const fileValid = file
      ? fileHash.status === 'done'
      : Boolean(detail?.file?.fileId);

    if (!descriptionValid) {
      setDescriptionError(true);
      setDescriptionErrorMessage('Description is required');
    }

    if (!fileValid) {
      setFileError(true);
      setFileErrorMessage(
        file
          ? 'Prepare the selected file before submitting.'
          : 'File is required'
      );
    }

    if (!descriptionValid || !fileValid || !hasPermission || submitting) return;

    setSubmitOpen(true);
  };

  const handleSubmit = async () => {
    if (
      !currentOrgId ||
      !modelId ||
      !detail?.edition ||
      !hasPermission ||
      submitting
    )
      return;

    setSubmitting(true);

    try {
      if (file) getFileHash(file);

      await PATCH_AI_MODEL_EDITION({
        orgId: currentOrgId,
        modelId,
        edition: detail.edition,
        description: description.trim(),
      });

      if (file && detail.uploadId) {
        await uploadEditionFile({
          orgId: currentOrgId,
          modelId,
          edition: detail.edition,
          uploadId: detail.uploadId,
          file,
        });
      }

      showSuccess('Edition updated successfully');
      handleConfirmCancel();

      navigate('/ai-models');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Update edition failed';

      showError(message);
      console.error('[EditEdition] Update edition failed:', err);
      handleConfirmCancel();
    } finally {
      setSubmitting(false);
    }
  };

  return {
    cancelOpen,
    submitOpen,
    submitting,
    loading,
    hasPermission,
    detail,
    description,
    descriptionError,
    descriptionErrorMessage,
    file,
    fileError,
    fileErrorMessage,
    fileHash,
    cancelHash,
    retryHash,
    setCancelOpen,
    setDescription: handleDescriptionChange,
    handleFileChange,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
  };
}
