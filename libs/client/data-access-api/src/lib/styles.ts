import { getAuth } from 'firebase/auth';
import { firebaseApp } from './firebase';
import { getApiBaseUrl } from './runtime-config';
import { request } from './http';
import type { ComicStyle } from '@dreamweaverstudio/shared-types';

const API_BASE_URL = getApiBaseUrl();

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
    let detail: string | undefined;
    try {
      const data = await response.json();
      detail = data?.message || data?.error;
    } catch {
      detail = undefined;
    }
    throw new Error(detail ? `${message}: ${detail}` : message);
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

export type StylesQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: 'active' | 'archived';
};

export type StylesResponse = {
  data: ComicStyle[];
  total: number;
  page: number;
  pageSize: number;
};

export async function fetchStyles(
  query?: StylesQuery,
): Promise<StylesResponse> {
  const headers = await getAuthHeader();
  const params = new URLSearchParams();
  if (query?.page) params.set('page', String(query.page));
  if (query?.pageSize) params.set('pageSize', String(query.pageSize));
  if (query?.q) params.set('q', query.q);
  if (query?.status) params.set('status', query.status);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  const response = await request(buildUrl(`/styles${suffix}`), { headers });
  return parseJson(response, 'Failed to load styles');
}

export async function fetchStyle(id: string): Promise<ComicStyle> {
  const headers = await getAuthHeader();
  const response = await request(buildUrl(`/styles/${id}`), { headers });
  return parseJson(response, 'Failed to load style');
}

export async function createStyle(
  payload: Omit<ComicStyle, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<ComicStyle> {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getAuthHeader()),
  };
  const response = await request(buildUrl('/styles'), {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return parseJson(response, 'Failed to create style');
}

export async function updateStyle(
  id: string,
  payload: Partial<ComicStyle>,
): Promise<ComicStyle> {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getAuthHeader()),
  };
  const response = await request(buildUrl(`/styles/${id}`), {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  return parseJson(response, 'Failed to update style');
}

export async function deleteStyle(id: string): Promise<void> {
  const headers = await getAuthHeader();
  const response = await request(buildUrl(`/styles/${id}`), {
    method: 'DELETE',
    headers,
  });
  await parseJson(response, 'Failed to delete style');
}

export async function extractStyleFromPrompt(
  prompt: string,
): Promise<Partial<ComicStyle>> {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getAuthHeader()),
  };
  const response = await request(buildUrl('/styles/extract'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ source: 'prompt', prompt }),
  });
  const data = await parseJson<{ style: Partial<ComicStyle> }>(
    response,
    'Failed to extract style',
  );
  return data.style;
}

export async function extractStyleFromImage(input: {
  data: string;
  mimeType: string;
}): Promise<Partial<ComicStyle>> {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getAuthHeader()),
  };
  const response = await request(buildUrl('/styles/extract'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ source: 'image', image: input }),
  });
  const data = await parseJson<{ style: Partial<ComicStyle> }>(
    response,
    'Failed to extract style',
  );
  return data.style;
}

export async function generateStylePreview(input: {
  prompt: string;
  negativePrompt?: string;
}): Promise<{ dataUrl: string }> {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getAuthHeader()),
  };
  const response = await request(buildUrl('/styles/preview'), {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });
  return parseJson(response, 'Failed to generate style preview');
}

export async function uploadStylePreviewImage(input: {
  dataUrl: string;
  styleKey: string;
  styleId?: string;
  promptHash?: string;
}): Promise<{ url: string }> {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getAuthHeader()),
  };
  const response = await request(buildUrl('/styles/preview/upload'), {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });
  return parseJson(response, 'Failed to upload preview image');
}
