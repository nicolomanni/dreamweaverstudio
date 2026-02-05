import { useEffect, useMemo } from 'react';
import { create } from 'zustand';
import type { User } from 'firebase/auth';
import { onAuthChange } from '../auth';

type AuthState = {
  user: User | null;
  loading: boolean;
};

type AuthStore = AuthState & {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
};

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading }),
}));

let hasListener = false;

const initAuthListener = () => {
  if (hasListener) return;
  hasListener = true;
  useAuthStore.getState().setLoading(true);
  onAuthChange((user) => {
    useAuthStore.getState().setUser(user);
  });
};

export const useAuthUser = () => {
  useEffect(() => {
    initAuthListener();
  }, []);
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  return useMemo(() => ({ user, loading }), [user, loading]);
};
