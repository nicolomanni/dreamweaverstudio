import { PlayCircle } from 'lucide-react';

const Welcome = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-foreground/60">
            Welcome Back
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-foreground">
            Neon City Chronicles
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-foreground/70">
            AI render flow is stable. Next scene queued for ink pass and
            lighting refinement.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black shadow-sm transition-colors duration-200 hover:bg-primary/90">
          <PlayCircle className="h-4 w-4" />
          Preview
        </button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          { label: 'Draft Panels', value: '12', delta: '+2' },
          { label: 'Queued Renders', value: '4', delta: '+1' },
          { label: 'Scenes', value: '3', delta: '+1' },
          { label: 'Characters', value: '8', delta: '+3' },
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
