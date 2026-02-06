import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  HelperText,
  Input,
  Label,
  Select,
  Switch,
  Textarea,
} from '@dreamweaverstudio/client-ui';
import type { PageTemplateDraft } from './page-template-utils';
import {
  getAspectRatioOptions,
  getDefaultAspectRatio,
  slugify,
  TEMPLATE_LAYOUT_OPTIONS,
  TEMPLATE_ORIENTATION_OPTIONS,
  TEMPLATE_RESOLUTION_OPTIONS,
  TEMPLATE_TYPE_OPTIONS,
} from './page-template-utils';

type PageTemplateFieldsProps = {
  draft: PageTemplateDraft;
  setDraft: Dispatch<SetStateAction<PageTemplateDraft>>;
  hasFieldError: (key: string) => boolean;
  disabled?: boolean;
};

const FormSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-border dark:bg-background/60 md:p-5">
    <div>
      <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-foreground/50">
        {title}
      </p>
      {description ? (
        <HelperText className="mt-1">{description}</HelperText>
      ) : null}
    </div>
    <div className="mt-4">{children}</div>
  </section>
);

const NumberInput = ({
  id,
  value,
  min,
  onChange,
  disabled,
}: {
  id: string;
  value: number | undefined;
  min: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) => (
  <Input
    id={id}
    type="number"
    min={min}
    step={1}
    value={value ?? min}
    onChange={(event) => {
      const next = Number(event.target.value);
      onChange(Number.isFinite(next) ? next : min);
    }}
    disabled={disabled}
    className="mt-2"
  />
);

export const PageTemplateFields = ({
  draft,
  setDraft,
  hasFieldError,
  disabled,
}: PageTemplateFieldsProps) => {
  const orientation = draft.orientation ?? 'portrait';
  const aspectRatioOptions = getAspectRatioOptions(orientation);
  const aspectRatioValues = aspectRatioOptions.map((option) => option.value);
  const aspectRatioValue =
    draft.aspectRatio && aspectRatioValues.includes(draft.aspectRatio)
      ? draft.aspectRatio
      : getDefaultAspectRatio(orientation);
  const isGridLike = draft.layout === 'grid' || draft.layout === 'custom';

  return (
    <div className="space-y-5">
      <FormSection
        title="Identity"
        description="Name, key, and content category for this template."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>
              <span className="flex items-center gap-1">
                Template name
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
              disabled={disabled}
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
              disabled={disabled}
              className="mt-2"
            />
            {hasFieldError('key') ? (
              <HelperText className="mt-2 text-rose-600 dark:text-rose-300">
                This field is required.
              </HelperText>
            ) : (
              <HelperText className="mt-2">
                Used internally as a stable identifier.
              </HelperText>
            )}
          </div>

          <div>
            <Label>Template type</Label>
            <div className="relative mt-2">
              <Select
                value={draft.type ?? 'story'}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    type: event.target.value as PageTemplateDraft['type'],
                  }))
                }
                disabled={disabled}
              >
                {TEMPLATE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={draft.description ?? ''}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, description: event.target.value }))
              }
              rows={3}
              disabled={disabled}
              className="mt-2"
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Format"
        description="Orientation, aspect ratio, and quality preset."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>Orientation</Label>
            <div className="relative mt-2">
              <Select
                value={orientation}
                onChange={(event) =>
                  setDraft((prev) => {
                    const nextOrientation =
                      event.target.value as PageTemplateDraft['orientation'];
                    const nextOptions = getAspectRatioOptions(nextOrientation);
                    const keepCurrentRatio = nextOptions.some(
                      (option) => option.value === prev.aspectRatio,
                    );

                    return {
                      ...prev,
                      orientation: nextOrientation,
                      aspectRatio: keepCurrentRatio
                        ? prev.aspectRatio
                        : getDefaultAspectRatio(nextOrientation),
                    };
                  })
                }
                disabled={disabled}
              >
                {TEMPLATE_ORIENTATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <Label>
              <span className="flex items-center gap-1">
                Aspect ratio
                <span className="text-rose-500">*</span>
              </span>
            </Label>
            <div className="relative mt-2">
              <Select
                value={aspectRatioValue}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    aspectRatio: event.target.value,
                  }))
                }
                aria-invalid={hasFieldError('aspectRatio')}
                error={hasFieldError('aspectRatio')}
                disabled={disabled}
              >
                {aspectRatioOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            {hasFieldError('aspectRatio') ? (
              <HelperText className="mt-2 text-rose-600 dark:text-rose-300">
                This field is required.
              </HelperText>
            ) : null}
          </div>

          <div>
            <Label>Resolution</Label>
            <div className="relative mt-2">
              <Select
                value={draft.resolutionTier ?? 'hd'}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    resolutionTier: event.target.value as PageTemplateDraft['resolutionTier'],
                  }))
                }
                disabled={disabled}
              >
                {TEMPLATE_RESOLUTION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
            <HelperText className="mt-2">
              Resolution is a UI quality label and does not enforce output dimensions.
            </HelperText>
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Layout"
        description="Panel composition and spacing rules."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Layout mode</Label>
            <div className="relative mt-2">
              <Select
                value={draft.layout ?? 'single'}
                onChange={(event) =>
                  setDraft((prev) => {
                    const nextLayout = event.target.value as PageTemplateDraft['layout'];
                    const rows = nextLayout === 'single' ? 1 : prev.rows ?? 1;
                    const cols = nextLayout === 'single' ? 1 : prev.cols ?? 1;
                    const panelCount =
                      nextLayout === 'grid'
                        ? rows * cols
                        : Math.max(prev.panelCount ?? 1, 1);
                    return {
                      ...prev,
                      layout: nextLayout,
                      rows,
                      cols,
                      panelCount,
                    };
                  })
                }
                disabled={disabled}
              >
                {TEMPLATE_LAYOUT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <Label>
              <span className="flex items-center gap-1">
                Panel count
                <span className="text-rose-500">*</span>
              </span>
            </Label>
            <NumberInput
              id="panel-count"
              value={draft.panelCount}
              min={1}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, panelCount: value }))
              }
              disabled={disabled || draft.layout === 'grid'}
            />
            {draft.layout === 'grid' ? (
              <HelperText className="mt-2">
                Auto-calculated from rows and columns.
              </HelperText>
            ) : null}
            {hasFieldError('panelCount') ? (
              <HelperText className="mt-2 text-rose-600 dark:text-rose-300">
                Must be greater than 0.
              </HelperText>
            ) : null}
          </div>

          <div>
            <Label>
              <span className="flex items-center gap-1">
                Rows
                {isGridLike ? <span className="text-rose-500">*</span> : null}
              </span>
            </Label>
            <NumberInput
              id="rows"
              value={draft.rows}
              min={1}
              onChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  rows: value,
                  panelCount:
                    prev.layout === 'grid'
                      ? value * Math.max(prev.cols ?? 1, 1)
                      : prev.panelCount,
                }))
              }
              disabled={disabled || draft.layout === 'single'}
            />
            {hasFieldError('rows') ? (
              <HelperText className="mt-2 text-rose-600 dark:text-rose-300">
                Required for grid/custom layouts.
              </HelperText>
            ) : null}
          </div>

          <div>
            <Label>
              <span className="flex items-center gap-1">
                Columns
                {isGridLike ? <span className="text-rose-500">*</span> : null}
              </span>
            </Label>
            <NumberInput
              id="cols"
              value={draft.cols}
              min={1}
              onChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  cols: value,
                  panelCount:
                    prev.layout === 'grid'
                      ? Math.max(prev.rows ?? 1, 1) * value
                      : prev.panelCount,
                }))
              }
              disabled={disabled || draft.layout === 'single'}
            />
            {hasFieldError('cols') ? (
              <HelperText className="mt-2 text-rose-600 dark:text-rose-300">
                Required for grid/custom layouts.
              </HelperText>
            ) : null}
          </div>

          <div>
            <Label>Gutter (px)</Label>
            <NumberInput
              id="gutter"
              value={draft.gutter}
              min={0}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, gutter: value }))
              }
              disabled={disabled}
            />
          </div>

          <div>
            <Label>Safe area (px)</Label>
            <NumberInput
              id="safe-area"
              value={draft.safeArea}
              min={0}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, safeArea: value }))
              }
              disabled={disabled}
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Publishing"
        description="Activation state and default behavior."
      >
        <div className="grid gap-4 md:grid-cols-[260px_minmax(0,1fr)] md:items-center">
          <div>
            <Label>Status</Label>
            <div className="relative mt-2">
              <Select
                value={draft.status ?? 'active'}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    status: event.target.value as PageTemplateDraft['status'],
                  }))
                }
                disabled={disabled}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </Select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-border dark:bg-card">
            <Switch
              checked={Boolean(draft.isDefault)}
              onCheckedChange={(checked) =>
                setDraft((prev) => ({ ...prev, isDefault: checked }))
              }
              label="Set as default page template"
              disabled={disabled || draft.status === 'archived'}
            />
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-foreground">
                Default template
              </p>
              <HelperText>
                Used as preset for new pages unless overridden manually.
              </HelperText>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

export default PageTemplateFields;
