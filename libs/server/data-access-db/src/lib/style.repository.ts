import type { ComicStyle } from '@dreamweaverstudio/shared-types';
import { ComicStyleModel } from './style.model';

function stripMongoFields(style: ComicStyle & { _id?: unknown; __v?: unknown }) {
  const { _id, __v, ...rest } = style;
  return rest as ComicStyle;
}

async function clearDefaultStyle(excludeId: string) {
  await ComicStyleModel.updateMany(
    { id: { $ne: excludeId } },
    { $set: { isDefault: false } },
  );
}

export async function listComicStyles(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'active' | 'archived';
}): Promise<{
  data: ComicStyle[];
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

  const [styles, total] = await Promise.all([
    ComicStyleModel.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean<ComicStyle[]>(),
    ComicStyleModel.countDocuments(query),
  ]);

  return {
    data: styles.map((style) =>
      stripMongoFields(style as ComicStyle & { _id?: unknown; __v?: unknown }),
    ),
    total,
    page,
    pageSize,
  };
}

export async function getComicStyleById(
  id: string,
): Promise<ComicStyle | null> {
  const style = await ComicStyleModel.findOne({ id }).lean<ComicStyle>();
  if (!style) return null;
  return stripMongoFields(style as ComicStyle & { _id?: unknown; __v?: unknown });
}

export async function createComicStyle(
  input: Omit<ComicStyle, 'id' | 'createdAt' | 'updatedAt'> &
    Partial<Pick<ComicStyle, 'id'>>,
): Promise<ComicStyle> {
  const created = await ComicStyleModel.create(input);
  const style = created.toObject({ versionKey: false });
  if (style.isDefault) {
    await clearDefaultStyle(style.id);
  }
  return stripMongoFields(style as ComicStyle & { _id?: unknown; __v?: unknown });
}

export async function updateComicStyle(
  id: string,
  update: Partial<ComicStyle>,
): Promise<ComicStyle | null> {
  const updated = await ComicStyleModel.findOneAndUpdate({ id }, update, {
    new: true,
  }).lean<ComicStyle>();
  if (!updated) return null;
  if (updated.isDefault) {
    await clearDefaultStyle(updated.id);
  }
  return stripMongoFields(updated as ComicStyle & { _id?: unknown; __v?: unknown });
}

export async function deleteComicStyle(id: string): Promise<boolean> {
  const result = await ComicStyleModel.deleteOne({ id });
  return result.deletedCount === 1;
}
