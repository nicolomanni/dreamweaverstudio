const RecentActivity = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
            Recent Activity
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-foreground">
            Studio Timeline
          </h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-foreground/60">
          Last 24h
        </span>
      </div>
      <div className="mt-6 space-y-4">
        {[
          {
            item: 'Generated 4 panels for “Rain District Alley”.',
            time: '1h ago',
          },
          {
            item: 'Uploaded 3 concept references to Gallery.',
            time: '2h ago',
          },
          {
            item: 'Refined lighting prompts for Scene 02.',
            time: '3h ago',
          },
          {
            item: 'Exported storyboard draft to PDF.',
            time: '4h ago',
          },
        ].map((entry, index) => (
          <div
            key={`${entry.item}-${index}`}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-border dark:bg-background"
          >
            <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
            <div className="flex-1">
              <p className="text-sm text-slate-700 dark:text-foreground/80">
                {entry.item}
              </p>
              <p className="text-xs text-slate-500 dark:text-foreground/50">
                {entry.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
