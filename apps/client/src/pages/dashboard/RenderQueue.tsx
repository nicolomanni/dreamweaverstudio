const RenderQueue = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
        Campaign performance
      </p>
      <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-foreground">
        Current Jobs
      </h3>
      <div className="mt-5 space-y-4">
        {[
          { title: 'Panel 12 · Neon Alley', progress: '80%' },
          { title: 'Panel 13 · Rain Cut', progress: '45%' },
          { title: 'Cover Draft · Alt B', progress: '15%' },
        ].map((job, index) => (
          <div key={`${job.title}-${index}`} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-700 dark:text-foreground/80">
                {job.title}
              </span>
              <span className="text-xs text-slate-500 dark:text-foreground/50">
                {job.progress}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-background">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: job.progress }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RenderQueue;
