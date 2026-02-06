import { getAuth } from 'firebase/auth';
import { firebaseApp } from './firebase';
import { getApiBaseUrl } from './runtime-config';
import { request } from './http';
import type { PageTemplate } from '@dreamweaverstudio/shared-types';

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

export type PageTemplatesQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: 'active' | 'archived';
};

export type PageTemplatesResponse = {
  data: PageTemplate[];
  total: number;
  page: number;
  pageSize: number;
};

export async function fetchPageTemplates(
  query?: PageTemplatesQuery,
): Promise<PageTemplatesResponse> {
  const headers = await getAuthHeader();
  const params = new URLSearchParams();
  if (query?.page) params.set('page', String(query.page));
  if (query?.pageSize) params.set('pageSize', String(query.pageSize));
  if (query?.q) params.set('q', query.q);
  if (query?.status) params.set('status', query.status);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  const response = await request(buildUrl(`/page-templates${suffix}`), { headers });
  return parseJson(response, 'Failed to load page templates');
}

export async function fetchPageTemplate(id: string): Promise<PageTemplate> {
  const headers = await getAuthHeader();
  const response = await request(buildUrl(`/page-templates/${id}`), { headers });
  return parseJson(response, 'Failed to load page template');
}

export async function createPageTemplate(
  payload: Omit<PageTemplate, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<PageTemplate> {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getAuthHeader()),
  };
  const response = await request(buildUrl('/page-templates'), {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return parseJson(response, 'Failed to create page template');
}

export async function updatePageTemplate(
  id: string,
  payload: Partial<PageTemplate>,
): Promise<PageTemplate> {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getAuthHeader()),
  };
  const response = await request(buildUrl(`/page-templates/${id}`), {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  return parseJson(response, 'Failed to update page template');
}

export async function deletePageTemplate(id: string): Promise<void> {
  const headers = await getAuthHeader();
  const response = await request(buildUrl(`/page-templates/${id}`), {
    method: 'DELETE',
    headers,
  });
  await parseJson(response, 'Failed to delete page template');
}
