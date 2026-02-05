import { useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrencyCompact } from '../../utils/currency';

type RecentProjectsProps = {
  currency?: string;
  locale?: string;
};

type RecentProjectRow = {
  name: string;
  status: string;
  panels: number;
  revenue: number;
};

const RecentProjects = ({ currency = 'USD', locale = 'en-US' }: RecentProjectsProps) => {
  const projectRows = useMemo<RecentProjectRow[]>(
    () => [
      {
        name: 'Neon City Chronicles',
        status: 'Published',
        panels: 28,
        revenue: 4200,
      },
      {
        name: 'Glass District Noir',
        status: 'Review',
        panels: 12,
        revenue: 2100,
      },
      {
        name: 'Aetherline Prologue',
        status: 'Production',
        panels: 6,
        revenue: 640,
      },
    ],
    [],
  );

  const columns = useMemo<ColumnDef<RecentProjectRow>[]>(
    () => [
      {
        header: 'Order',
        accessorKey: 'name',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 dark:border-border dark:bg-background" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
                  {row.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-foreground/50">
                  Order #DW-00{row.panels}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: (info) => (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 dark:border-border dark:bg-background dark:text-foreground/70">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        header: 'Date',
        accessorKey: 'date',
        cell: () => (
          <span className="text-slate-600 dark:text-foreground/70">09/02/2026</span>
        ),
      },
      {
        header: 'Customer',
        accessorKey: 'customer',
        cell: (info) => {
          const row = info.row.original;
          return (
            <span className="text-slate-600 dark:text-foreground/70">
              {row.name.split(' ')[0]} Studio
            </span>
          );
        },
      },
      {
        header: () => <span className="block text-right">Amount</span>,
        accessorKey: 'revenue',
        cell: (info) => (
          <span className="block text-right text-slate-600 dark:text-foreground/70">
            {formatCurrencyCompact(info.getValue() as number, currency, locale)}
          </span>
        ),
      },
    ],
    [currency, locale],
  );

  const table = useReactTable({
    data: projectRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });
  return (
    <section className="dw-card dw-card-body">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
            Recent orders
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-foreground">
            Client billing activity
          </h3>
        </div>
        <button
          type="button"
          className="dw-btn dw-btn-sm dw-btn-outline"
        >
          View all
        </button>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-border">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="transition-colors hover:bg-slate-50 dark:hover:bg-background/70"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-foreground/60">
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <div className="flex items-center gap-2">
          <label className="dw-label">
            Per page
          </label>
          <div className="relative">
            <select
              value={table.getState().pagination.pageSize}
              onChange={(event) => table.setPageSize(Number(event.target.value))}
              className="dw-select dw-select-sm"
            >
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
          </div>
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="dw-btn-icon dw-btn-icon-sm dw-btn-icon-outline"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="dw-btn-icon dw-btn-icon-sm dw-btn-icon-outline"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecentProjects;
