const RenderQueue = () => {
  const isLoading = false;
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
        Render Queue
      </p>
      <h3 className="mt-2 text-lg font-semibold text-foreground">
        Current Jobs
      </h3>
      <div className="mt-5 space-y-4">
        {(isLoading
          ? [
              { title: 'Loading job', progress: '60%' },
              { title: 'Loading job', progress: '40%' },
              { title: 'Loading job', progress: '20%' },
            ]
          : [
              { title: 'Panel 12 · Neon Alley', progress: '80%' },
              { title: 'Panel 13 · Rain Cut', progress: '45%' },
              { title: 'Cover Draft · Alt B', progress: '15%' },
            ]
        ).map((job, index) => (
          <div key={`${job.title}-${index}`} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              {isLoading ? (
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-border" />
              ) : (
                <span className="text-foreground/80">{job.title}</span>
              )}
              {isLoading ? (
                <div className="h-3 w-10 animate-pulse rounded-full bg-border" />
              ) : (
                <span className="text-xs text-foreground/50">
                  {job.progress}
                </span>
              )}
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-border">
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
