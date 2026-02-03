const scores = [
  { label: 'Lead Volume', value: 78, tone: 'bg-emerald-500' },
  { label: 'Conversion Rate', value: 57, tone: 'bg-amber-500' },
  { label: 'Cost per Lead', value: 32, tone: 'bg-rose-500' },
  { label: 'Engagement', value: 66, tone: 'bg-sky-500' },
];

const UpcomingTasks = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-foreground">
        Lead performance score
      </h3>
      <div className="mt-6 flex items-center justify-center">
        <div className="h-40 w-40 rounded-full border border-dashed border-slate-200 bg-slate-50 dark:border-border dark:bg-background" />
      </div>
      <div className="mt-6 space-y-4">
        {scores.map((score) => (
          <div key={score.label} className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-xs font-semibold text-slate-600 dark:border-border dark:text-foreground/70">
              {score.label[0]}
            </span>
            <div className="flex-1">
              <p className="text-sm text-slate-600 dark:text-foreground/70">
                {score.label}
              </p>
              <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-background">
                <div
                  className={`h-2 rounded-full ${score.tone}`}
                  style={{ width: `${score.value}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-foreground">
              {score.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingTasks;
