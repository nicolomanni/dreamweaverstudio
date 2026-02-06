import { useEffect, useMemo, useState } from 'react';
import {
  deleteStyle,
  fetchStyle,
  generateStylePreview,
  uploadStylePreviewImage,
  updateStyle,
} from '@dreamweaverstudio/client-data-access-api';
import type { ComicStyle } from '@dreamweaverstudio/shared-types';
import { signOutUser } from '../../auth';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Image,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  HelperText,
  Input,
  Label,
  Select,
  Switch,
  Tab,
  TabsList,
  Textarea,
} from '@dreamweaverstudio/client-ui';
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
import { hashString } from '../../utils/hash';

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
      queryClient.invalidateQueries({ queryKey: ['studioSettings'] });
    },
    onError: async (err) => {
      if (await handleUnauthorized(err)) return;
      setPreviewError(
        err instanceof Error
          ? err.message
          : 'Unable to generate preview image.',
      );
    },
  });

  const handleSave = async () => {
    if (!validation.valid) {
      setShowValidation(true);
      return;
    }
    setError(null);
    let payload = buildPayload(draft);
    if (draft.previewImageUrl?.startsWith('data:')) {
      try {
        setUploadingPreview(true);
        const styleKey = slugify(
          payload.key ?? payload.name ?? style?.name ?? 'style',
        );
        const previewPrompt = buildPreviewPrompt(draft);
        const negativePrompt = draft.negativePrompt?.trim() || undefined;
        const hashInput = [
          previewPrompt.trim(),
          negativePrompt ? `NEGATIVE:${negativePrompt}` : '',
        ]
          .filter(Boolean)
          .join('\n');
        const promptHash = hashInput ? await hashString(hashInput) : undefined;
        const uploaded = await uploadStylePreviewImage({
          dataUrl: draft.previewImageUrl,
          styleKey,
          styleId: style?.id ?? styleId,
          promptHash,
        });
        payload = { ...payload, previewImageUrl: uploaded.url };
        setDraft((prev) => ({ ...prev, previewImageUrl: uploaded.url }));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to upload preview image.',
        );
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
      <Card>
        <CardHeader
          size="compact"
          className="sticky top-0 z-10 rounded-t-2xl bg-white/95 backdrop-blur dark:bg-card/95"
        >
          <div>
            <div className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
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
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate({ to: '/styles' })}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to list
            </Button>
            {isDirty ? (
              <Badge
                variant="warning"
                className="px-3 py-1 text-[10px] tracking-[0.3em]"
              >
                Unsaved changes
              </Badge>
            ) : null}
          </div>
        </CardHeader>

        <CardBody>
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-5">
            <TabsList>
              {tabs.map((tab) => (
                <Tab
                  key={tab.id}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </Tab>
              ))}
            </TabsList>

            {error ? <Alert variant="danger">{error}</Alert> : null}

            {!styleQuery.isLoading && showValidation && !validation.valid ? (
              <Alert variant="warning">
                Required fields missing: {missingLabels.join(', ')}.
              </Alert>
            ) : null}

            {activeTab === 'basics' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>
                    <span className="flex items-center gap-1">
                      Style name
                      <span className="text-rose-500">*</span>
                    </span>
                  </Label>
                  <Input
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
                    error={hasFieldError('name')}
                    className="mt-2"
                  />
                  {hasFieldError('name') ? (
                    <HelperText className="mt-2 text-rose-600 dark:text-rose-300">
                      This field is required.
                    </HelperText>
                  ) : null}
                </div>
                <div>
                  <Label>
                    <span className="flex items-center gap-1">
                      Key
                      <span className="text-rose-500">*</span>
                    </span>
                  </Label>
                  <Input
                    type="text"
                    value={draft.key ?? ''}
                    onChange={(event) =>
                      setDraft((prev) => ({ ...prev, key: event.target.value }))
                    }
                    aria-invalid={hasFieldError('key')}
                    error={hasFieldError('key')}
                    className="mt-2"
                  />
                  {hasFieldError('key') ? (
                    <HelperText className="mt-2 text-rose-600 dark:text-rose-300">
                      This field is required.
                    </HelperText>
                  ) : null}
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={draft.description ?? ''}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    rows={3}
                    className="mt-2"
                  />
                </div>
              </div>
            ) : null}

            {activeTab === 'visual' ? (
              <div className="grid gap-4 md:grid-cols-2">
                {visualFields.map((field) => (
                  <div key={field.key}>
                    <Label>
                      <span className="flex items-center gap-1">
                        {field.label}
                        {field.required ? (
                          <span className="text-rose-500">*</span>
                        ) : null}
                      </span>
                    </Label>
                    <Input
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
                      error={hasFieldError(field.key)}
                      className="mt-2"
                    />
                    {hasFieldError(field.key) ? (
                      <HelperText className="mt-2 text-rose-600 dark:text-rose-300">
                        This field is required.
                      </HelperText>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {activeTab === 'prompt' ? (
              <div className="space-y-4">
                <div>
                  <Label>
                    <span className="flex items-center gap-1">
                      System prompt
                    </span>
                  </Label>
                  <Textarea
                    value={draft.systemPrompt ?? ''}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        systemPrompt: event.target.value,
                      }))
                    }
                    rows={4}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>
                    <span className="flex items-center gap-1">
                      Prompt template
                      <span className="text-rose-500">*</span>
                    </span>
                  </Label>
                  <Textarea
                    value={draft.promptTemplate ?? ''}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        promptTemplate: event.target.value,
                      }))
                    }
                    rows={8}
                    aria-invalid={hasFieldError('promptTemplate')}
                    error={hasFieldError('promptTemplate')}
                    className="mt-2 font-mono text-xs"
                  />
                  {hasFieldError('promptTemplate') ? (
                    <HelperText className="mt-2 text-rose-600 dark:text-rose-300">
                      This field is required.
                    </HelperText>
                  ) : null}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>
                      <span className="flex items-center gap-1">
                        Technical tags
                        <span className="text-rose-500">*</span>
                      </span>
                    </Label>
                    <Textarea
                      value={draft.technicalTags ?? ''}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          technicalTags: event.target.value,
                        }))
                      }
                      rows={4}
                      aria-invalid={hasFieldError('technicalTags')}
                      error={hasFieldError('technicalTags')}
                      className="mt-2"
                    />
                    {hasFieldError('technicalTags') ? (
                      <HelperText className="mt-2 text-rose-600 dark:text-rose-300">
                        This field is required.
                      </HelperText>
                    ) : null}
                  </div>
                  <div>
                    <Label>
                      <span className="flex items-center gap-1">
                        Negative prompt
                        <span className="text-rose-500">*</span>
                      </span>
                    </Label>
                    <Textarea
                      value={draft.negativePrompt ?? ''}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          negativePrompt: event.target.value,
                        }))
                      }
                      rows={4}
                      aria-invalid={hasFieldError('negativePrompt')}
                      error={hasFieldError('negativePrompt')}
                      className="mt-2"
                    />
                    {hasFieldError('negativePrompt') ? (
                      <HelperText className="mt-2 text-rose-600 dark:text-rose-300">
                        This field is required.
                      </HelperText>
                    ) : null}
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Continuity rules</Label>
                    <Textarea
                      value={draft.continuityRules ?? ''}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          continuityRules: event.target.value,
                        }))
                      }
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Format guidelines</Label>
                    <Textarea
                      value={draft.formatGuidelines ?? ''}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          formatGuidelines: event.target.value,
                        }))
                      }
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === 'safety' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>
                    <span className="flex items-center gap-1">
                      Interaction language
                      <span className="text-rose-500">*</span>
                    </span>
                  </Label>
                  <div className="relative mt-2">
                    <Select
                      value={draft.interactionLanguage ?? 'Italian'}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          interactionLanguage: event.target.value,
                        }))
                      }
                      aria-invalid={hasFieldError('interactionLanguage')}
                      error={hasFieldError('interactionLanguage')}
                    >
                      <option value="Italian">Italian</option>
                      <option value="English">English</option>
                    </Select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                  {hasFieldError('interactionLanguage') ? (
                    <HelperText className="mt-2 text-rose-600 dark:text-rose-300">
                      This field is required.
                    </HelperText>
                  ) : null}
                </div>
                <div>
                  <Label>
                    <span className="flex items-center gap-1">
                      Prompt language
                      <span className="text-rose-500">*</span>
                    </span>
                  </Label>
                  <div className="relative mt-2">
                    <Select
                      value={draft.promptLanguage ?? 'English'}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          promptLanguage: event.target.value,
                        }))
                      }
                      aria-invalid={hasFieldError('promptLanguage')}
                      error={hasFieldError('promptLanguage')}
                    >
                      <option value="English">English</option>
                      <option value="Italian">Italian</option>
                    </Select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                  {hasFieldError('promptLanguage') ? (
                    <HelperText className="mt-2 text-rose-600 dark:text-rose-300">
                      This field is required.
                    </HelperText>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={!!draft.safety?.sfwOnly}
                    onCheckedChange={(checked) =>
                      setDraft((prev) => ({
                        ...prev,
                        safety: { sfwOnly: checked },
                      }))
                    }
                    label="Toggle SFW only"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-foreground">
                      SFW only
                    </p>
                    <HelperText>
                      Enforce safe-for-work output across prompts.
                    </HelperText>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-4">
            <Card variant="muted">
              <CardBody size="sm">
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
              <Button
                as="label"
                variant="outline"
                size="md"
                className="mt-4 w-full"
              >
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
              </Button>
              <Button
                onClick={handleGeneratePreview}
                disabled={previewMutation.isPending}
                variant="primary"
                size="md"
                className="mt-3 w-full"
              >
                <Sparkles className="h-4 w-4" />
                {previewMutation.isPending
                  ? 'Generating...'
                  : 'Generate preview'}
              </Button>
              {previewError ? (
                <HelperText className="mt-3 text-rose-600 dark:text-rose-300">
                  {previewError}
                </HelperText>
              ) : null}
              </CardBody>
            </Card>

            <Card
              variant="muted"
              className="p-5 text-sm text-slate-600 dark:text-foreground/70"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
                Controls
              </p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-foreground">
                      Default style
                    </p>
                    <HelperText>
                      Use this style for new comics by default.
                    </HelperText>
                  </div>
                  <Switch
                    checked={!!draft.isDefault}
                    onCheckedChange={(checked) =>
                      setDraft((prev) => ({
                        ...prev,
                        isDefault: checked,
                      }))
                    }
                    label="Toggle default style"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-foreground">
                      Active
                    </p>
                    <HelperText>
                      Turn off to archive this style.
                    </HelperText>
                  </div>
                  <Switch
                    checked={draft.status !== 'archived'}
                    onCheckedChange={(checked) =>
                      setDraft((prev) => ({
                        ...prev,
                        status: checked ? 'active' : 'archived',
                      }))
                    }
                    label="Toggle active status"
                  />
                </div>
              </div>
            </Card>
          </aside>
        </div>

          {styleQuery.isLoading ? (
            <HelperText className="mt-4">Loading style details...</HelperText>
          ) : null}
        </CardBody>

        <CardFooter
          size="compact"
          className="sticky bottom-0 z-10 bg-white/95 backdrop-blur dark:bg-card/95"
        >
          <Button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            variant="danger"
            size="md"
            className="self-center"
          >
            <Trash2 className="h-4 w-4" />
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
          <div className="flex flex-wrap items-center gap-2 self-center">
            <Button
              onClick={handleSave}
              disabled={
                updateMutation.isPending ||
                styleQuery.isLoading ||
                !isDirty ||
                uploadingPreview ||
                previewMutation.isPending
              }
              size="lg"
              variant="primary"
            >
              {uploadingPreview
                ? 'Uploading preview...'
                : updateMutation.isPending
                  ? 'Saving...'
                  : 'Save style'}
            </Button>
          </div>
        </CardFooter>
      </Card>

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
