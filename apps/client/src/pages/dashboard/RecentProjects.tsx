const RecentProjects = () => {
  const projectRows = [
    {
      name: 'Neon City Chronicles',
      status: 'In Progress',
      panels: 28,
      updated: '2h ago',
    },
    {
      name: 'Glass District Noir',
      status: 'Review',
      panels: 12,
      updated: 'Yesterday',
    },
    {
      name: 'Aetherline Prologue',
      status: 'Draft',
      panels: 6,
      updated: '3 days ago',
    },
  ];
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
            Recent Projects
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-foreground">
            Latest Activity
          </h3>
        </div>
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 transition-colors duration-200 hover:bg-white dark:border-border dark:bg-background dark:text-foreground/70 dark:hover:bg-card/80"
        >
          View all
        </button>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-[680px] w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
            <tr>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Panels</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-border">
            {projectRows.map((row) => (
              <tr
                key={row.name}
                className="transition-colors hover:bg-slate-50 dark:hover:bg-background/70"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 dark:border-border dark:bg-background" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
                        {row.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-foreground/50">
                        3 scenes · 2 characters
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 dark:border-border dark:bg-background dark:text-foreground/70">
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-600 dark:text-foreground/70">
                  {row.panels}
                </td>
                <td className="px-4 py-4 text-slate-600 dark:text-foreground/70">
                  {row.updated}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default RecentProjects;
