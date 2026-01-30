const QuickActions = () => {
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-card/80 via-background/80 to-card/60 p-6">
      <p className="text-xs uppercase tracking-[0.4em] text-foreground/60">
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
            className="flex w-full flex-col items-start gap-1 rounded-xl border border-border bg-background/70 px-4 py-3 text-left transition-colors duration-200 hover:bg-card"
          >
            <span className="text-sm font-semibold text-foreground">
              {action.title}
            </span>
            <span className="text-xs text-foreground/60">{action.detail}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
