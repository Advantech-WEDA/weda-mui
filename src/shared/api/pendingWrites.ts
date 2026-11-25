import type { InternalAxiosRequestConfig } from 'axios';
import { create } from 'zustand';

const WRITE_METHODS = new Set(['post', 'put', 'patch', 'delete']);

interface PendingWritesState {
  count: number;
}

export const usePendingWritesStore = create<PendingWritesState>(() => ({
  count: 0,
}));

const isTrackedWrite = (config: InternalAxiosRequestConfig) =>
  WRITE_METHODS.has((config.method ?? 'get').toLowerCase()) &&
  !config.skipGlobalLoading;

export function beginWrite(config: InternalAxiosRequestConfig): void {
  if (config._loadingCounted || !isTrackedWrite(config)) return;

  config._loadingCounted = true;
  usePendingWritesStore.setState((state) => ({ count: state.count + 1 }));
}

export function endWrite(config: InternalAxiosRequestConfig | undefined): void {
  if (!config?._loadingCounted) return;

  config._loadingCounted = false;
  usePendingWritesStore.setState((state) => ({
    count: Math.max(0, state.count - 1),
  }));
}
