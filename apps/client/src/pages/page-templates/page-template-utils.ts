import type { PageTemplate } from '@dreamweaverstudio/shared-types';

export type PageTemplateDraft = Omit<
  PageTemplate,
  'id' | 'createdAt' | 'updatedAt'
> & {
  id?: string;
};

export const EMPTY_DRAFT: PageTemplateDraft = {
  name: '',
  key: '',
  description: '',
  type: 'story',
  orientation: 'portrait',
  aspectRatio: '9:16',
  layout: 'single',
  rows: 1,
  cols: 1,
  panelCount: 1,
  gutter: 16,
  safeArea: 24,
  resolutionTier: 'hd',
  status: 'active',
  isDefault: false,
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const buildDraft = (
  template?: Partial<PageTemplate> | null,
): PageTemplateDraft => ({
  id: template?.id,
  name: template?.name ?? EMPTY_DRAFT.name,
  key: template?.key ?? EMPTY_DRAFT.key,
  description: template?.description ?? EMPTY_DRAFT.description,
  type: template?.type ?? EMPTY_DRAFT.type,
  orientation: template?.orientation ?? EMPTY_DRAFT.orientation,
  aspectRatio: template?.aspectRatio ?? EMPTY_DRAFT.aspectRatio,
  layout: template?.layout ?? EMPTY_DRAFT.layout,
  rows: template?.rows ?? EMPTY_DRAFT.rows,
  cols: template?.cols ?? EMPTY_DRAFT.cols,
  panelCount: template?.panelCount ?? EMPTY_DRAFT.panelCount,
  gutter: template?.gutter ?? EMPTY_DRAFT.gutter,
  safeArea: template?.safeArea ?? EMPTY_DRAFT.safeArea,
  resolutionTier: template?.resolutionTier ?? EMPTY_DRAFT.resolutionTier,
  status: template?.status ?? EMPTY_DRAFT.status,
  isDefault: template?.isDefault ?? EMPTY_DRAFT.isDefault,
});

const cleanValue = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const buildPayload = (draft: PageTemplateDraft) => {
  const rows = Math.max(draft.rows ?? 1, 1);
  const cols = Math.max(draft.cols ?? 1, 1);
  const panelCount =
    draft.layout === 'grid'
      ? rows * cols
      : Math.max(draft.panelCount ?? 1, 1);

  return {
    name: draft.name.trim(),
    key: cleanValue(draft.key),
    description: cleanValue(draft.description),
    type: draft.type ?? 'story',
    orientation: draft.orientation ?? 'portrait',
    aspectRatio: cleanValue(draft.aspectRatio) ?? '9:16',
    layout: draft.layout ?? 'single',
    rows,
    cols,
    panelCount,
    gutter: Math.max(draft.gutter ?? 0, 0),
    safeArea: Math.max(draft.safeArea ?? 0, 0),
    resolutionTier: draft.resolutionTier ?? 'hd',
    status: draft.status ?? 'active',
    isDefault: draft.isDefault ?? false,
  };
};

export const validatePageTemplateDraft = (draft: PageTemplateDraft) => {
  const missing: string[] = [];

  if (!draft.name.trim()) missing.push('name');
  if (!draft.key?.trim()) missing.push('key');
  if (!draft.aspectRatio?.trim()) missing.push('aspectRatio');

  if ((draft.layout === 'grid' || draft.layout === 'custom') && !draft.rows) {
    missing.push('rows');
  }

  if ((draft.layout === 'grid' || draft.layout === 'custom') && !draft.cols) {
    missing.push('cols');
  }

  if (!draft.panelCount || draft.panelCount < 1) {
    missing.push('panelCount');
  }

  return {
    valid: missing.length === 0,
    missing,
  };
};

export const REQUIRED_LABELS: Record<string, string> = {
  name: 'Template name',
  key: 'Key',
  aspectRatio: 'Aspect ratio',
  rows: 'Rows',
  cols: 'Columns',
  panelCount: 'Panel count',
};

export const TEMPLATE_TYPE_OPTIONS = [
  { value: 'story', label: 'Story page' },
  { value: 'cover', label: 'Cover page' },
  { value: 'character', label: 'Character detail' },
  { value: 'other', label: 'Other' },
] as const;

export const TEMPLATE_ORIENTATION_OPTIONS = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'square', label: 'Square' },
] as const;

type OrientationKey = NonNullable<PageTemplate['orientation']>;

const ASPECT_RATIO_OPTIONS_BY_ORIENTATION: Record<
  OrientationKey,
  ReadonlyArray<{ value: string; label: string }>
> = {
  portrait: [
    { value: '9:16', label: '9:16 (Vertical story)' },
    { value: '3:4', label: '3:4 (Classic portrait)' },
    { value: '2:3', label: '2:3 (Tall portrait)' },
  ],
  landscape: [
    { value: '16:9', label: '16:9 (Cinematic wide)' },
    { value: '4:3', label: '4:3 (Classic landscape)' },
    { value: '3:2', label: '3:2 (Wide panel)' },
  ],
  square: [{ value: '1:1', label: '1:1 (Square)' }],
};

export const getAspectRatioOptions = (orientation?: OrientationKey) =>
  ASPECT_RATIO_OPTIONS_BY_ORIENTATION[orientation ?? 'portrait'];

export const getDefaultAspectRatio = (orientation?: OrientationKey) =>
  getAspectRatioOptions(orientation)[0]?.value ?? '9:16';

export const TEMPLATE_LAYOUT_OPTIONS = [
  { value: 'single', label: 'Single panel' },
  { value: 'grid', label: 'Grid' },
  { value: 'custom', label: 'Custom' },
] as const;

export const TEMPLATE_RESOLUTION_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'hd', label: 'High Definition' },
  { value: 'uhd', label: 'Ultra High Definition' },
] as const;
