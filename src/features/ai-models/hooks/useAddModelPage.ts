import { fetchAllPages } from '@shared/api/fetchAllPages';
import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import { isAxiosError, isCancel } from 'axios';
import { useEffect, useState } from 'react';

import { aiModelsApi } from '@/features/ai-models/api/aiModels.api';
import type { IAiModelItem } from '@/features/ai-models/api/aiModels.api.types';
import {
  validateEditionName,
  validateFileSize,
  validateModelName,
} from '@/features/ai-models/domain/validateRules';
import { useFileHash } from '@/features/ai-models/hooks/useFileHash';
import { useAIModelsStore } from '@/features/ai-models/store/useAIModelsStore';
import { usePendingUploadsStore } from '@/features/ai-models/store/usePendingUploadsStore';

export interface IAddModelErrors {
  modelName: boolean;
  modelNameMessage: string;
  edition: boolean;
  editionMessage: string;
  file: boolean;
  fileMessage: string;
}

const EMPTY_ERRORS: IAddModelErrors = {
  modelName: false,
  modelNameMessage: '',
  edition: false,
  editionMessage: '',
  file: false,
  fileMessage: '',
};

export function useAddModelPage() {
  const navigate = useAppNavigate();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const hasPermission = useManagementPermission().canManageAiModels;
  const { showError, showSuccess } = useNotification();

  const aiModelItems = useAIModelsStore((s) => s.aiModelItems);
  const GET_ALL_AI_MODELS = useAIModelsStore((s) => s.GET_ALL_AI_MODELS);
  const POST_AI_MODEL_EDITION = useAIModelsStore(
    (s) => s.POST_AI_MODEL_EDITION
  );

  const ADD_PENDING_UPLOAD = usePendingUploadsStore(
    (s) => s.ADD_PENDING_UPLOAD
  );

  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedModel, setSelectedModel] = useState<IAiModelItem | null>(null);
  const [modelNameInput, setModelNameInput] = useState('');
  const [modelDescription, setModelDescription] = useState('');
  const [edition, setEdition] = useState('');
  const [editionDescription, setEditionDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const { fileHash, startHash, cancelHash, retryHash, getFileHash } =
    useFileHash();

  const [errors, setErrors] = useState<IAddModelErrors>(EMPTY_ERRORS);

  useEffect(() => {
    if (!currentOrgId) return;

    const controller = new AbortController();

    GET_ALL_AI_MODELS({ orgId: currentOrgId }, controller.signal).catch(
      (error: unknown) => {
        if (isCancel(error)) return;

        console.error('[AddAiModel] Fetch AI models failed:', error);
      }
    );

    return () => controller.abort();
  }, [currentOrgId, GET_ALL_AI_MODELS]);

  const validate = (): boolean => {
    const modelNameMessage = validateModelName(modelNameInput);
    const editionMessage = validateEditionName(edition);

    const newErrors: IAddModelErrors = {
      modelName: Boolean(modelNameMessage),
      modelNameMessage: modelNameMessage ?? '',

      edition: Boolean(editionMessage),
      editionMessage: editionMessage ?? '',

      file: !file || fileHash.status !== 'done',
      fileMessage: !file
        ? 'File is required'
        : fileHash.status !== 'done'
          ? 'Prepare the selected file before submitting.'
          : '',
    };

    setErrors(newErrors);

    return !newErrors.modelName && !newErrors.edition && !newErrors.file;
  };

  const handleConfirmCancel = () => {
    setCancelOpen(false);
    setSubmitOpen(false);
  };

  const handleCancel = () => {
    handleConfirmCancel();
    navigate('/ai-models');
  };

  const handleSubmitConfirmOpen = () => {
    if (!validate() || !hasPermission || submitting) return;

    setSubmitOpen(true);
  };

  const handleSelectExisting = (model: IAiModelItem | null) => {
    setSelectedModel(model);

    if (model) {
      setModelDescription(model.description ?? '');
    }
  };

  const handleModelNameInputChange = (value: string) => {
    setModelNameInput(value);
  };

  const handleFileChange = (nextFile: File | null) => {
    if (submitting) return;

    if (!nextFile) {
      startHash(null);
      setFile(null);
      setErrors((prev) => ({ ...prev, file: false, fileMessage: '' }));
      return;
    }

    const sizeMessage = validateFileSize(nextFile);

    if (sizeMessage) {
      startHash(null);
      setFile(null);
      setErrors((prev) => ({ ...prev, file: true, fileMessage: sizeMessage }));
      return;
    }

    setErrors((prev) => ({ ...prev, file: false, fileMessage: '' }));
    setFile(nextFile);
    startHash(nextFile);
  };

  const resolveModelId = async (orgId: string): Promise<string> => {
    if (selectedModel) return selectedModel.modelId;

    const modelName = modelNameInput.trim();

    try {
      const created = await aiModelsApi.postAiModel({
        orgId,
        modelName,
        description: modelDescription.trim() || null,
      });

      return created.modelId;
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 409) {
        const list = await fetchAllPages((page) =>
          aiModelsApi.getAiModels({ orgId, ...page })
        );

        const existing = (list.items ?? []).find(
          (item) => item.modelName === modelName
        );

        if (existing) return existing.modelId;
      }

      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!currentOrgId || !file || !hasPermission || submitting || !validate())
      return;

    setSubmitting(true);

    try {
      const fileHashHex = getFileHash(file);
      const modelId = await resolveModelId(currentOrgId);
      const editionName = edition.trim();

      const editionDetail = await POST_AI_MODEL_EDITION({
        orgId: currentOrgId,
        modelId,
        edition: editionName,
        fileName: file.name,
        fileSize: file.size,
        fileHash: fileHashHex,
        description: editionDescription.trim() || null,
      });

      if (editionDetail.uploadId) {
        ADD_PENDING_UPLOAD({
          orgId: currentOrgId,
          modelId,
          edition: editionName,
          file,
        });
      }

      showSuccess('AI model created successfully!');
      handleConfirmCancel();

      navigate('/ai-models');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Create AI model failed';

      showError(message);
      console.error('[AddAiModel] Create AI model failed:', err);
      handleConfirmCancel();
    } finally {
      setSubmitting(false);
      handleConfirmCancel();
    }
  };

  return {
    cancelOpen,
    submitOpen,
    submitting,
    hasPermission,
    aiModelItems,
    selectedModel,
    modelNameInput,
    modelDescription,
    edition,
    editionDescription,
    file,
    fileHash,
    cancelHash,
    retryHash,
    errors,
    setCancelOpen,
    setModelDescription,
    setEdition,
    setEditionDescription,
    handleFileChange,
    handleSelectExisting,
    handleModelNameInputChange,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
  };
}
