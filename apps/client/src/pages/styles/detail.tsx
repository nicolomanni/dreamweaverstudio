import { useEffect, useMemo, useState } from 'react';
import {
  deleteStyle,
  fetchStyle,
  generateStylePreview,
  updateStyle,
} from '@dreamweaverstudio/client-data-access-api';
import type { ComicStyle } from '@dreamweaverstudio/shared-types';
import { signOutUser } from '../../auth';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Image,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  buildDraft,
  buildPayload,
  buildPreviewPrompt,
  REQUIRED_LABELS,
  validateStyleDraft,
  type StyleDraft,
  type VisualStyleKey,
  slugify,
} from './style-utils';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { hashString, uploadStylePreviewImage } from '../../utils/storage';

const visualFields: {
  key: VisualStyleKey;
  label: string;
  required?: boolean;
}[] = [
  { key: 'styleName', label: 'Style label', required: true },
  { key: 'medium', label: 'Medium', required: true },
  { key: 'lineart', label: 'Lineart', required: true },
  { key: 'coloring', label: 'Coloring', required: true },
  { key: 'lighting', label: 'Lighting', required: true },
  { key: 'anatomy', label: 'Anatomy' },
];

const tabs = [
  { id: 'basics', label: 'Basics' },
  { id: 'visual', label: 'Visual' },
  { id: 'prompt', label: 'Prompt' },
  { id: 'safety', label: 'Safety' },
] as const;

type TabId = (typeof tabs)[number]['id'];

const StyleDetailPage = () => {
  const navigate = useNavigate();
  const { styleId } = useParams({ strict: false }) as { styleId?: string };
  const queryClient = useQueryClient();
  const [style, setStyle] = useState<ComicStyle | null>(null);
  const [draft, setDraft] = useState<StyleDraft>(buildDraft(null));
  const [activeTab, setActiveTab] = useState<TabId>('basics');
  const [showValidation, setShowValidation] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const validation = useMemo(() => validateStyleDraft(draft), [draft]);
  const missingLabels = validation.missing.map(
    (key) => REQUIRED_LABELS[key] ?? key,
  );
  const hasFieldError = (key: string) =>
    showValidation && validation.missing.includes(key);
  const inputBase =
    'mt-2 w-full rounded-xl border px-4 py-2 text-sm focus:outline-none transition-colors';
  const inputNormal =
    'border-slate-200 bg-slate-50 text-slate-700 focus:border-primary dark:border-border dark:bg-background dark:text-foreground';
  const inputError =
    'border-rose-300 bg-rose-50 text-rose-700 placeholder-rose-300 focus:border-rose-500 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100';

  const isDirty = useMemo(() => {
    if (!style) return true;
    return JSON.stringify(buildDraft(style)) !== JSON.stringify(draft);
  }, [style, draft]);

  const handleUnauthorized = async (err: unknown) => {
    if (err instanceof Error && err.message === 'unauthorized') {
      await signOutUser();
      await navigate({ to: '/' });
      return true;
    }
    return false;
  };

  useEffect(() => {
    document.title = 'Style detail — DreamWeaverComics Studio';
  }, []);

  const styleQuery = useQuery({
    queryKey: ['style', styleId],
    queryFn: () => fetchStyle(styleId),
    enabled: Boolean(styleId),
  });

  useEffect(() => {
    if (styleQuery.error) {
      void handleUnauthorized(styleQuery.error);
      setError('Unable to load style.');
    }
  }, [styleQuery.error]);

  useEffect(() => {
    if (!styleQuery.data) return;
    setStyle(styleQuery.data);
    setDraft(buildDraft(styleQuery.data));
  }, [styleQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<ComicStyle>) => updateStyle(styleId, payload),
    onSuccess: (saved) => {
      setStyle(saved);
      setDraft(buildDraft(saved));
      queryClient.setQueryData(['style', styleId], saved);
      queryClient.invalidateQueries({ queryKey: ['styles'] });
    },
    onError: async (err) => {
      if (await handleUnauthorized(err)) return;
      setError('Unable to save style.');
    },
  });

  const previewMutation = useMutation({
    mutationFn: generateStylePreview,
    onSuccess: (data) => {
      setDraft((prev) => ({ ...prev, previewImageUrl: data.dataUrl }));
    },
    onError: async (err) => {
      if (await handleUnauthorized(err)) return;
      setPreviewError('Unable to generate preview image.');
    },
  });

  const handleSave = async () => {
    if (!validation.valid) {
      setShowValidation(true);
      return;
    }
    setError(null);
    const previewPrompt = buildPreviewPrompt(draft);
    const negativePrompt = draft.negativePrompt?.trim() || undefined;
    let previewImageUrl = draft.previewImageUrl;

    if (!previewImageUrl) {
      if (!previewPrompt.trim()) {
        setPreviewError('Add some style details before generating a preview.');
        return;
      }
      setPreviewError(null);
      try {
        const data = await previewMutation.mutateAsync({
          prompt: previewPrompt,
          negativePrompt,
        });
        previewImageUrl = data.dataUrl;
      } catch (err) {
        return;
      }
    }

    let payload = buildPayload({
      ...draft,
      previewImageUrl: previewImageUrl ?? draft.previewImageUrl,
    });

    if (previewImageUrl?.startsWith('data:')) {
      try {
        setUploadingPreview(true);
        const styleKey = slugify(
          payload.key ?? payload.name ?? style?.name ?? 'style',
        );
        const hashInput = [
          previewPrompt.trim(),
          negativePrompt ? `NEGATIVE:${negativePrompt}` : '',
        ]
          .filter(Boolean)
          .join('\n');
        const promptHash = hashInput ? await hashString(hashInput) : undefined;
        const url = await uploadStylePreviewImage(previewImageUrl, {
          styleKey,
          styleId: style?.id ?? styleId,
          promptHash,
        });
        payload = { ...payload, previewImageUrl: url };
        setDraft((prev) => ({ ...prev, previewImageUrl: url }));
      } catch (err) {
        setError('Unable to upload preview image.');
        return;
      } finally {
        setUploadingPreview(false);
      }
    }
    updateMutation.mutate(payload);
  };

  const deleteMutation = useMutation({
    mutationFn: () => deleteStyle(styleId),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['styles'] });
      queryClient.removeQueries({ queryKey: ['style', styleId] });
      await navigate({ to: '/styles' });
    },
    onError: async (err) => {
      if (await handleUnauthorized(err)) return;
      setError('Unable to delete style.');
    },
  });

  const handleDelete = () => {
    if (deleteMutation.isPending) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    setError(null);
    deleteMutation.mutate();
  };

  const handlePreviewUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDraft((prev) => ({ ...prev, previewImageUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleGeneratePreview = () => {
    const prompt = buildPreviewPrompt(draft);
    if (!prompt.trim()) {
      setPreviewError('Add some style details before generating a preview.');
      return;
    }
    setPreviewError(null);
    previewMutation.mutate({
      prompt,
      negativePrompt: draft.negativePrompt?.trim() || undefined,
    });
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
        <div className="sticky top-0 z-10 -mx-6 -mt-6 flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-border dark:bg-card/95">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
              <span>Catalog</span>
              <ChevronRight className="h-3 w-3" />
              <span>Styles</span>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-foreground">
              {style?.name ?? 'Loading...'}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-foreground/60">
              Fine-tune prompt structure and visual consistency.
            </p>
          </div>
          {isDirty ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              Unsaved changes
            </span>
          ) : (
            <div />
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-4 pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`border-b-2 pb-2 text-xs font-semibold uppercase tracking-[0.25em] transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-foreground/60 dark:hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                {error}
              </div>
            ) : null}

            {!styleQuery.isLoading && showValidation && !validation.valid ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                Required fields missing: {missingLabels.join(', ')}.
              </div>
            ) : null}

            {activeTab === 'basics' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                    <span className="flex items-center gap-1">
                      Style name
                      <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(event) => {
                      const value = event.target.value;
                      setDraft((prev) => ({
                        ...prev,
                        name: value,
                        key:
                          prev.key && prev.key !== slugify(prev.name)
                            ? prev.key
                            : slugify(value),
                      }));
                    }}
                    aria-invalid={hasFieldError('name')}
                    className={`${inputBase} ${
                      hasFieldError('name') ? inputError : inputNormal
                    }`}
                  />
                  {hasFieldError('name') ? (
                    <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">
                      This field is required.
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                    <span className="flex items-center gap-1">
                      Key
                      <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={draft.key ?? ''}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, key: event.target.value }))
                    }
                    aria-invalid={hasFieldError('key')}
                    className={`${inputBase} ${
                      hasFieldError('key') ? inputError : inputNormal
                    }`}
                  />
                  {hasFieldError('key') ? (
                    <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">
                      This field is required.
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                    Status
                  </label>
                  <div className="relative mt-2">
                    <select
                      value={draft.status ?? 'active'}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          status: event.target.value as ComicStyle['status'],
                        }))
                      }
                      className="peer h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 pr-10 text-sm text-slate-700 focus:border-primary focus:outline-none dark:border-border dark:bg-background dark:text-foreground"
                    >
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        isDefault: !prev.isDefault,
                      }))
                    }
                    aria-label="Toggle default style"
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${
                      draft.isDefault
                        ? 'bg-primary'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                        draft.isDefault ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-foreground">
                      Default style
                    </p>
                    <p className="text-xs text-slate-500 dark:text-foreground/60">
                      Used automatically for new comics.
                    </p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                    Description
                  </label>
                  <textarea
                    value={draft.description ?? ''}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    rows={3}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none dark:border-border dark:bg-background dark:text-foreground"
                  />
                </div>
              </div>
            ) : null}

            {activeTab === 'visual' ? (
              <div className="grid gap-4 md:grid-cols-2">
                {visualFields.map((field) => (
                  <div key={field.key}>
                    <label className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                      <span className="flex items-center gap-1">
                        {field.label}
                        {field.required ? (
                          <span className="text-rose-500">*</span>
                        ) : null}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={draft.visualStyle?.[field.key] ?? ''}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          visualStyle: {
                            ...prev.visualStyle,
                            [field.key]: event.target.value,
                          },
                        }))
                      }
                      aria-invalid={hasFieldError(field.key)}
                      className={`${inputBase} ${
                        hasFieldError(field.key) ? inputError : inputNormal
                      }`}
                    />
                    {hasFieldError(field.key) ? (
                      <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">
                        This field is required.
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {activeTab === 'prompt' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                    <span className="flex items-center gap-1">System prompt</span>
                  </label>
                  <textarea
                    value={draft.systemPrompt ?? ''}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        systemPrompt: event.target.value,
                      }))
                    }
                    rows={4}
                    className={`${inputBase} ${inputNormal}`}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                    <span className="flex items-center gap-1">
                      Prompt template
                      <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  <textarea
                    value={draft.promptTemplate ?? ''}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        promptTemplate: event.target.value,
                      }))
                    }
                    rows={8}
                    aria-invalid={hasFieldError('promptTemplate')}
                    className={`${inputBase} font-mono text-xs ${
                      hasFieldError('promptTemplate') ? inputError : inputNormal
                    }`}
                  />
                  {hasFieldError('promptTemplate') ? (
                    <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">
                      This field is required.
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                      <span className="flex items-center gap-1">
                        Technical tags
                        <span className="text-rose-500">*</span>
                      </span>
                    </label>
                    <textarea
                      value={draft.technicalTags ?? ''}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          technicalTags: event.target.value,
                        }))
                      }
                      rows={4}
                      aria-invalid={hasFieldError('technicalTags')}
                      className={`${inputBase} ${
                        hasFieldError('technicalTags') ? inputError : inputNormal
                      }`}
                    />
                    {hasFieldError('technicalTags') ? (
                      <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">
                        This field is required.
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                      <span className="flex items-center gap-1">
                        Negative prompt
                        <span className="text-rose-500">*</span>
                      </span>
                    </label>
                    <textarea
                      value={draft.negativePrompt ?? ''}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          negativePrompt: event.target.value,
                        }))
                      }
                      rows={4}
                      aria-invalid={hasFieldError('negativePrompt')}
                      className={`${inputBase} ${
                        hasFieldError('negativePrompt') ? inputError : inputNormal
                      }`}
                    />
                    {hasFieldError('negativePrompt') ? (
                      <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">
                        This field is required.
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                      Continuity rules
                    </label>
                    <textarea
                      value={draft.continuityRules ?? ''}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          continuityRules: event.target.value,
                        }))
                      }
                      rows={4}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none dark:border-border dark:bg-background dark:text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                      Format guidelines
                    </label>
                    <textarea
                      value={draft.formatGuidelines ?? ''}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          formatGuidelines: event.target.value,
                        }))
                      }
                      rows={4}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none dark:border-border dark:bg-background dark:text-foreground"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === 'safety' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                    <span className="flex items-center gap-1">
                      Interaction language
                      <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  <div className="relative mt-2">
                    <select
                      value={draft.interactionLanguage ?? 'Italian'}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          interactionLanguage: event.target.value,
                        }))
                      }
                      aria-invalid={hasFieldError('interactionLanguage')}
                      className={`peer h-10 w-full appearance-none rounded-xl border px-4 py-2 pr-10 text-sm focus:outline-none ${
                        hasFieldError('interactionLanguage')
                          ? inputError
                          : inputNormal
                      }`}
                    >
                      <option value="Italian">Italian</option>
                      <option value="English">English</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                  {hasFieldError('interactionLanguage') ? (
                    <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">
                      This field is required.
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                    <span className="flex items-center gap-1">
                      Prompt language
                      <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  <div className="relative mt-2">
                    <select
                      value={draft.promptLanguage ?? 'English'}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          promptLanguage: event.target.value,
                        }))
                      }
                      aria-invalid={hasFieldError('promptLanguage')}
                      className={`peer h-10 w-full appearance-none rounded-xl border px-4 py-2 pr-10 text-sm focus:outline-none ${
                        hasFieldError('promptLanguage') ? inputError : inputNormal
                      }`}
                    >
                      <option value="English">English</option>
                      <option value="Italian">Italian</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                  {hasFieldError('promptLanguage') ? (
                    <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">
                      This field is required.
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        safety: { sfwOnly: !prev.safety?.sfwOnly },
                      }))
                    }
                    aria-label="Toggle SFW only"
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${
                      draft.safety?.sfwOnly
                        ? 'bg-primary'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                        draft.safety?.sfwOnly ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-foreground">
                      SFW only
                    </p>
                    <p className="text-xs text-slate-500 dark:text-foreground/60">
                      Enforce safe-for-work output across prompts.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-border dark:bg-background">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
                Preview
              </p>
              <div className="mt-4 flex h-52 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-white dark:border-border dark:bg-card">
                {draft.previewImageUrl ? (
                  <img
                    src={draft.previewImageUrl}
                    alt={draft.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-foreground/50">
                    <Image className="h-6 w-6" />
                    <span className="text-xs">No preview image</span>
                  </div>
                )}
              </div>
              <label className="mt-4 inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-700 transition-colors hover:bg-slate-50 dark:border-border dark:bg-card dark:text-foreground/80">
                Upload preview
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      handlePreviewUpload(file);
                    }
                  }}
                />
              </label>
              <button
                type="button"
                onClick={handleGeneratePreview}
                disabled={previewMutation.isPending}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {previewMutation.isPending ? 'Generating...' : 'Generate preview'}
              </button>
              {previewError ? (
                <p className="mt-3 text-xs text-rose-600 dark:text-rose-300">
                  {previewError}
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-border dark:bg-background dark:text-foreground/70">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
                Status
              </p>
              <div className="mt-3 flex items-center gap-2">
                {draft.status === 'archived' ? (
                  <XCircle className="h-4 w-4 text-rose-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                )}
                <span>{draft.status === 'archived' ? 'Archived' : 'Active'}</span>
              </div>
            </div>
          </aside>
        </div>

        {styleQuery.isLoading ? (
          <div className="mt-4 text-xs text-slate-500 dark:text-foreground/60">
            Loading style details...
          </div>
        ) : null}

        <div className="sticky bottom-0 z-10 -mx-6 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur dark:border-border dark:bg-card/95">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
          >
            <Trash2 className="h-4 w-4" />
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={
                updateMutation.isPending ||
                styleQuery.isLoading ||
                !isDirty ||
                uploadingPreview ||
                previewMutation.isPending
              }
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploadingPreview
                ? 'Uploading preview...'
                : updateMutation.isPending
                  ? 'Saving...'
                  : 'Save style'}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete style"
        description="This action cannot be undone. The style will be removed permanently."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

export default StyleDetailPage;
