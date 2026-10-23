import { useAppNavigate } from '@shared/lib/useAppNavigate';
import { useHasManagementPermission } from '@shared/session/useHasManagementPermission';
import { useOrgContentStore } from '@shared/session/useOrgContentStore';
import { useNotification } from '@shared/ui';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { IDeviceItem } from '../api/devices.api.types';
import {
  generateDeviceName,
  validateDeviceId,
  validateDeviceName,
  validateHwModel,
} from '../domain/device.rules';
import { useDeviceStore } from '../store/useDeviceStore';

export interface DeviceFormErrors {
  deviceId: boolean;
  deviceIdMessage: string;
  hwModel: boolean;
  hwModelMessage: string;
  deviceName: boolean;
  deviceNameMessage: string;
}

const EMPTY_DEVICE_FORM_ERRORS: DeviceFormErrors = {
  deviceId: false,
  deviceIdMessage: '',
  hwModel: false,
  hwModelMessage: '',
  deviceName: false,
  deviceNameMessage: '',
};

export function useDeviceEditorPage(mode: 'add' | 'edit') {
  const navigate = useAppNavigate();
  const { deviceId: routeDeviceId } = useParams<{
    tenant: string;
    deviceId: string;
  }>();
  const { showError, showSuccess } = useNotification();
  const hasPermission = useHasManagementPermission();
  const currentOrgId = useOrgContentStore((s) => s.currentOrgId);

  const GET_ALL_DEVICES = useDeviceStore((s) => s.GET_ALL_DEVICES);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userEditedDeviceName, setUserEditedDeviceName] = useState(
    mode === 'edit'
  );
  const [errors, setErrors] = useState<DeviceFormErrors>(
    EMPTY_DEVICE_FORM_ERRORS
  );

  const [deviceData, setDeviceData] = useState<IDeviceItem>({
    deviceId: '',
    deviceName: '',
    hwModel: '',
    orgId: '',
    status: '',
    createdAt: '',
  });

  useEffect(() => {
    if (mode !== 'edit' || !currentOrgId || !routeDeviceId) return;

    let ignore = false;

    const fetchDevice = async () => {
      try {
        const data = await GET_ALL_DEVICES({ orgId: currentOrgId });

        if (ignore) return;

        const matchedDevice = data.items.find(
          (item) => item.deviceId === routeDeviceId
        );

        if (matchedDevice) {
          setDeviceData({
            deviceId: matchedDevice.deviceId || '',
            deviceName: matchedDevice.deviceName || '',
            hwModel: matchedDevice.hwModel || '',
            orgId: matchedDevice.orgId || '',
            status: matchedDevice.status || '',
            createdAt: matchedDevice.createdAt || '',
          });
        }
      } catch {
        return;
      }
    };

    fetchDevice();

    return () => {
      ignore = true;
    };
  }, [mode, currentOrgId, routeDeviceId, GET_ALL_DEVICES]);

  const POST_DEVICE = useDeviceStore((s) => s.POST_DEVICE);
  const PATCH_DEVICE_BY_ID = useDeviceStore((s) => s.PATCH_DEVICE_BY_ID);

  const getSubmitDeviceName = () => {
    if (userEditedDeviceName) {
      return deviceData.deviceName.trim();
    }

    return generateDeviceName(deviceData.hwModel ?? '', deviceData.deviceId);
  };

  const validate = (): boolean => {
    if (mode === 'add') {
      const submitDeviceName = getSubmitDeviceName();

      const deviceIdValidation = validateDeviceId(deviceData.deviceId);
      const hwModelValidation = validateHwModel(deviceData.hwModel ?? '');
      const deviceNameValidation = validateDeviceName(submitDeviceName);

      const newErrors: DeviceFormErrors = {
        deviceId: !deviceIdValidation.isValid,
        deviceIdMessage: deviceIdValidation.message,

        hwModel: !hwModelValidation.isValid,
        hwModelMessage: hwModelValidation.message,

        deviceName: !deviceNameValidation.isValid,
        deviceNameMessage: deviceNameValidation.message,
      };

      setErrors(newErrors);

      return !newErrors.deviceId && !newErrors.hwModel && !newErrors.deviceName;
    }

    const deviceNameValidation = validateDeviceName(deviceData.deviceName);

    const newErrors: DeviceFormErrors = {
      ...EMPTY_DEVICE_FORM_ERRORS,
      deviceName: !deviceNameValidation.isValid,
      deviceNameMessage: deviceNameValidation.message,
    };

    setErrors(newErrors);

    return !newErrors.deviceName;
  };

  const handleConfirmCancel = () => {
    setCancelOpen(false);
    setSubmitOpen(false);
  };

  const handleSubmitConfirmOpen = () => {
    setSubmitted(true);
    const isValid = validate();
    if (!isValid) return;

    setSubmitOpen(true);
  };

  const handleCancel = () => {
    handleConfirmCancel();
    navigate('/devices');
  };

  const handleOnChange = (category: string, value?: string) => {
    if (mode === 'edit') {
      if (category !== 'deviceName') return;

      const deviceName = value || '';

      setUserEditedDeviceName(true);

      setDeviceData((prev) => ({
        ...prev,
        deviceName,
      }));

      if (submitted) {
        const validation = validateDeviceName(deviceName);

        setErrors((prev) => ({
          ...prev,
          deviceName: !validation.isValid,
          deviceNameMessage: validation.message,
        }));
      }

      return;
    }

    switch (category) {
      case 'deviceId': {
        const deviceId = value || '';

        setDeviceData((prev) => ({
          ...prev,
          deviceId,
        }));

        if (submitted) {
          const deviceIdValidation = validateDeviceId(deviceId);

          const deviceNameValidation = validateDeviceName(
            userEditedDeviceName
              ? deviceData.deviceName
              : generateDeviceName(deviceData.hwModel ?? '', deviceId)
          );

          setErrors((prev) => ({
            ...prev,

            deviceId: !deviceIdValidation.isValid,
            deviceIdMessage: deviceIdValidation.message,

            deviceName: !deviceNameValidation.isValid,
            deviceNameMessage: deviceNameValidation.message,
          }));
        }

        break;
      }

      case 'hwModel': {
        const hwModel = value || '';

        setDeviceData((prev) => ({
          ...prev,
          hwModel,
        }));

        if (submitted) {
          const hwModelValidation = validateHwModel(hwModel);

          const deviceNameValidation = validateDeviceName(
            userEditedDeviceName
              ? deviceData.deviceName
              : generateDeviceName(hwModel, deviceData.deviceId)
          );

          setErrors((prev) => ({
            ...prev,

            hwModel: !hwModelValidation.isValid,
            hwModelMessage: hwModelValidation.message,

            deviceName: !deviceNameValidation.isValid,
            deviceNameMessage: deviceNameValidation.message,
          }));
        }

        break;
      }

      case 'deviceName': {
        const deviceName = value || '';

        setUserEditedDeviceName(true);

        setDeviceData((prev) => ({
          ...prev,
          deviceName,
        }));

        if (submitted) {
          const validation = validateDeviceName(deviceName);

          setErrors((prev) => ({
            ...prev,
            deviceName: !validation.isValid,
            deviceNameMessage: validation.message,
          }));
        }

        break;
      }

      default:
        break;
    }
  };

  const handleSubmit = async () => {
    if (mode === 'add') {
      if (!currentOrgId || !hasPermission) return;

      const submitDeviceName = getSubmitDeviceName();

      try {
        await POST_DEVICE({
          orgId: currentOrgId,
          deviceData: {
            ...deviceData,
            deviceName: submitDeviceName,
          },
        });

        showSuccess('Device registered successfully!');
        handleConfirmCancel();

        navigate('/devices');
      } catch (err: unknown) {
        let message = 'Create Device failed';

        if (err instanceof Error) {
          message = err.message;
        }

        showError(message);
        console.error('[AddDevice] Create Device failed:', message);
        handleConfirmCancel();
      } finally {
        handleConfirmCancel();
      }

      return;
    }

    if (!currentOrgId || !routeDeviceId) return;

    const isValid = validate();

    if (!isValid) return;

    try {
      await PATCH_DEVICE_BY_ID({
        deviceId: routeDeviceId,
        deviceName: deviceData.deviceName.trim(),
      });

      showSuccess(`Device [${deviceData.deviceName}] updated successfully`);

      handleConfirmCancel();

      navigate('/devices');
    } catch (err: unknown) {
      let message = 'Update device failed';

      if (err instanceof Error) {
        message = err.message;
      }

      showError(message);

      console.error('[EditDevice] Update device failed:', message);

      handleConfirmCancel();
    } finally {
      handleConfirmCancel();
    }
  };

  return {
    cancelOpen,
    submitOpen,
    deviceData,
    submitted,
    errors,
    userEditedDeviceName,
    setCancelOpen,
    handleOnChange,
    handleSubmit,
    handleCancel,
    handleConfirmCancel,
    handleSubmitConfirmOpen,
  };
}
