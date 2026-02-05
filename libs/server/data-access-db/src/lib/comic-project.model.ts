import {
  Schema,
  model,
  models,
  Types,
  type HydratedDocument,
  type Model,
} from 'mongoose';

import {
  type ComicProject,
  type Page,
  type Panel,
} from '@dreamweaverstudio/shared-types';

export type ComicProjectDocument = HydratedDocument<ComicProject>;

const PanelSchema = new Schema<Panel>(
  {
    id: {
      type: String,
      default: () => new Types.ObjectId().toString(),
      index: true,
    },
    order: { type: Number, required: true },
    prompt: { type: String, required: true },
    imageUrl: { type: String },
    negativePrompt: { type: String },
    caption: { type: String },
    dialogue: { type: [String] },
    notes: { type: String },
  },
  { _id: false },
);

const PageSchema = new Schema<Page>(
  {
    id: {
      type: String,
      default: () => new Types.ObjectId().toString(),
      index: true,
    },
    pageNumber: { type: Number, required: true },
    panels: { type: [PanelSchema], default: [] },
    title: { type: String },
    notes: { type: String },
  },
  { _id: false },
);

const ComicProjectSchema = new Schema<ComicProject>(
  {
    id: {
      type: String,
      default: () => new Types.ObjectId().toString(),
      index: true,
    },
    title: { type: String, required: true },
    synopsis: { type: String },
    status: {
      type: String,
      enum: ['draft', 'in-progress', 'completed'],
      default: 'draft',
    },
    styleId: { type: String },
    pages: { type: [PageSchema], default: [] },
    coverImageUrl: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const ComicProjectModel: Model<ComicProject> =
  (models['ComicProject'] as Model<ComicProject> | undefined) ??
  model<ComicProject>('ComicProject', ComicProjectSchema);
