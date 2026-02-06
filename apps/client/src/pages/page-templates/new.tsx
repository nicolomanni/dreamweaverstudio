import { useEffect, useMemo, useState } from 'react';
import {
  createPageTemplate,
} from '@dreamweaverstudio/client-data-access-api';
import { signOutUser } from '../../auth';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '@dreamweaverstudio/client-ui';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import PageTemplateFields from './form-fields';
import {
  buildDraft,
  buildPayload,
  REQUIRED_LABELS,
  validatePageTemplateDraft,
  type PageTemplateDraft,
} from './page-template-utils';

const PageTemplateCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const initialDraft = useMemo(() => buildDraft(null), []);
  const [draft, setDraft] = useState<PageTemplateDraft>(initialDraft);
  const [showValidation, setShowValidation] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validation = useMemo(() => validatePageTemplateDraft(draft), [draft]);
  const missingLabels = validation.missing.map((key) => REQUIRED_LABELS[key] ?? key);
  const isDirty = useMemo(
    () => JSON.stringify(initialDraft) !== JSON.stringify(draft),
    [draft, initialDraft],
  );

  const hasFieldError = (field: string) => showValidation && validation.missing.includes(field);

  const handleUnauthorized = async (err: unknown) => {
    if (err instanceof Error && err.message === 'unauthorized') {
      await signOutUser();
      await navigate({ to: '/' });
      return true;
    }
    return false;
  };

  useEffect(() => {
    document.title = 'Create page template — DreamWeaverComics Studio';
  }, []);

  const createMutation = useMutation({
    mutationFn: createPageTemplate,
    onSuccess: async (saved) => {
      await queryClient.invalidateQueries({ queryKey: ['pageTemplates'] });
      await navigate({ to: `/page-templates/${saved.id}` });
    },
    onError: async (err) => {
      await handleUnauthorized(err);
      setError('Unable to create page template.');
    },
  });

  const handleCreate = () => {
    setShowValidation(true);
    setError(null);

    if (!validation.valid) {
      setError('Please complete all required fields before saving.');
      return;
    }

    createMutation.mutate(buildPayload(draft));
  };

  const handleBack = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    navigate({ to: '/page-templates' });
  };

  const handleDiscard = () => {
    setShowDiscardConfirm(false);
    navigate({ to: '/page-templates' });
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
              <span>/</span>
              <span>Page Templates</span>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-foreground">
              New page template
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-foreground/60">
              Define page format, panel layout, and resolution presets.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleBack} variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
              Back to list
            </Button>
          </div>
        </CardHeader>

        <CardBody className="space-y-5">
          {error ? <Alert variant="danger">{error}</Alert> : null}
          {showValidation && !validation.valid ? (
            <Alert variant="warning">
              Required fields missing: {missingLabels.join(', ')}.
            </Alert>
          ) : null}

          <PageTemplateFields
            draft={draft}
            setDraft={setDraft}
            hasFieldError={hasFieldError}
            disabled={createMutation.isPending}
          />
        </CardBody>

        <CardFooter
          size="compact"
          className="sticky bottom-0 z-10 bg-white/95 backdrop-blur dark:bg-card/95"
        >
          <div>
            <Button
              onClick={handleBack}
              disabled={createMutation.isPending}
              variant="outline"
              size="md"
            >
              Cancel
            </Button>
          </div>
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
              onClick={handleCreate}
              disabled={createMutation.isPending}
              variant="primary"
              size="md"
            >
              {createMutation.isPending ? 'Creating...' : 'Create template'}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <ConfirmDialog
        open={showDiscardConfirm}
        title="Discard new template"
        description="Are you sure you want to discard this template? All unsaved changes will be lost."
        confirmLabel="Discard"
        tone="warning"
        onCancel={() => setShowDiscardConfirm(false)}
        onConfirm={handleDiscard}
      />
    </>
  );
};

export default PageTemplateCreatePage;
