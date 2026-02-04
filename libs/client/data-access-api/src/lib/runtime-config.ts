type RuntimeConfig = {
  apiBaseUrl?: string;
};

export function getApiBaseUrl(): string {
  const globalConfig = (globalThis as unknown as { __DW_API_BASE_URL__?: string })
    .__DW_API_BASE_URL__;
  if (typeof globalConfig === 'string' && globalConfig.length > 0) {
    return globalConfig;
  }
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:3000';
  }
  return '';
}
