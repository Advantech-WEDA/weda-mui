import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useHasManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import type {
  ICreateStackConfigPayload,
  IUpdateStackConfigPayload,
} from '../api/stacks.api.types';
import {
  DEFAULT_STACK_TYPE,
  type IEnvironmentVariable,
  type IStackErrors,
} from '../domain/types';
import { useDeploymentsStore } from '../store/useDeploymentsStore';

const validateDockerComposeFile = (file: File, content: string) => {
  const fileName = file.name.toLowerCase();

  const isValidExtension =
    fileName.endsWith('.yml') || fileName.endsWith('.yaml');

  if (!isValidExtension) {
    return 'Only .yml or .yaml files are allowed.';
  }

  if (!content.trim()) {
    return 'Docker compose file content is required.';
  }

  if (/\t/.test(content)) {
    return 'Tab indentation is not allowed. Please use spaces instead.';
  }

  const hasServicesKey = /^services\s*:/m.test(content);

  if (!hasServicesKey) {
    return 'Docker compose file must contain services: key.';
  }

  return '';
};

const encodeBase64Utf8 = (content: string): string => {
  const bytes = new TextEncoder().encode(content);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    ''
  );

  return btoa(binary);
};

const base64ToFile = (
  base64: string,
  filename = 'docker-compose.yml',
  mimeType = 'application/x-yaml'
): File => {
  const byteCharacters = atob(base64);

  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);

  return new File([byteArray], filename, {
    type: mimeType,
  });
};

const convertEnvironmentToRows = (
  environment?: Record<string, string | number | boolean | null>
): IEnvironmentVariable[] => {
  if (!environment) return [];

  return Object.entries(environment)
    .filter(([, value]) => typeof value === 'string')
    .map(([key, value]) => ({
      id: crypto.randomUUID(),
      key,
      value: value as string,
    }));
};

export function useStackEditorPage(mode: 'add' | 'edit') {
  const navigate = useAppNavigate();
  const { stackConfigId, stackRevisionId } = useParams();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [stackFile, setStackFile] = useState<File | null>(null);

  const [environmentVariables, setEnvironmentVariables] = useState<
    IEnvironmentVariable[]
  >([]);

  const [stackData, setStackData] = useState<ICreateStackConfigPayload>({
    orgId: currentOrgId ?? '',
    stackName: '',
    type: DEFAULT_STACK_TYPE,
    composeFileContent: '',
    environment: {},
    description: '',
  });

  const [errors, setErrors] = useState<IStackErrors>({
    stackName: false,
    type: false,
    stackFile: { type: false, message: '' },
  });

  const { showError, showSuccess } = useNotification();
  const hasPermission = useHasManagementPermission();

  const GET_STACK_CONFIG_BY_ID = useDeploymentsStore(
    (s) => s.GET_STACK_CONFIG_BY_ID
  );
  const POST_STACK_CONFIG = useDeploymentsStore((s) => s.POST_STACK_CONFIG);
  const PATCH_STACK_CONFIG_BY_ID = useDeploymentsStore(
    (s) => s.PATCH_STACK_CONFIG_BY_ID
  );

  const validate = () => {
    const newErrors: IStackErrors = {
      stackName: !stackData.stackName.trim(),
      type: !stackData.type,
      stackFile: {
        type: !stackData.composeFileContent,
        message: '',
      },
    };

    setErrors(newErrors);

    const isValid =
      !newErrors.stackName &&
      !newErrors.type &&
      !newErrors.stackFile.type &&
      newErrors.stackFile.message.trim() === '';

    return isValid;
  };

  useEffect(() => {
    if (mode !== 'edit') return;

    let ignore = false;

    const fetchStackConfigById = async () => {
      if (!stackConfigId || !stackRevisionId || !currentOrgId) {
        return;
      }

      try {
        const result = await GET_STACK_CONFIG_BY_ID({
          orgId: currentOrgId,
          stackConfigId: stackConfigId,
          stackRevisionId: stackRevisionId,
        });

        if (ignore) return;

        const file = base64ToFile(
          result.composeFileContent,
          `${result.stackName}.yml`
        );

        setStackFile(file);

        setStackData({
          orgId: result?.orgId ?? '',
          stackName: result?.stackName ?? '',
          type: result?.type ?? DEFAULT_STACK_TYPE,
          composeFileContent: result?.composeFileContent ?? '',
          environment: result?.environment ?? {},
          description: result?.description ?? '',
        });

        setEnvironmentVariables(convertEnvironmentToRows(result?.environment));
      } catch (error) {
        if (ignore) return;

        showError(
          error instanceof Error ? error.message : 'Failed to load stack config'
        );
      }
    };

    fetchStackConfigById();

    return () => {
      ignore = true;
    };
  }, [
    mode,
    showError,
    stackConfigId,
    stackRevisionId,
    currentOrgId,
    GET_STACK_CONFIG_BY_ID,
  ]);

  const handleConfirmCancel = () => {
    setCancelOpen(false);
    setSubmitOpen(false);
  };

  const handleSubmitConfirmOpen = () => {
    if (!validate() || !hasPermission) return;

    setSubmitOpen(true);
  };

  const handleCancel = () => {
    handleConfirmCancel();
    navigate('/container-stacks');
  };

  const handleOnChange = (category: string, value?: string) => {
    setStackData((prev) => ({
      ...prev,
      [category]: value ?? '',
    }));
  };

  const handleStackFileChange = async (file: File | null) => {
    setStackFile(file);

    if (!file) {
      setStackData((prev) => ({
        ...prev,
        composeFileContent: '',
      }));

      setErrors((prev) => ({
        ...prev,
        stackFile: {
          type: true,
          message:
            'Docker Compose File is required and must be valid Base64 encoded Docker Compose content.',
        },
      }));

      return;
    }

    try {
      const content = await file.text();

      const errorMessage = validateDockerComposeFile(file, content);

      if (errorMessage) {
        setStackFile(null);

        setStackData((prev) => ({
          ...prev,
          composeFileContent: '',
        }));

        setErrors((prev) => ({
          ...prev,
          stackFile: { type: true, message: errorMessage },
        }));

        if (mode === 'edit') {
          showError(errorMessage);
        }

        return;
      }

      const base64Content = encodeBase64Utf8(content);

      setStackData((prev) => ({
        ...prev,
        composeFileContent: base64Content,
      }));

      setErrors((prev) => ({
        ...prev,
        stackFile: { type: false, message: '' },
      }));
    } catch (error) {
      setStackFile(null);

      setStackData((prev) => ({
        ...prev,
        composeFileContent: '',
      }));

      setErrors((prev) => ({
        ...prev,
        stackFile: {
          type: true,
          message: 'Failed to read Docker compose file.',
        },
      }));

      if (mode === 'edit') {
        showError('Failed to read Docker compose file.');
      }
    }
  };

  const handleSubmit = async () => {
    if (!validate() || !hasPermission) return;
    if (!currentOrgId) {
      showError('Organization is required');
      return;
    }

    if (mode === 'add') {
      try {
        const payload: ICreateStackConfigPayload = {
          ...stackData,
          orgId: currentOrgId,
          environment: Object.fromEntries(
            environmentVariables
              .filter((item) => item.key.trim())
              .map((item) => [item.key.trim(), item.value])
          ),
        };
        await POST_STACK_CONFIG(payload);

        showSuccess('Stack created successfully!');
        handleConfirmCancel();

        navigate('/container-stacks');
      } catch (err: unknown) {
        console.error('[AddStack] Create Stack failed:', err);
        showError(err instanceof Error ? err.message : 'Create Stack failed');
        handleConfirmCancel();
      }

      return;
    }

    try {
      const payload: IUpdateStackConfigPayload = {
        ...stackData,
        orgId: currentOrgId,
        stackConfigId: stackConfigId ?? '',
        composeFileContent: stackData.composeFileContent,
        environment: Object.fromEntries(
          environmentVariables
            .filter((item) => item.key.trim())
            .map((item) => [item.key.trim(), item.value])
        ),
      };
      await PATCH_STACK_CONFIG_BY_ID(payload);

      showSuccess('Stack updated successfully');
      handleConfirmCancel();

      navigate('/container-stacks');
    } catch (err: unknown) {
      console.error('[EditStack] Update Stack failed:', err);
      showError(err instanceof Error ? err.message : 'Update Stack failed');
      handleConfirmCancel();
    }
  };

  return {
    cancelOpen,
    submitOpen,
    stackData,
    stackFile,
    environmentVariables,
    errors,
    setCancelOpen,
    setEnvironmentVariables,
    handleOnChange,
    handleStackFileChange,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
  };
}
