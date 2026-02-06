import type { PageTemplate } from '@dreamweaverstudio/shared-types';
import { PageTemplateModel } from './page-template.model';

function stripMongoFields(template: PageTemplate & { _id?: unknown; __v?: unknown }) {
  const { _id, __v, ...rest } = template;
  return rest as PageTemplate;
}

async function clearDefaultPageTemplate(excludeId: string) {
  await PageTemplateModel.updateMany(
    { id: { $ne: excludeId } },
    { $set: { isDefault: false } },
  );
}

export async function listPageTemplates(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'active' | 'archived';
}): Promise<{
  data: PageTemplate[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = Math.max(params?.page ?? 1, 1);
  const pageSize = Math.min(Math.max(params?.pageSize ?? 10, 1), 50);
  const query: {
    status?: 'active' | 'archived';
    $or?: Array<{
      name?: RegExp;
      key?: RegExp;
      description?: RegExp;
    }>;
  } = {};

  if (params?.status) {
    query.status = params.status;
  }

  if (params?.search) {
    const regex = new RegExp(params.search, 'i');
    query.$or = [{ name: regex }, { key: regex }, { description: regex }];
  }

  const [templates, total] = await Promise.all([
    PageTemplateModel.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean<PageTemplate[]>(),
    PageTemplateModel.countDocuments(query),
  ]);

  return {
    data: templates.map((template) =>
      stripMongoFields(template as PageTemplate & { _id?: unknown; __v?: unknown }),
    ),
    total,
    page,
    pageSize,
  };
}

export async function getPageTemplateById(
  id: string,
): Promise<PageTemplate | null> {
  const template = await PageTemplateModel.findOne({ id }).lean<PageTemplate>();
  if (!template) return null;
  return stripMongoFields(template as PageTemplate & { _id?: unknown; __v?: unknown });
}

export async function createPageTemplate(
  input: Omit<PageTemplate, 'id' | 'createdAt' | 'updatedAt'> &
    Partial<Pick<PageTemplate, 'id'>>,
): Promise<PageTemplate> {
  const created = await PageTemplateModel.create(input);
  const template = created.toObject({ versionKey: false });
  if (template.isDefault) {
    await clearDefaultPageTemplate(template.id);
  }
  return stripMongoFields(template as PageTemplate & { _id?: unknown; __v?: unknown });
}

export async function updatePageTemplate(
  id: string,
  update: Partial<PageTemplate>,
): Promise<PageTemplate | null> {
  const updated = await PageTemplateModel.findOneAndUpdate({ id }, update, {
    new: true,
  }).lean<PageTemplate>();
  if (!updated) return null;
  if (updated.isDefault) {
    await clearDefaultPageTemplate(updated.id);
  }
  return stripMongoFields(updated as PageTemplate & { _id?: unknown; __v?: unknown });
}

export async function deletePageTemplate(id: string): Promise<boolean> {
  const result = await PageTemplateModel.deleteOne({ id });
  return result.deletedCount === 1;
}
