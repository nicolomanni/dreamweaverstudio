export type StripeIntegrationSettings = {
  enabled: boolean;
  secretKey?: string;
  publishableKey?: string;
  defaultCurrency?: string;
};

export type GeminiIntegrationSettings = {
  enabled: boolean;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  safetyPreset?: 'strict' | 'balanced' | 'relaxed';
  systemPrompt?: string;
  streaming?: boolean;
  timeoutSec?: number;
  retryCount?: number;
};

export type DeviantArtIntegrationSettings = {
  enabled: boolean;
  clientId?: string;
  clientSecret?: string;
};

export type IntegrationSettings = {
  id?: string;
  _id?: string;
  stripe: StripeIntegrationSettings;
  gemini?: GeminiIntegrationSettings;
  deviantArt?: DeviantArtIntegrationSettings;
  createdAt?: string;
  updatedAt?: string;
};

export type StudioSettings = {
  id?: string;
  _id?: string;
  displayName: string;
  email: string;
  studioName: string;
  timezone: string;
  creditAlertThreshold?: number;
  numberFormatLocale?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UserProfileSettings = {
  id?: string;
  _id?: string;
  uid: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};
