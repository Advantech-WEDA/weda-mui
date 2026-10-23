import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useNotification } from '@shared/ui';
import { useState } from 'react';

import {
  buildScopesPayload,
  hasSelectedScope,
} from '../domain/client-credential.rules';
import {
  type ClientCredentialForm,
  INITIAL_SCOPES,
  type ScopeItem,
} from '../domain/types';
import { useClientCredentialStore } from '../store/useClientCredentialStore';

const EMPTY_CLIENT_CREDENTIAL_FORM: ClientCredentialForm = {
  name: '',
  scopes: [],
};

export function useAddClientCredentialPage() {
  const [basicInfo, setBasicInfo] = useState<ClientCredentialForm>(
    EMPTY_CLIENT_CREDENTIAL_FORM
  );
  const [scopes, setScopes] = useState<ScopeItem[]>(INITIAL_SCOPES);
  const [scopeError, setScopeError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [clientData, setClientData] = useState<{
    clientId: string;
    clientSecret: string;
  } | null>(null);

  const navigate = useAppNavigate();
  const { showError, showSuccess } = useNotification();

  const POST_CLIENT_CREDENTIALS = useClientCredentialStore(
    (s) => s.POST_CLIENT_CREDENTIALS
  );
  const GET_CLIENT_CREDENTIALS = useClientCredentialStore(
    (s) => s.GET_CLIENT_CREDENTIALS
  );

  const handleBasicChange = <K extends keyof ClientCredentialForm>(
    key: K,
    value: ClientCredentialForm[K]
  ) => {
    setBasicInfo((prev) => ({ ...prev, [key]: value }));

    if (key === 'name' && value.toString().trim()) {
      setNameError(false);
    }
  };

  const handleScopeChange = (
    id: string,
    key: 'read' | 'write',
    checked: boolean
  ) => {
    setScopes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: checked } : item))
    );
  };

  const handleSubmit = async () => {
    const isValidScope = hasSelectedScope(scopes);

    if (!basicInfo.name.trim()) {
      setNameError(true);
      return;
    }

    setNameError(false);

    if (!isValidScope) {
      setScopeError(true);
      return;
    }

    setScopeError(false);

    const formData = {
      name: basicInfo.name,
      scopes: buildScopesPayload(scopes),
    };

    try {
      const res = await POST_CLIENT_CREDENTIALS(formData);

      await GET_CLIENT_CREDENTIALS();

      setClientData({
        clientId: res?.clientId ?? '',
        clientSecret: res?.clientSecret ?? '',
      });

      setOpenDialog(true);
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : 'Failed to create client credential'
      );
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);

    navigate('/client-credentials');
  };

  const handleCancel = () => {
    navigate('/client-credentials');
    setOpenDialog(false);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);

      showSuccess('Copied to clipboard');
    } catch {
      showError('Failed to copy to clipboard');
    }
  };

  return {
    basicInfo,
    scopes,
    scopeError,
    nameError,
    openDialog,
    clientData,
    handleBasicChange,
    handleScopeChange,
    handleSubmit,
    handleCloseDialog,
    handleCancel,
    handleCopy,
  };
}
