import type { ComicStyle } from '@dreamweaverstudio/shared-types';

export type StyleDraft = Omit<ComicStyle, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

export type VisualStyleKey = keyof NonNullable<ComicStyle['visualStyle']>;

export const EMPTY_DRAFT: StyleDraft = {
  name: '',
  key: '',
  description: '',
  status: 'active',
  isDefault: false,
  previewImageUrl: '',
  visualStyle: {
    styleName: '',
    medium: '',
    lineart: '',
    coloring: '',
    lighting: '',
    anatomy: '',
  },
  systemPrompt: '',
  promptTemplate: '',
  technicalTags: '',
  negativePrompt: '',
  continuityRules: '',
  formatGuidelines: '',
  interactionLanguage: 'Italian',
  promptLanguage: 'English',
  safety: {
    sfwOnly: true,
  },
};

export const DREAMWEAVER_PRESET: StyleDraft = {
  name: 'DreamWeaver Style',
  key: 'dreamweaver-style',
  description: 'Default DreamWeaverComics visual style and prompt structure.',
  status: 'active',
  isDefault: true,
  visualStyle: {
    styleName: 'DreamWeaverComics (2D Western Webcomic)',
    medium: 'Digital 2D Western Comic Book Art.',
    lineart:
      'Crisp, thin, clean black ink outlines. No sketching, no rough pencils, no painterly styles.',
    coloring:
      'Cel-shading (hard-edged shadows) mixed with soft gradients for skin/fabric volume. Flat, vibrant colors.',
    lighting:
      'Cinematic and volumetric (e.g., TV glow, warm sunlight, dramatic shadows).',
    anatomy: 'Soft, volumetric, and expressive.',
  },
  systemPrompt:
    'You are DreamWeaverComics, a professional comic book artist and writer with expertise in creating high-quality digital comics for platforms like DeviantArt and Webtoon. You specialize in visual storytelling, Transformation (TF) themes, and expressive character consistency.',
  promptTemplate: `### 🎨 Prompt: [Comic Title] - Page [X]

Subject:
[Brief summary of the action]

Visual Style (STRICT):
Style: DreamWeaverComics (2D Western Webcomic).
Format: [Horizontal 16:9 / Vertical Strip].
Lineart: Crisp, thin black ink outlines.
Coloring: Cel-shading.
Consistency: [Notes on character outfit/state to avoid errors].

Panel Layout ([Number] Panels - [Top to Bottom / Grid]):
- Panel 1: [Visual Description] + [Dialogue/Caption].
- Panel 2: ...

Technical Tags:
[format tags], DreamWeaverComics style, clean lineart, cel shading, [character tags], [action tags], [lighting tags], high quality.`,
  technicalTags:
    'DreamWeaverComics style, clean lineart, cel shading, high quality, [character tags], [action tags], [lighting tags]',
  negativePrompt:
    'photorealistic, 3D render, oil painting, watercolor, messy sketch, rough edges, bad anatomy, missing limbs, text glitches, NSFW, nudity, skinny (if character is heavy), wrong colors.',
  continuityRules:
    'Continuity: obsessively track character details (hair color, outfit state, body shape) from panel to panel to prevent resets.',
  formatGuidelines:
    'Ask the user if they want a Horizontal Page (16:9) or a Vertical Webtoon Strip before generating prompts.',
  interactionLanguage: 'Italian',
  promptLanguage: 'English',
  safety: {
    sfwOnly: true,
  },
};

export const buildDraft = (style?: Partial<ComicStyle> | null): StyleDraft => ({
  id: style?.id,
  name: style?.name ?? EMPTY_DRAFT.name,
  key: style?.key ?? EMPTY_DRAFT.key,
  description: style?.description ?? EMPTY_DRAFT.description,
  status: style?.status ?? EMPTY_DRAFT.status,
  isDefault: style?.isDefault ?? EMPTY_DRAFT.isDefault,
  previewImageUrl: style?.previewImageUrl ?? EMPTY_DRAFT.previewImageUrl,
  visualStyle: {
    ...EMPTY_DRAFT.visualStyle,
    ...(style?.visualStyle ?? {}),
  },
  systemPrompt: style?.systemPrompt ?? EMPTY_DRAFT.systemPrompt,
  promptTemplate: style?.promptTemplate ?? EMPTY_DRAFT.promptTemplate,
  technicalTags: style?.technicalTags ?? EMPTY_DRAFT.technicalTags,
  negativePrompt: style?.negativePrompt ?? EMPTY_DRAFT.negativePrompt,
  continuityRules: style?.continuityRules ?? EMPTY_DRAFT.continuityRules,
  formatGuidelines: style?.formatGuidelines ?? EMPTY_DRAFT.formatGuidelines,
  interactionLanguage:
    style?.interactionLanguage ?? EMPTY_DRAFT.interactionLanguage,
  promptLanguage: style?.promptLanguage ?? EMPTY_DRAFT.promptLanguage,
  safety: {
    ...EMPTY_DRAFT.safety,
    ...(style?.safety ?? {}),
  },
});

const cleanValue = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const buildPayload = (draft: StyleDraft) => ({
  name: draft.name.trim(),
  key: cleanValue(draft.key),
  description: cleanValue(draft.description),
  status: draft.status ?? 'active',
  isDefault: draft.isDefault ?? false,
  previewImageUrl: cleanValue(draft.previewImageUrl),
  visualStyle: {
    styleName: cleanValue(draft.visualStyle?.styleName),
    medium: cleanValue(draft.visualStyle?.medium),
    lineart: cleanValue(draft.visualStyle?.lineart),
    coloring: cleanValue(draft.visualStyle?.coloring),
    lighting: cleanValue(draft.visualStyle?.lighting),
    anatomy: cleanValue(draft.visualStyle?.anatomy),
  },
  systemPrompt: cleanValue(draft.systemPrompt),
  promptTemplate: cleanValue(draft.promptTemplate),
  technicalTags: cleanValue(draft.technicalTags),
  negativePrompt: cleanValue(draft.negativePrompt),
  continuityRules: cleanValue(draft.continuityRules),
  formatGuidelines: cleanValue(draft.formatGuidelines),
  interactionLanguage: cleanValue(draft.interactionLanguage) ?? 'Italian',
  promptLanguage: cleanValue(draft.promptLanguage) ?? 'English',
  safety: {
    sfwOnly: draft.safety?.sfwOnly ?? true,
  },
});

export const buildPreviewPrompt = (draft: StyleDraft) => {
  const lines: string[] = [];
  if (draft.name?.trim()) {
    lines.push(`Style name: ${draft.name.trim()}.`);
  }
  if (draft.description?.trim()) {
    lines.push(`Description: ${draft.description.trim()}.`);
  }
  const visual = draft.visualStyle ?? {};
  const visualParts = [
    visual.styleName ? `Style: ${visual.styleName}.` : null,
    visual.medium ? `Medium: ${visual.medium}.` : null,
    visual.lineart ? `Lineart: ${visual.lineart}.` : null,
    visual.coloring ? `Coloring: ${visual.coloring}.` : null,
    visual.lighting ? `Lighting: ${visual.lighting}.` : null,
    visual.anatomy ? `Anatomy: ${visual.anatomy}.` : null,
  ].filter(Boolean) as string[];
  if (visualParts.length) {
    lines.push(...visualParts);
  }
  if (draft.technicalTags?.trim()) {
    lines.push(`Technical tags: ${draft.technicalTags.trim()}.`);
  }
  if (draft.formatGuidelines?.trim()) {
    lines.push(`Format guidelines: ${draft.formatGuidelines.trim()}.`);
  }
  if (draft.continuityRules?.trim()) {
    lines.push(`Continuity: ${draft.continuityRules.trim()}.`);
  }
  if (draft.promptTemplate?.trim()) {
    lines.push(
      `Prompt template reference:\n${draft.promptTemplate.trim()}`,
    );
  }
  return lines.join('\n');
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const validateStyleDraft = (draft: StyleDraft) => {
  const missing: string[] = [];
  if (!draft.name.trim()) missing.push('name');
  if (!draft.key?.trim()) missing.push('key');
  if (!draft.visualStyle?.styleName?.trim()) missing.push('styleName');
  if (!draft.visualStyle?.medium?.trim()) missing.push('medium');
  if (!draft.visualStyle?.lineart?.trim()) missing.push('lineart');
  if (!draft.visualStyle?.coloring?.trim()) missing.push('coloring');
  if (!draft.visualStyle?.lighting?.trim()) missing.push('lighting');
  if (!draft.promptTemplate?.trim()) missing.push('promptTemplate');
  if (!draft.technicalTags?.trim()) missing.push('technicalTags');
  if (!draft.negativePrompt?.trim()) missing.push('negativePrompt');
  if (!draft.interactionLanguage?.trim()) missing.push('interactionLanguage');
  if (!draft.promptLanguage?.trim()) missing.push('promptLanguage');

  return {
    valid: missing.length === 0,
    missing,
  };
};

export const REQUIRED_LABELS: Record<string, string> = {
  name: 'Style name',
  key: 'Key',
  styleName: 'Style label',
  medium: 'Medium',
  lineart: 'Lineart',
  coloring: 'Coloring',
  lighting: 'Lighting',
  promptTemplate: 'Prompt template',
  technicalTags: 'Technical tags',
  negativePrompt: 'Negative prompt',
  interactionLanguage: 'Interaction language',
  promptLanguage: 'Prompt language',
};
