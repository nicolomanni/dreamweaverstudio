import mongoose, { Schema } from 'mongoose';
import type { UserProfileSettings } from '@dreamweaverstudio/shared-types';

const UserProfileSchema = new Schema<UserProfileSettings>(
  {
    uid: { type: String, required: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true },
    avatarUrl: { type: String },
  },
  { timestamps: true, collection: 'user_profiles' },
);

UserProfileSchema.index({ uid: 1 }, { unique: true });

const ExistingUserProfileModel =
  mongoose.models['UserProfile'] as mongoose.Model<UserProfileSettings> | undefined;

export const UserProfileModel =
  ExistingUserProfileModel ??
  mongoose.model<UserProfileSettings>('UserProfile', UserProfileSchema);
