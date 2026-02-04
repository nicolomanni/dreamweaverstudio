export type StripeIntegrationSettings = {
  enabled: boolean;
  secretKey?: string;
  publishableKey?: string;
};

export type GeminiIntegrationSettings = {
  enabled: boolean;
  apiKey?: string;
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
