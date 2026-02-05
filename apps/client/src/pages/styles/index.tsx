import { useEffect, useMemo, useState } from 'react';
import {
  fetchStyles,
  deleteStyle,
} from '@dreamweaverstudio/client-data-access-api';
import type { ComicStyle } from '@dreamweaverstudio/shared-types';
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
  Plus,
  Search,
  PencilLine,
  Trash2,
  XCircle,
} from 'lucide-react';
import { ConfirmDialog } from '../../components/ConfirmDialog';

const StylesListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(8);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>(
    'all',
  );
  const [deleteTarget, setDeleteTarget] = useState<ComicStyle | null>(null);

  const handleUnauthorized = async (err: unknown) => {
    if (err instanceof Error && err.message === 'unauthorized') {
      await signOutUser();
      await navigate({ to: '/' });
      return true;
    }
    return false;
  };

  useEffect(() => {
    document.title = 'Styles — DreamWeaverComics Studio';
  }, []);

  const stylesQuery = useQuery({
    queryKey: ['styles', { pageIndex, pageSize, search, statusFilter }],
    queryFn: () =>
      fetchStyles({
        page: pageIndex + 1,
        pageSize,
        q: search.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      }),
    placeholderData: (prev) =>
      prev ?? { data: [], total: 0, page: pageIndex + 1, pageSize },
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (stylesQuery.error) {
      void handleUnauthorized(stylesQuery.error);
    }
  }, [stylesQuery.error]);

  const columns = useMemo<ColumnDef<ComicStyle>[]>(
    () => [
      {
        header: 'Style',
        accessorKey: 'name',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:border-border dark:bg-background dark:text-foreground/50">
                {row.previewImageUrl ? (
                  <img
                    src={row.previewImageUrl}
                    alt={row.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  'DW'
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
                  {row.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-foreground/60">
                  {row.description || row.key || 'No description'}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: (info) => {
          const value = info.getValue() as ComicStyle['status'];
          const isArchived = value === 'archived';
          return (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] ${
                isArchived
                  ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
              }`}
            >
              {isArchived ? (
                <XCircle className="h-3.5 w-3.5" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              {isArchived ? 'Archived' : 'Active'}
            </span>
          );
        },
      },
      {
        header: 'Default',
        accessorKey: 'isDefault',
        cell: (info) => {
          const value = info.getValue() as boolean | undefined;
          return value ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
              Default
            </span>
          ) : (
            <span className="text-xs text-slate-400 dark:text-foreground/50">
              —
            </span>
          );
        },
      },
      {
        header: 'Updated',
        accessorKey: 'updatedAt',
        cell: (info) => {
          const value = info.getValue() as string | undefined;
          return (
            <span className="text-xs text-slate-500 dark:text-foreground/60">
              {value ? new Date(value).toLocaleDateString() : '—'}
            </span>
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
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  navigate({ to: `/styles/${row.id}` });
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 dark:border-border dark:bg-card dark:text-foreground/70"
                aria-label="Edit style"
              >
                <PencilLine className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setDeleteTarget(row);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
                aria-label="Delete style"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [navigate],
  );

  const styles = stylesQuery.data?.data ?? [];
  const total = stylesQuery.data?.total ?? 0;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStyle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['styles'] });
    },
    onError: async (err) => {
      await handleUnauthorized(err);
    },
  });

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  const table = useReactTable({
    data: styles,
    columns,
    pageCount: Math.ceil(total / pageSize),
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const loading = stylesQuery.isLoading;
  const error = stylesQuery.isError ? 'Unable to load styles.' : null;
  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-border">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
              Catalog
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-foreground">
              Comic styles
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-foreground/60">
              Manage visual style presets used across your comics.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: '/styles/new' })}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New style
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-6 py-4 dark:border-border">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPageIndex(0);
              }}
              placeholder="Search styles"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 pr-10 text-sm text-slate-700 focus:border-primary focus:outline-none dark:border-border dark:bg-background dark:text-foreground"
            />
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as 'all' | 'active' | 'archived');
                setPageIndex(0);
              }}
              className="peer h-10 appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 pr-10 text-sm text-slate-700 focus:border-primary focus:outline-none dark:border-border dark:bg-background dark:text-foreground"
            >
              <option value="all">All statuses</option>
              <option value="active">Active only</option>
              <option value="archived">Archived</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {error ? (
          <div className="mx-6 mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
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
                    <td className="px-4 py-4" colSpan={5}>
                        <div className="h-4 w-1/3 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                      </td>
                    </tr>
                  ))
                ) : styles.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() =>
                        navigate({ to: `/styles/${row.original.id}` })
                      }
                      className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-background/70"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-4">
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
                    <td
                      className="px-4 py-8 text-center text-sm text-slate-500 dark:text-foreground/60"
                    colSpan={5}
                    >
                      No styles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 text-xs text-slate-500 dark:border-border dark:text-foreground/60">
          <span>
            Page {pageIndex + 1} of {totalPages} • {total} styles
          </span>
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
              Per page
            </label>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPageIndex(0);
                }}
                className="peer h-8 appearance-none rounded-full border border-slate-200 bg-slate-50 px-3 py-1 pr-8 text-xs text-slate-700 focus:border-primary focus:outline-none dark:border-border dark:bg-background dark:text-foreground"
              >
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={20}>20</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
            </div>
            <button
              type="button"
              onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
              disabled={pageIndex === 0}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-border dark:bg-card dark:text-foreground/70"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                setPageIndex((prev) => Math.min(prev + 1, totalPages - 1))
              }
              disabled={pageIndex >= totalPages - 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-border dark:bg-card dark:text-foreground/70"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete style"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.name}"? This action cannot be undone.`
            : 'Delete this style? This action cannot be undone.'
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default StylesListPage;
