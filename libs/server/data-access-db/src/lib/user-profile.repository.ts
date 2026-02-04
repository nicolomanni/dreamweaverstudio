import type { UserProfileSettings } from '@dreamweaverstudio/shared-types';
import { UserProfileModel } from './user-profile.model';

export async function getUserProfile(
  uid: string,
): Promise<UserProfileSettings | null> {
  const doc = await UserProfileModel.findOne({ uid }).lean();
  return doc ? (doc as UserProfileSettings) : null;
}

export async function updateUserProfile(
  uid: string,
  update: Partial<UserProfileSettings>,
): Promise<UserProfileSettings> {
  const current =
    (await UserProfileModel.findOne({ uid })) ??
    (await UserProfileModel.create({
      uid,
      displayName: update.displayName ?? '',
      email: update.email ?? '',
      avatarUrl: update.avatarUrl,
    }));

  if (update.displayName !== undefined) current.displayName = update.displayName;
  if (update.email !== undefined) current.email = update.email;
  if (update.avatarUrl !== undefined) current.avatarUrl = update.avatarUrl;

  const saved = await current.save();
  return saved.toObject() as UserProfileSettings;
}
