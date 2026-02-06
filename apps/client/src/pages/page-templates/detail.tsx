import { useEffect, useMemo, useState } from 'react';
import {
  deletePageTemplate,
  fetchPageTemplate,
  updatePageTemplate,
} from '@dreamweaverstudio/client-data-access-api';
import type { PageTemplate } from '@dreamweaverstudio/shared-types';
import { signOutUser } from '../../auth';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Trash2 } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  HelperText,
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

const PageTemplateDetailPage = () => {
  const navigate = useNavigate();
  const { templateId } = useParams({ strict: false }) as { templateId?: string };
  const queryClient = useQueryClient();

  const [template, setTemplate] = useState<PageTemplate | null>(null);
  const [draft, setDraft] = useState<PageTemplateDraft>(buildDraft(null));
  const [showValidation, setShowValidation] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validation = useMemo(() => validatePageTemplateDraft(draft), [draft]);
  const missingLabels = validation.missing.map((key) => REQUIRED_LABELS[key] ?? key);
  const isDirty = useMemo(() => {
    if (!template) return true;
    return JSON.stringify(buildDraft(template)) !== JSON.stringify(draft);
  }, [template, draft]);

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
    document.title = 'Edit page template — DreamWeaverComics Studio';
  }, []);

  const templateQuery = useQuery({
    queryKey: ['pageTemplate', templateId],
    queryFn: () => fetchPageTemplate(templateId!),
    enabled: Boolean(templateId),
    staleTime: 30 * 1000,
    refetchOnMount: 'always',
  });

  useEffect(() => {
    if (templateQuery.error) {
      void handleUnauthorized(templateQuery.error);
      setError('Unable to load page template.');
    }
  }, [templateQuery.error]);

  useEffect(() => {
    if (!templateQuery.data) return;
    setTemplate(templateQuery.data);
    setDraft(buildDraft(templateQuery.data));
  }, [templateQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<PageTemplate>) =>
      updatePageTemplate(templateId!, payload),
    onSuccess: async (saved) => {
      setTemplate(saved);
      setDraft(buildDraft(saved));
      setShowValidation(false);
      await queryClient.invalidateQueries({ queryKey: ['pageTemplates'] });
      queryClient.setQueryData(['pageTemplate', templateId], saved);
    },
    onError: async (err) => {
      await handleUnauthorized(err);
      setError('Unable to save page template.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePageTemplate(templateId!),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['pageTemplates'] });
      queryClient.removeQueries({ queryKey: ['pageTemplate', templateId] });
      await navigate({ to: '/page-templates' });
    },
    onError: async (err) => {
      await handleUnauthorized(err);
      setError('Unable to delete page template.');
    },
  });

  const handleSave = () => {
    setShowValidation(true);
    setError(null);

    if (!validation.valid) {
      setError('Please complete all required fields before saving.');
      return;
    }

    saveMutation.mutate(buildPayload(draft));
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
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
              {template?.name ?? 'Loading...'}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-foreground/60">
              Tune format and panel layout settings for this page template.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate({ to: '/page-templates' })}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to list
            </Button>
          </div>
        </CardHeader>

        <CardBody className="space-y-5">
          {error ? <Alert variant="danger">{error}</Alert> : null}
          {!templateQuery.isLoading && showValidation && !validation.valid ? (
            <Alert variant="warning">
              Required fields missing: {missingLabels.join(', ')}.
            </Alert>
          ) : null}

          <PageTemplateFields
            draft={draft}
            setDraft={setDraft}
            hasFieldError={hasFieldError}
            disabled={templateQuery.isLoading || saveMutation.isPending}
          />

          {templateQuery.isLoading ? (
            <HelperText className="mt-4">Loading template details...</HelperText>
          ) : null}
        </CardBody>

        <CardFooter
          size="compact"
          className="sticky bottom-0 z-10 bg-white/95 backdrop-blur dark:bg-card/95"
        >
          <div className="flex flex-wrap items-center gap-2 self-center">
            <Button
              onClick={() => navigate({ to: '/page-templates' })}
              disabled={saveMutation.isPending || deleteMutation.isPending}
              variant="outline"
              size="md"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              variant="danger"
              size="md"
            >
              <Trash2 className="h-4 w-4" />
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-center">
            <Button
              onClick={() => setDraft(buildDraft(template))}
              disabled={saveMutation.isPending || !isDirty}
              variant="outline"
              size="md"
            >
              Reset
            </Button>
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
              disabled={templateQuery.isLoading || saveMutation.isPending || !isDirty}
              variant="primary"
              size="md"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save template'}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete page template"
        description="This action cannot be undone. The page template will be removed permanently."
        confirmLabel={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        tone="danger"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  );
};

export default PageTemplateDetailPage;
