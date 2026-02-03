const QuickActions = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-foreground/60">
        Quick Actions
      </p>
      <div className="mt-4 space-y-3">
        {[
          { title: 'Generate Panels', detail: 'Launch batch render' },
          { title: 'Refine Prompts', detail: 'Adjust tone + lighting' },
          { title: 'Export PDF', detail: 'Prepare for review' },
        ].map((action) => (
          <button
            key={action.title}
            type="button"
            className="flex w-full flex-col items-start gap-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-colors duration-200 hover:bg-white dark:border-border dark:bg-background dark:hover:bg-card/80"
          >
            <span className="text-sm font-semibold text-slate-900 dark:text-foreground">
              {action.title}
            </span>
            <span className="text-xs text-slate-500 dark:text-foreground/60">
              {action.detail}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
