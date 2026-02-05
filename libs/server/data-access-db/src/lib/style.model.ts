import { Schema, model, models, Types, type Model } from 'mongoose';
import type { ComicStyle } from '@dreamweaverstudio/shared-types';

const VisualStyleSchema = new Schema<NonNullable<ComicStyle['visualStyle']>>(
  {
    styleName: { type: String },
    medium: { type: String },
    lineart: { type: String },
    coloring: { type: String },
    lighting: { type: String },
    anatomy: { type: String },
  },
  { _id: false },
);

const SafetySchema = new Schema<NonNullable<ComicStyle['safety']>>(
  {
    sfwOnly: { type: Boolean, default: true },
  },
  { _id: false },
);

const ComicStyleSchema = new Schema<ComicStyle>(
  {
    id: {
      type: String,
      default: () => new Types.ObjectId().toString(),
      index: true,
    },
    name: { type: String, required: true },
    key: { type: String },
    description: { type: String },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    isDefault: { type: Boolean, default: false },
    previewImageUrl: { type: String },
    visualStyle: { type: VisualStyleSchema, default: {} },
    systemPrompt: { type: String },
    promptTemplate: { type: String },
    technicalTags: { type: String },
    negativePrompt: { type: String },
    continuityRules: { type: String },
    formatGuidelines: { type: String },
    interactionLanguage: { type: String, default: 'Italian' },
    promptLanguage: { type: String, default: 'English' },
    safety: { type: SafetySchema, default: { sfwOnly: true } },
  },
  { timestamps: true, collection: 'styles' },
);

export const ComicStyleModel: Model<ComicStyle> =
  (models['ComicStyle'] as Model<ComicStyle> | undefined) ??
  model<ComicStyle>('ComicStyle', ComicStyleSchema);
