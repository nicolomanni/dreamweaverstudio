const UpcomingTasks = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-foreground">
          Sales target
        </h3>
        <span className="text-xs font-semibold text-slate-500 dark:text-foreground/60">
          Monthly
        </span>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-slate-200 text-sm font-semibold text-slate-700 dark:border-border dark:text-foreground">
          75%
          <span className="absolute inset-1 rounded-full border-4 border-primary/40" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-slate-900 dark:text-foreground">
            $58.4k
          </p>
          <p className="text-xs text-slate-500 dark:text-foreground/60">
            Target $78k • +12% this month
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpcomingTasks;
