import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { validateModelName } from '../domain/validateRules';
import { useAIModelsStore } from '../store/useAIModelsStore';

export interface IEditModelErrors {
  modelName: boolean;
  modelNameMessage: string;
}

const EMPTY_ERRORS: IEditModelErrors = {
  modelName: false,
  modelNameMessage: '',
};

export function useEditModelPage() {
  const navigate = useAppNavigate();
  const { modelId } = useParams<{ tenant: string; modelId: string }>();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);
  const hasPermission = useManagementPermission().canManageAiModels;
  const { showError, showSuccess } = useNotification();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [modelName, setModelName] = useState('');
  const [originalModelName, setOriginalModelName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<IEditModelErrors>(EMPTY_ERRORS);

  const GET_ALL_AI_MODELS = useAIModelsStore((s) => s.GET_ALL_AI_MODELS);
  const PATCH_AI_MODEL = useAIModelsStore((s) => s.PATCH_AI_MODEL);

  useEffect(() => {
    if (!currentOrgId || !modelId) return;

    let cancelled = false;

    const fetchModel = async () => {
      setLoading(true);

      try {
        const list = await GET_ALL_AI_MODELS({ orgId: currentOrgId });

        const model = (list.items ?? []).find(
          (item) => item.modelId === modelId
        );

        if (!model) {
          if (!cancelled) {
            showError('AI model not found.');
            navigate('/ai-models');
          }
          return;
        }

        if (cancelled) return;

        setModelName(model.modelName ?? '');
        setOriginalModelName(model.modelName ?? '');
        setDescription(model.description ?? '');
      } catch (error: unknown) {
        if (cancelled) return;

        const message =
          error instanceof Error ? error.message : 'Fetch AI model failed';

        showError(message);
        navigate('/ai-models');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchModel();

    return () => {
      cancelled = true;
    };
  }, [GET_ALL_AI_MODELS, currentOrgId, modelId, navigate, showError]);

  const validate = (): boolean => {
    const modelNameMessage = validateModelName(modelName);

    setErrors({
      modelName: Boolean(modelNameMessage),
      modelNameMessage: modelNameMessage ?? '',
    });

    return !modelNameMessage;
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
    if (!validate() || !hasPermission) return;

    setSubmitOpen(true);
  };

  const handleSubmit = async () => {
    if (!currentOrgId || !modelId) return;

    setSubmitting(true);

    try {
      await PATCH_AI_MODEL({
        orgId: currentOrgId,
        modelId,
        modelName: modelName.trim(),
        description: description.trim(),
      });

      showSuccess('AI model updated successfully');
      handleConfirmCancel();

      navigate('/ai-models');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Update AI model failed';

      showError(message);
      console.error('[EditAiModel] Update AI model failed:', err);
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
    modelName,
    originalModelName,
    description,
    errors,
    setCancelOpen,
    setModelName,
    setDescription,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
  };
}
