import { useCallback, useEffect, useRef, useState } from 'react';
import type { ToastVariant } from './Toast';

export type ToastItem = {
  id: number;
  type: ToastVariant;
  message: string;
};

export type UseToastsOptions = {
  durationMs?: number;
};

export const useToasts = (options: UseToastsOptions = {}) => {
  const { durationMs = 3200 } = options;
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Map<number, number>>(new Map());

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      if (typeof window !== 'undefined') {
        window.clearTimeout(timeout);
      }
      timeoutsRef.current.delete(id);
    }
  }, []);

  const pushToast = useCallback(
    (type: ToastVariant, message: string) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((prev) => [...prev, { id, type, message }]);
      if (typeof window !== 'undefined') {
        const timeout = window.setTimeout(() => removeToast(id), durationMs);
        timeoutsRef.current.set(id, timeout);
      }
      return id;
    },
    [durationMs, removeToast],
  );

  useEffect(() => () => {
    if (typeof window !== 'undefined') {
      timeoutsRef.current.forEach((timeout) => window.clearTimeout(timeout));
    }
    timeoutsRef.current.clear();
  }, []);

  return { toasts, pushToast, removeToast };
};

export default useToasts;
