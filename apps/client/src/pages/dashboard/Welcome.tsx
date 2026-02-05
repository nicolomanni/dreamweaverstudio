import { PlayCircle } from 'lucide-react';

const Welcome = () => {
  return (
    <div className="dw-card dw-card-body">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-foreground/60">
            Studio Overview
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-foreground">
            DreamWeaverComics
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-foreground/70">
            Production is on track. New client briefs are approved and the
            next release window is ready for QA.
          </p>
        </div>
        <button className="dw-btn dw-btn-md dw-btn-primary shadow-sm">
          <PlayCircle className="h-4 w-4" />
          Studio HQ
        </button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          { label: 'Active briefs', value: '9', delta: '+2' },
          { label: 'Panels rendered today', value: '42', delta: '+6' },
          { label: 'Comics in review', value: '5', delta: '+1' },
          { label: 'Avg turnaround', value: '2.6d', delta: '-0.4d' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-border dark:bg-background"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
              {stat.label}
            </p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-xl font-semibold text-slate-900 dark:text-foreground">
                {stat.value}
              </p>
              <span className="text-xs text-emerald-500">{stat.delta}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Welcome;
