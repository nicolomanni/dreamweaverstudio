import { useState } from 'react';

const RenderPerformance = () => {
  const [active, setActive] = useState<'all' | 'campaign' | 'email'>('all');
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-foreground">
          Ads performance
        </h3>
        <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1 text-xs font-semibold text-slate-600 dark:bg-background dark:text-foreground/70">
          {[
            { id: 'all', label: 'All' },
            { id: 'campaign', label: 'Campaign' },
            { id: 'email', label: 'Email' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id as typeof active)}
              className={`rounded-full px-3 py-1 ${
                active === tab.id
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-card dark:text-foreground'
                  : 'text-slate-500 dark:text-foreground/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 h-64 rounded-2xl border border-slate-200 bg-slate-50 dark:border-border dark:bg-background">
        <div className="h-full w-full rounded-2xl bg-[linear-gradient(120deg,rgba(34,211,238,0.12),rgba(124,92,255,0.08))]" />
      </div>
    </div>
  );
};

export default RenderPerformance;
