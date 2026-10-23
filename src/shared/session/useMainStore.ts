import { create } from 'zustand';

interface IMainState {
  isInitialized: boolean;
  SET_IS_INITIALIZED: (isInitialized: boolean) => void;
}

export const useMainStore = create<IMainState>()((set) => ({
  isInitialized: false,
  SET_IS_INITIALIZED: (isInitialized: boolean) => {
    set((state) => ({ ...state, isInitialized }));
  },
}));
