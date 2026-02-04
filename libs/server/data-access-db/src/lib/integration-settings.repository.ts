import type {
  IntegrationSettings,
  StripeIntegrationSettings,
  GeminiIntegrationSettings,
  DeviantArtIntegrationSettings,
} from '@dreamweaverstudio/shared-types';
import { IntegrationSettingsModel } from './integration-settings.model';

const SETTINGS_ID = 'global';

export async function getIntegrationSettings(): Promise<IntegrationSettings | null> {
  const doc = await IntegrationSettingsModel.findById(SETTINGS_ID).lean();
  return doc ? { ...doc, id: doc._id } : null;
}

type StripeUpdate = Partial<StripeIntegrationSettings>;
type GeminiUpdate = Partial<GeminiIntegrationSettings>;
type DeviantArtUpdate = Partial<DeviantArtIntegrationSettings>;

export async function updateStripeIntegration(
  update: StripeUpdate,
): Promise<IntegrationSettings> {
  const current =
    (await IntegrationSettingsModel.findById(SETTINGS_ID)) ??
    (await IntegrationSettingsModel.create({ _id: SETTINGS_ID }));

  if (!current.stripe) {
    current.stripe = { enabled: false };
  }

  if (typeof update.enabled === 'boolean') {
    current.stripe.enabled = update.enabled;
  }

  if (update.secretKey !== undefined) {
    current.stripe.secretKey = update.secretKey || undefined;
  }

  if (update.publishableKey !== undefined) {
    current.stripe.publishableKey = update.publishableKey || undefined;
  }

  const saved = await current.save();
  return { ...(saved.toObject() as IntegrationSettings), id: saved._id };
}

export async function updateGeminiIntegration(
  update: GeminiUpdate,
): Promise<IntegrationSettings> {
  const current =
    (await IntegrationSettingsModel.findById(SETTINGS_ID)) ??
    (await IntegrationSettingsModel.create({ _id: SETTINGS_ID }));

  if (!current.gemini) {
    current.gemini = { enabled: false };
  }

  if (typeof update.enabled === 'boolean') {
    current.gemini.enabled = update.enabled;
  }

  if (update.apiKey !== undefined) {
    current.gemini.apiKey = update.apiKey || undefined;
  }

  const saved = await current.save();
  return { ...(saved.toObject() as IntegrationSettings), id: saved._id };
}

export async function updateDeviantArtIntegration(
  update: DeviantArtUpdate,
): Promise<IntegrationSettings> {
  const current =
    (await IntegrationSettingsModel.findById(SETTINGS_ID)) ??
    (await IntegrationSettingsModel.create({ _id: SETTINGS_ID }));

  if (!current.deviantArt) {
    current.deviantArt = { enabled: false };
  }

  if (typeof update.enabled === 'boolean') {
    current.deviantArt.enabled = update.enabled;
  }

  if (update.clientId !== undefined) {
    current.deviantArt.clientId = update.clientId || undefined;
  }

  if (update.clientSecret !== undefined) {
    current.deviantArt.clientSecret = update.clientSecret || undefined;
  }

  const saved = await current.save();
  return { ...(saved.toObject() as IntegrationSettings), id: saved._id };
}
