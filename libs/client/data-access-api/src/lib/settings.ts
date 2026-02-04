import { getAuth } from 'firebase/auth';
import { firebaseApp } from './firebase';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000' : '');

function buildUrl(path: string) {
  if (!API_BASE_URL) return path;
  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`;
  }
  return `${API_BASE_URL}/${path}`;
}

async function parseJson<T>(response: Response, message: string): Promise<T> {
  if (response.status === 401) {
    throw new Error('unauthorized');
  }
  if (!response.ok) {
    throw new Error(message);
  }
  return response.json();
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  if (!user) {
    return {};
  }
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export type StudioSettingsPayload = {
  displayName: string;
  email: string;
  studioName: string;
  timezone: string;
};

export type UserProfilePayload = {
  displayName: string;
  email: string;
  avatarUrl?: string;
};

export async function fetchStudioSettings(): Promise<StudioSettingsPayload> {
  const headers = await getAuthHeader();
  const response = await fetch(buildUrl('/settings/general'), { headers });
  return parseJson(response, 'Failed to load studio settings');
}

export async function updateStudioSettings(
  payload: Partial<StudioSettingsPayload>,
): Promise<StudioSettingsPayload> {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getAuthHeader()),
  };
  const response = await fetch(buildUrl('/settings/general'), {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  return parseJson(response, 'Failed to update studio settings');
}

export async function fetchUserProfile(): Promise<UserProfilePayload | null> {
  const headers = await getAuthHeader();
  const response = await fetch(buildUrl('/settings/profile'), { headers });
  return parseJson(response, 'Failed to load user profile');
}

export async function updateUserProfile(
  payload: Partial<UserProfilePayload>,
): Promise<UserProfilePayload> {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getAuthHeader()),
  };
  const response = await fetch(buildUrl('/settings/profile'), {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  return parseJson(response, 'Failed to update user profile');
}
