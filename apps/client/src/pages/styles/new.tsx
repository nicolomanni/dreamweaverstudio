import { useEffect, useMemo, useState } from 'react';
import {
  createStyle,
  extractStyleFromImage,
  extractStyleFromPrompt,
  generateStylePreview,
  uploadStylePreviewImage,
} from '@dreamweaverstudio/client-data-access-api';
import type { ComicStyle } from '@dreamweaverstudio/shared-types';
import { signOutUser } from '../../auth';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Image,
  PencilLine,
  Sparkles,
  XCircle,
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
  SegmentedControl,
  SegmentedItem,
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
  DREAMWEAVER_PRESET,
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
type Mode = 'manual' | 'prompt' | 'image';

const StyleCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<StyleDraft>(buildDraft(null));
  const [activeTab, setActiveTab] = useState<TabId>('basics');
  const [mode, setMode] = useState<Mode>('manual');
  const [hasExtracted, setHasExtracted] = useState(true);
  const [examplePrompt, setExamplePrompt] = useState('');
  const [exampleImage, setExampleImage] = useState<{
    dataUrl: string;
    mimeType: string;
  } | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [uploadingPreview, setUploadingPreview] = useState(false);

  const validation = useMemo(() => validateStyleDraft(draft), [draft]);
  const missingLabels = validation.missing.map(
    (key) => REQUIRED_LABELS[key] ?? key,
  );
  const emptyDraft = useMemo(() => buildDraft(null), []);
  const isDirty = useMemo(() => {
    const draftChanged =
      JSON.stringify(draft) !== JSON.stringify(emptyDraft);
    return (
      draftChanged ||
      Boolean(examplePrompt.trim()) ||
      Boolean(exampleImage) ||
      mode !== 'manual'
    );
  }, [draft, emptyDraft, examplePrompt, exampleImage, mode]);
  const canShowForm = mode === 'manual' || hasExtracted;
  const hasFieldError = (key: string) =>
    showValidation && validation.missing.includes(key);

  const handleUnauthorized = async (err: unknown) => {
    if (err instanceof Error && err.message === 'unauthorized') {
      await signOutUser();
      await navigate({ to: '/' });
      return true;
    }
    return false;
  };

  useEffect(() => {
    document.title = 'Create style — DreamWeaverComics Studio';
  }, []);

  const applyExtractedStyle = (data: Partial<StyleDraft>) => {
    const next = buildDraft(data);
    const key = next.key?.trim() || slugify(next.name || 'style');
    setDraft({ ...next, key });
    setHasExtracted(true);
  };

  const handlePromptExtract = async () => {
    if (!examplePrompt.trim()) return;
    setExtracting(true);
    setError(null);
    try {
      const extracted = await extractStyleFromPrompt(examplePrompt);
      applyExtractedStyle(extracted);
      setActiveTab('basics');
      queryClient.invalidateQueries({ queryKey: ['studioSettings'] });
    } catch (err) {
      if (await handleUnauthorized(err)) return;
      setError('Unable to extract style from prompt.');
    } finally {
      setExtracting(false);
    }
  };

  const handleImageExtract = async () => {
    if (!exampleImage) return;
    setExtracting(true);
    setError(null);
    try {
      const extracted = await extractStyleFromImage({
        data: exampleImage.dataUrl,
        mimeType: exampleImage.mimeType,
      });
      applyExtractedStyle({
        ...extracted,
        previewImageUrl: exampleImage.dataUrl,
      });
      setActiveTab('basics');
      queryClient.invalidateQueries({ queryKey: ['studioSettings'] });
    } catch (err) {
      if (await handleUnauthorized(err)) return;
      setError('Unable to extract style from image.');
    } finally {
      setExtracting(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: (payload: Omit<ComicStyle, 'id' | 'createdAt' | 'updatedAt'>) =>
      createStyle(payload),
    onSuccess: async (saved) => {
      queryClient.invalidateQueries({ queryKey: ['styles'] });
      await navigate({ to: `/styles/${saved.id}` });
    },
    onError: async (err) => {
      if (await handleUnauthorized(err)) return;
      setError('Unable to create style.');
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
        err instanceof Error ? err.message : 'Unable to generate preview image.',
      );
    },
  });

  const handleSave = async () => {
    if (!canShowForm) return;
    if (!validation.valid) {
      setShowValidation(true);
      return;
    }
    setError(null);
    let payload = buildPayload(draft);
    if (draft.previewImageUrl?.startsWith('data:')) {
      try {
        setUploadingPreview(true);
        const styleKey = slugify(payload.key ?? payload.name);
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
          promptHash,
        });
        payload = { ...payload, previewImageUrl: uploaded.url };
        setDraft((prev) => ({ ...prev, previewImageUrl: uploaded.url }));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Unable to upload preview image.',
        );
        return;
      } finally {
        setUploadingPreview(false);
      }
    }
    createMutation.mutate(payload);
  };

  const handleDiscard = () => {
    setShowDiscardConfirm(true);
  };

  const confirmDiscard = () => {
    setShowDiscardConfirm(false);
    navigate({ to: '/styles' });
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

  const handlePreviewUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDraft((prev) => ({ ...prev, previewImageUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Card>
        <CardHeader className="sticky top-0 z-10 rounded-t-2xl bg-white/95 backdrop-blur dark:bg-card/95">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
              <span>Catalog</span>
              <ChevronRight className="h-3 w-3" />
              <span>Styles</span>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-foreground">
              New comic style
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-foreground/60">
              Define visual rules, prompts, and safety constraints for new comics.
            </p>
          </div>
        </CardHeader>

        <CardBody>
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="space-y-5">
            <Card variant="muted">
              <CardBody size="sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
                Start from
              </p>
              <SegmentedControl className="mt-4">
                {([
                  {
                    id: 'manual',
                    label: 'Manual',
                    description: 'Start from scratch',
                    icon: PencilLine,
                  },
                  {
                    id: 'prompt',
                    label: 'Prompt',
                    description: 'Extract from example',
                    icon: FileText,
                  },
                  {
                    id: 'image',
                    label: 'Image',
                    description: 'Extract from visual',
                    icon: Image,
                  },
                ] as const).map((item, index, items) => {
                  const Icon = item.icon;
                  const isActive = mode === item.id;
                  return (
                    <SegmentedItem
                      key={item.id}
                      onClick={() => {
                        setMode(item.id);
                        setHasExtracted(item.id === 'manual');
                      }}
                      active={isActive}
                      withDivider={index < items.length - 1}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                          isActive
                            ? 'bg-primary/20 text-primary'
                            : 'bg-slate-100 text-slate-500 dark:bg-background dark:text-foreground/60'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                          {item.label}
                        </p>
                        <p className="mt-1 text-[10px] font-medium normal-case tracking-normal text-slate-400 dark:text-foreground/50">
                          {item.description}
                        </p>
                      </div>
                    </SegmentedItem>
                  );
                })}
              </SegmentedControl>

              {mode === 'prompt' ? (
                <div className="mt-4 space-y-3">
                  <Textarea
                    value={examplePrompt}
                    onChange={(event) => setExamplePrompt(event.target.value)}
                    rows={5}
                    className="mt-2"
                    placeholder="Paste your example prompt here..."
                  />
                  <Button
                    onClick={handlePromptExtract}
                    disabled={extracting || !examplePrompt.trim()}
                    variant="primary"
                    size="md"
                  >
                    {extracting ? 'Extracting...' : 'Extract with Gemini'}
                  </Button>
                </div>
              ) : null}

              {mode === 'image' ? (
                <div className="mt-4 space-y-3">
                  <div className="flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-white dark:border-border dark:bg-card">
                    {exampleImage ? (
                      <img
                        src={exampleImage.dataUrl}
                        alt="Example"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-foreground/50">
                        <Image className="h-6 w-6" />
                        <span className="text-xs">Upload reference image</span>
                      </div>
                    )}
                  </div>
                  <Button
                    as="label"
                    variant="outline"
                    size="md"
                    className="w-full"
                  >
                    Upload image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          setExampleImage({
                            dataUrl: reader.result as string,
                            mimeType: file.type,
                          });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </Button>
                  <Button
                    onClick={handleImageExtract}
                    disabled={extracting || !exampleImage}
                    variant="primary"
                    size="md"
                  >
                    {extracting ? 'Extracting...' : 'Extract with Gemini'}
                  </Button>
                </div>
              ) : null}

              </CardBody>
            </Card>

            <Card variant="muted">
              <CardBody size="sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
                Presets
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 dark:border-border dark:bg-card dark:text-foreground/60">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 dark:text-foreground/70">
                    DreamWeaver baseline
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-foreground/50">
                    Apply the default DreamWeaverComics visual style pack.
                  </p>
                </div>
                <Button
                  onClick={() => applyExtractedStyle(DREAMWEAVER_PRESET)}
                  variant="outline"
                  size="md"
                >
                  <Sparkles className="h-4 w-4" />
                  Apply preset
                </Button>
              </div>
              </CardBody>
            </Card>

            {canShowForm ? (
              <TabsList className="border-b border-slate-200 dark:border-border">
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
            ) : (
              <Card className="text-sm text-slate-500 dark:text-foreground/60">
                <CardBody size="sm">
                  Complete the extraction step to unlock the style editor.
                </CardBody>
              </Card>
            )}

            {canShowForm && error ? <Alert variant="danger">{error}</Alert> : null}

            {canShowForm && showValidation && !validation.valid ? (
              <Alert variant="warning">
                Required fields missing: {missingLabels.join(', ')}.
              </Alert>
            ) : null}

            {canShowForm && activeTab === 'basics' ? (
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
                <div>
                  <Label>Status</Label>
                  <div className="relative mt-2">
                    <Select
                      value={draft.status ?? 'active'}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          status: event.target.value as ComicStyle['status'],
                        }))
                      }
                    >
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </Select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
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
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-foreground">
                      Default style
                    </p>
                    <HelperText>
                      Used automatically for new comics.
                    </HelperText>
                  </div>
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

            {canShowForm && activeTab === 'visual' ? (
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

            {canShowForm && activeTab === 'prompt' ? (
              <div className="space-y-4">
                <div>
                  <Label>
                    <span className="flex items-center gap-1">System prompt</span>
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

            {canShowForm && activeTab === 'safety' ? (
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
                {previewMutation.isPending ? 'Generating...' : 'Generate preview'}
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
            </Card>
            </aside>
          </div>
        </CardBody>

        <CardFooter className="sticky bottom-0 z-10 bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur dark:bg-card/95 dark:shadow-[0_-12px_40px_rgba(15,23,42,0.6)]">
          <Button onClick={handleDiscard} variant="outline" size="md">
            Discard
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            {isDirty ? (
              <Badge
                variant="warning"
                className="px-3 py-1 text-[10px] tracking-[0.3em]"
              >
                Unsaved changes
              </Badge>
            ) : null}
            <Button
              onClick={handleSave}
              disabled={
                createMutation.isPending ||
                !canShowForm ||
                uploadingPreview ||
                previewMutation.isPending
              }
              size="lg"
              variant="primary"
            >
              {uploadingPreview
                ? 'Uploading preview...'
                : createMutation.isPending
                  ? 'Saving...'
                  : 'Create style'}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <ConfirmDialog
        open={showDiscardConfirm}
        title="Discard new style"
        description="Are you sure you want to discard this style? All unsaved changes will be lost."
        confirmLabel="Discard"
        cancelLabel="Cancel"
        tone="warning"
        onConfirm={confirmDiscard}
        onCancel={() => setShowDiscardConfirm(false)}
      />
    </>
  );
};

export default StyleCreatePage;
