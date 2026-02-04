import { getAuth } from 'firebase/auth';
import { firebaseApp } from './firebase';
import { getApiBaseUrl } from './runtime-config';

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

export type IntegrationSettingsResponse = {
  stripe: { enabled: boolean; hasSecret: boolean; last4?: string };
  gemini: { enabled: boolean; hasSecret: boolean };
  deviantArt: { enabled: boolean; hasSecret: boolean };
};

export type StripeBalanceResponse = {
  enabled: boolean;
  currency?: string;
  available?: number;
  pending?: number;
  error?: string;
};

export async function fetchIntegrationSettings(): Promise<IntegrationSettingsResponse> {
  const headers = await getAuthHeader();
  const response = await fetch(buildUrl('/integrations'), { headers });
  return parseJson(response, 'Failed to load integration settings');
}

export async function updateStripeSettings(payload: {
  enabled?: boolean;
  secretKey?: string;
  publishableKey?: string;
}): Promise<IntegrationSettingsResponse['stripe']> {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getAuthHeader()),
  };
  const response = await fetch(buildUrl('/integrations/stripe'), {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ stripe: IntegrationSettingsResponse['stripe'] }>(
    response,
    'Failed to update Stripe settings',
  );
  return data.stripe;
}

export async function updateGeminiSettings(payload: {
  enabled?: boolean;
  apiKey?: string;
}): Promise<IntegrationSettingsResponse['gemini']> {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getAuthHeader()),
  };
  const response = await fetch(buildUrl('/integrations/gemini'), {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ gemini: IntegrationSettingsResponse['gemini'] }>(
    response,
    'Failed to update Gemini settings',
  );
  return data.gemini;
}

export async function updateDeviantArtSettings(payload: {
  enabled?: boolean;
  clientId?: string;
  clientSecret?: string;
}): Promise<IntegrationSettingsResponse['deviantArt']> {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getAuthHeader()),
  };
  const response = await fetch(buildUrl('/integrations/deviantart'), {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{
    deviantArt: IntegrationSettingsResponse['deviantArt'];
  }>(response, 'Failed to update DeviantArt settings');
  return data.deviantArt;
}

export async function fetchStripeBalance(): Promise<StripeBalanceResponse> {
  const headers = await getAuthHeader();
  const response = await fetch(buildUrl('/integrations/stripe/balance'), { headers });
  return parseJson(response, 'Failed to load Stripe balance');
}
