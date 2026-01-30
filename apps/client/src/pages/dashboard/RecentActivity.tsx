const RecentActivity = () => {
  const isLoading = false;
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
            Recent Activity
          </p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">
            Studio Timeline
          </h3>
        </div>
        <span className="text-xs text-foreground/60">Last 24h</span>
      </div>
      <div className="mt-6 space-y-4">
        {(isLoading
          ? Array.from({ length: 4 }, (_, index) => ({
              item: `Loading activity ${index + 1}`,
              time: '',
            }))
          : [
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
            ]
        ).map((entry, index) => (
          <div
            key={`${entry.item}-${index}`}
            className="flex items-start gap-3 rounded-xl border border-border bg-background/60 px-4 py-3"
          >
            <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
            <div className="flex-1">
              {isLoading ? (
                <>
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-border" />
                  <div className="mt-2 h-3 w-1/3 animate-pulse rounded-full bg-border" />
                </>
              ) : (
                <>
                  <p className="text-sm text-foreground/80">{entry.item}</p>
                  <p className="text-xs text-foreground/50">{entry.time}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
