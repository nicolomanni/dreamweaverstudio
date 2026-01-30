const AUTH_KEY = 'dw.authenticated';

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.localStorage.getItem(AUTH_KEY) === 'true';
}

export function setAuthenticated(value: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(AUTH_KEY, value ? 'true' : 'false');
}
