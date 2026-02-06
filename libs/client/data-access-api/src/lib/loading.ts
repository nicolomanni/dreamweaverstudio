type LoadingListener = (count: number) => void;

let activeRequests = 0;
const listeners = new Set<LoadingListener>();

const notify = () => {
  listeners.forEach((listener) => listener(activeRequests));
};

export const beginLoading = () => {
  activeRequests += 1;
  notify();
};

export const endLoading = () => {
  activeRequests = Math.max(0, activeRequests - 1);
  notify();
};

export const subscribeLoading = (listener: LoadingListener) => {
  listeners.add(listener);
  listener(activeRequests);
  return () => {
    listeners.delete(listener);
  };
};

export const getLoadingCount = () => activeRequests;
