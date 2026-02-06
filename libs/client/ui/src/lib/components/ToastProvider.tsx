import { createContext, useContext, type ReactNode } from 'react';
import { Toast, ToastDot, ToastViewport, type ToastVariant } from './Toast';
import { useToasts, type ToastItem, type UseToastsOptions } from './useToasts';

export type ToastContextValue = {
  toasts: ToastItem[];
  pushToast: (type: ToastVariant, message: string) => number;
  removeToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export type ToastProviderProps = UseToastsOptions & {
  children: ReactNode;
  viewportClassName?: string;
};

export const ToastProvider = ({
  children,
  durationMs,
  viewportClassName,
}: ToastProviderProps) => {
  const { toasts, pushToast, removeToast } = useToasts({ durationMs });

  return (
    <ToastContext.Provider value={{ toasts, pushToast, removeToast }}>
      {children}
      <ToastViewport className={viewportClassName}>
        {toasts.map((toast) => (
          <Toast key={toast.id} variant={toast.type}>
            <ToastDot variant={toast.type} />
            {toast.message}
          </Toast>
        ))}
      </ToastViewport>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export default ToastProvider;
