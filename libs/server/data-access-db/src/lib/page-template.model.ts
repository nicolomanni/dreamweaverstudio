import { Schema, model, models, Types, type Model } from 'mongoose';
import type { PageTemplate } from '@dreamweaverstudio/shared-types';

const PageTemplateSchema = new Schema<PageTemplate>(
  {
    id: {
      type: String,
      default: () => new Types.ObjectId().toString(),
      index: true,
    },
    name: { type: String, required: true },
    key: { type: String },
    description: { type: String },
    type: {
      type: String,
      enum: ['story', 'cover', 'character', 'other'],
      default: 'story',
    },
    orientation: {
      type: String,
      enum: ['portrait', 'landscape', 'square'],
      default: 'portrait',
    },
    aspectRatio: { type: String, default: '9:16' },
    layout: {
      type: String,
      enum: ['single', 'grid', 'custom'],
      default: 'single',
    },
    rows: { type: Number, min: 1, default: 1 },
    cols: { type: Number, min: 1, default: 1 },
    panelCount: { type: Number, min: 1, default: 1 },
    gutter: { type: Number, min: 0, default: 16 },
    safeArea: { type: Number, min: 0, default: 24 },
    resolutionTier: {
      type: String,
      enum: ['standard', 'hd', 'uhd'],
      default: 'hd',
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'pageTemplates' },
);

export const PageTemplateModel: Model<PageTemplate> =
  (models['PageTemplate'] as Model<PageTemplate> | undefined) ??
  model<PageTemplate>('PageTemplate', PageTemplateSchema);
