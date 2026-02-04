import mongoose, { Schema } from 'mongoose';
import type { IntegrationSettings } from '@dreamweaverstudio/shared-types';

const StripeIntegrationSchema = new Schema<IntegrationSettings['stripe']>(
  {
    enabled: { type: Boolean, default: false },
    secretKey: { type: String },
    publishableKey: { type: String },
  },
  { _id: false },
);

const GeminiIntegrationSchema = new Schema<IntegrationSettings['gemini']>(
  {
    enabled: { type: Boolean, default: false },
    apiKey: { type: String },
  },
  { _id: false },
);

const DeviantArtIntegrationSchema = new Schema<
  IntegrationSettings['deviantArt']
>(
  {
    enabled: { type: Boolean, default: false },
    clientId: { type: String },
    clientSecret: { type: String },
  },
  { _id: false },
);

const IntegrationSettingsSchema = new Schema<IntegrationSettings>(
  {
    _id: { type: String, default: 'global' },
    stripe: { type: StripeIntegrationSchema, default: () => ({}) },
    gemini: { type: GeminiIntegrationSchema, default: () => ({}) },
    deviantArt: { type: DeviantArtIntegrationSchema, default: () => ({}) },
  },
  { timestamps: true, collection: 'integration_settings' },
);

const ExistingIntegrationSettingsModel =
  mongoose.models['IntegrationSettings'] as
    | mongoose.Model<IntegrationSettings>
    | undefined;

export const IntegrationSettingsModel =
  ExistingIntegrationSettingsModel ??
  mongoose.model<IntegrationSettings>(
    'IntegrationSettings',
    IntegrationSettingsSchema,
  );
