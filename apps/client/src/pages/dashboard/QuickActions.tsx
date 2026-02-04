import { formatCurrencyCompact } from '../../utils/currency';

type QuickActionsProps = {
  currency?: string;
  locale?: string;
};

const QuickActions = ({ currency = 'USD', locale = 'en-US' }: QuickActionsProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
            Channel revenue
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-foreground">
            Distribution split
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-foreground/60">
          Monthly
        </span>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Direct sales', amount: 9200 },
          { label: 'Marketplace', amount: 6400 },
          { label: 'Licensing', amount: 4800 },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-border dark:bg-background"
          >
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
              {item.label}
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-foreground">
              {formatCurrencyCompact(item.amount, currency, locale)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
