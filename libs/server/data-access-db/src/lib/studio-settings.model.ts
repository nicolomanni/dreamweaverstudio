import mongoose, { Schema } from 'mongoose';
import type { StudioSettings } from '@dreamweaverstudio/shared-types';

const StudioSettingsSchema = new Schema<StudioSettings>(
  {
    _id: { type: String, default: 'global' },
    displayName: { type: String, required: true },
    email: { type: String, required: true },
    studioName: { type: String, required: true },
    timezone: { type: String, required: true },
    creditAlertThreshold: { type: Number },
    numberFormatLocale: { type: String, default: 'en-US' },
  },
  { timestamps: true, collection: 'studio_settings' },
);

const ExistingStudioSettingsModel =
  mongoose.models['StudioSettings'] as mongoose.Model<StudioSettings> | undefined;

export const StudioSettingsModel =
  ExistingStudioSettingsModel ??
  mongoose.model<StudioSettings>('StudioSettings', StudioSettingsSchema);
