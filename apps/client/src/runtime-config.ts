const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000' : '');

(globalThis as unknown as { __DW_API_BASE_URL__?: string }).__DW_API_BASE_URL__ =
  apiBaseUrl;
