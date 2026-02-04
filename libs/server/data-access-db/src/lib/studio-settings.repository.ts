import type { StudioSettings } from '@dreamweaverstudio/shared-types';
import { StudioSettingsModel } from './studio-settings.model';

const SETTINGS_ID = 'global';

const DEFAULT_SETTINGS: StudioSettings = {
  _id: SETTINGS_ID,
  displayName: 'hello@dreamweavercomics.art',
  email: 'hello@dreamweavercomics.art',
  studioName: 'DreamWeaverComics',
  timezone: 'Europe/Rome',
  creditAlertThreshold: 200,
  numberFormatLocale: 'en-US',
};

export async function getStudioSettings(): Promise<StudioSettings> {
  const doc = await StudioSettingsModel.findById(SETTINGS_ID).lean();
  if (!doc) {
    const created = await StudioSettingsModel.create(DEFAULT_SETTINGS);
    return created.toObject() as StudioSettings;
  }
  return doc as StudioSettings;
}

export async function updateStudioSettings(
  update: Partial<StudioSettings>,
): Promise<StudioSettings> {
  const current = await StudioSettingsModel.findById(SETTINGS_ID);
  if (!current) {
    const created = await StudioSettingsModel.create({
      ...DEFAULT_SETTINGS,
      ...update,
    });
    return created.toObject() as StudioSettings;
  }
  if (update.displayName !== undefined) current.displayName = update.displayName;
  if (update.email !== undefined) current.email = update.email;
  if (update.studioName !== undefined) current.studioName = update.studioName;
  if (update.timezone !== undefined) current.timezone = update.timezone;
  if (update.creditAlertThreshold !== undefined) {
    current.creditAlertThreshold = update.creditAlertThreshold;
  }
  if (update.numberFormatLocale !== undefined) {
    current.numberFormatLocale = update.numberFormatLocale;
  }
  const saved = await current.save();
  return saved.toObject() as StudioSettings;
}
