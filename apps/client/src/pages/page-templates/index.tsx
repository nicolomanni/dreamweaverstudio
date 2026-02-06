import { useEffect, useMemo, useState } from 'react';
import {
  deletePageTemplate,
  fetchPageTemplates,
  updatePageTemplate,
} from '@dreamweaverstudio/client-data-access-api';
import type { PageTemplate } from '@dreamweaverstudio/shared-types';
import { signOutUser } from '../../auth';
import { useNavigate } from '@tanstack/react-router';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PencilLine,
  Plus,
  RefreshCcw,
  Search,
  Star,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardHeader,
  HelperText,
  IconButton,
  Input,
  Label,
  Select,
  useToast,
} from '@dreamweaverstudio/client-ui';
import { ConfirmDialog } from '../../components/ConfirmDialog';

const PageTemplatesListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(8);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>(
    'all',
  );
  const [deleteTarget, setDeleteTarget] = useState<PageTemplate | null>(null);
  const { pushToast } = useToast();

  const handleUnauthorized = async (err: unknown) => {
    if (err instanceof Error && err.message === 'unauthorized') {
      await signOutUser();
      await navigate({ to: '/' });
      return true;
    }
    return false;
  };

  useEffect(() => {
    document.title = 'Page Templates — DreamWeaverComics Studio';
  }, []);

  const templatesQuery = useQuery({
    queryKey: ['pageTemplates', { pageIndex, pageSize, search, statusFilter }],
    queryFn: () =>
      fetchPageTemplates({
        page: pageIndex + 1,
        pageSize,
        q: search.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      }),
    placeholderData: (prev) =>
      prev ?? { data: [], total: 0, page: pageIndex + 1, pageSize },
    staleTime: 60 * 1000,
    refetchOnMount: 'always',
  });

  useEffect(() => {
    if (templatesQuery.error) {
      void handleUnauthorized(templatesQuery.error);
    }
  }, [templatesQuery.error]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePageTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageTemplates'] });
    },
    onError: async (err) => {
      await handleUnauthorized(err);
    },
  });

  const defaultMutation = useMutation({
    mutationFn: (payload: { template: PageTemplate; isDefault: boolean }) =>
      updatePageTemplate(payload.template.id, { isDefault: payload.isDefault }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageTemplates'] });
      pushToast('success', 'Default template updated.');
    },
    onError: async (err) => {
      await handleUnauthorized(err);
      pushToast('error', 'Failed to update default template.');
    },
  });

  const columns = useMemo<ColumnDef<PageTemplate>[]>(
    () => [
      {
        header: 'Template',
        accessorKey: 'name',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
                {row.name}
              </p>
              <HelperText>{row.description || row.key || 'No description'}</HelperText>
            </div>
          );
        },
      },
      {
        header: 'Format',
        id: 'format',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex flex-wrap gap-2">
              <Badge variant="neutral" className="px-2 py-1 text-[10px] tracking-[0.2em]">
                {row.type || 'story'}
              </Badge>
              <Badge variant="neutral" className="px-2 py-1 text-[10px] tracking-[0.2em]">
                {row.orientation || 'portrait'}
              </Badge>
              <Badge variant="neutral" className="px-2 py-1 text-[10px] tracking-[0.2em]">
                {row.aspectRatio || '9:16'}
              </Badge>
              <Badge variant="neutral" className="px-2 py-1 text-[10px] tracking-[0.2em]">
                {row.resolutionTier || 'hd'}
              </Badge>
            </div>
          );
        },
      },
      {
        header: 'Layout',
        id: 'layout',
        cell: (info) => {
          const row = info.row.original;
          const isGridLike = row.layout === 'grid' || row.layout === 'custom';
          return (
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-foreground">
                {row.layout || 'single'} • {row.panelCount || 1} panels
              </p>
              <HelperText>
                {isGridLike
                  ? `${row.rows || 1}x${row.cols || 1} • gutter ${row.gutter || 0}px • safe ${row.safeArea || 0}px`
                  : `gutter ${row.gutter || 0}px • safe ${row.safeArea || 0}px`}
              </HelperText>
            </div>
          );
        },
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: (info) => {
          const value = info.getValue() as PageTemplate['status'];
          const isArchived = value === 'archived';
          return (
            <Badge variant={isArchived ? 'danger' : 'success'}>
              {isArchived ? (
                <XCircle className="h-3.5 w-3.5" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              {isArchived ? 'Archived' : 'Active'}
            </Badge>
          );
        },
      },
      {
        header: 'Updated',
        accessorKey: 'updatedAt',
        cell: (info) => {
          const value = info.getValue() as string | undefined;
          return (
            <HelperText as="span">
              {value ? new Date(value).toLocaleDateString() : '—'}
            </HelperText>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center justify-end gap-2">
              <IconButton
                onClick={(event) => {
                  event.stopPropagation();
                  navigate({ to: `/page-templates/${row.id}` });
                }}
                aria-label="Edit template"
                variant="outline"
                size="sm"
              >
                <PencilLine className="h-4 w-4" />
              </IconButton>
              <IconButton
                onClick={(event) => {
                  event.stopPropagation();
                  if (row.isDefault && row.status === 'archived') {
                    defaultMutation.mutate({ template: row, isDefault: false });
                    return;
                  }
                  if (row.status === 'archived') return;
                  defaultMutation.mutate({
                    template: row,
                    isDefault: !row.isDefault,
                  });
                }}
                aria-label={row.isDefault ? 'Default template' : 'Set as default'}
                disabled={
                  defaultMutation.isPending ||
                  (!row.isDefault && row.status === 'archived')
                }
                variant={row.isDefault ? 'warn' : 'outline'}
                size="sm"
                className={
                  row.status === 'archived' && !row.isDefault
                    ? 'border-slate-200 bg-slate-50 text-slate-300 dark:border-border dark:bg-background dark:text-foreground/40'
                    : undefined
                }
              >
                <Star className={`h-4 w-4 ${row.isDefault ? 'fill-current' : ''}`} />
              </IconButton>
              <IconButton
                onClick={(event) => {
                  event.stopPropagation();
                  setDeleteTarget(row);
                }}
                aria-label="Delete template"
                variant="danger"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </IconButton>
            </div>
          );
        },
      },
    ],
    [navigate, defaultMutation],
  );

  const templates = templatesQuery.data?.data ?? [];
  const total = templatesQuery.data?.total ?? 0;

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  const table = useReactTable({
    data: templates,
    columns,
    pageCount: Math.ceil(total / pageSize),
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const loading = templatesQuery.isLoading;
  const error = templatesQuery.isError ? 'Unable to load page templates.' : null;

  return (
    <>
      <Card>
        <CardHeader>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
              Catalog
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-foreground">
              Page templates
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-foreground/60">
              Manage page formats, layout patterns, and generation presets.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <IconButton
              onClick={() => templatesQuery.refetch()}
              disabled={templatesQuery.isFetching}
              aria-label="Reload page templates"
              variant="outline"
              size="md"
            >
              <RefreshCcw
                className={`h-4 w-4 ${templatesQuery.isFetching ? 'animate-spin' : ''}`}
              />
            </IconButton>
            <Button onClick={() => navigate({ to: '/page-templates/new' })} size="md">
              <Plus className="h-4 w-4" />
              New template
            </Button>
          </div>
        </CardHeader>

        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-6 py-4 dark:border-border">
          <div className="relative min-w-[220px] flex-1">
            <Input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPageIndex(0);
              }}
              placeholder="Search templates"
              className="pr-10"
            />
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="relative">
            <Select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as 'all' | 'active' | 'archived');
                setPageIndex(0);
              }}
            >
              <option value="all">All statuses</option>
              <option value="active">Active only</option>
              <option value="archived">Archived</option>
            </Select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {error ? (
          <Alert variant="danger" className="mx-6 mt-4">
            {error}
          </Alert>
        ) : null}

        <div className="px-6 py-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.25em] text-slate-400 dark:bg-background dark:text-foreground/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-3">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-border">
                {loading ? (
                  [...Array(pageSize)].map((_, index) => (
                    <tr key={`skeleton-${index}`}>
                      <td className="px-4 py-4" colSpan={6}>
                        <div className="h-4 w-1/3 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                      </td>
                    </tr>
                  ))
                ) : templates.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() =>
                        navigate({ to: `/page-templates/${row.original.id}` })
                      }
                      className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-background/70"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-4 align-top">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-10 text-center" colSpan={6}>
                      <p className="text-sm font-semibold text-slate-600 dark:text-foreground/70">
                        No page templates found.
                      </p>
                      <HelperText className="mt-1">
                        Create your first page template to control page structure.
                      </HelperText>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 dark:border-border">
          <HelperText>
            Page {pageIndex + 1} of {totalPages} • {total} templates
          </HelperText>
          <div className="flex items-center gap-2">
            <Label>Per page</Label>
            <div className="relative">
              <Select
                value={String(pageSize)}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPageIndex(0);
                }}
                className="h-8 min-w-[88px] pr-8"
              >
                {[8, 12, 20].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
            <IconButton
              onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
              disabled={pageIndex === 0}
              aria-label="Previous page"
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </IconButton>
            <IconButton
              onClick={() =>
                setPageIndex((prev) =>
                  prev + 1 >= totalPages ? prev : prev + 1,
                )
              }
              disabled={pageIndex + 1 >= totalPages}
              aria-label="Next page"
              variant="outline"
              size="sm"
            >
              <ChevronRight className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete page template"
        description={
          deleteTarget?.isDefault
            ? 'This template is the current default. Deleting it will clear the default template setting. This action cannot be undone.'
            : 'Delete this page template? This action cannot be undone.'
        }
        confirmLabel={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        tone="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default PageTemplatesListPage;
