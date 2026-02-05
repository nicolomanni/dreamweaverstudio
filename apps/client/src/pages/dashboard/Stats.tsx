import {
  BookOpen,
  Coins,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/currency';

type StatsProps = {
  currency?: string;
  locale?: string;
  stripeBalanceAmount?: number | null;
  stripeBalanceLive?: boolean;
  stripeBalanceLoading?: boolean;
};

const Stats = ({
  currency = 'USD',
  locale = 'en-US',
  stripeBalanceAmount = null,
  stripeBalanceLive = false,
  stripeBalanceLoading = false,
}: StatsProps) => {
  const stripeValue =
    stripeBalanceLoading
      ? '—'
      : stripeBalanceAmount !== null
        ? formatCurrency(stripeBalanceAmount / 100, currency, {}, locale)
        : '—';

  const stripeDelta = stripeBalanceLive ? 'Live balance' : 'Not connected';

  const cards = [
    {
      label: 'Stripe balance',
      value: stripeValue,
      delta: stripeDelta,
      icon: Coins,
      tone: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200',
    },
    {
      label: 'Published comics',
      value: formatNumber(38, locale),
      delta: '+4 this month',
      icon: BookOpen,
      tone: 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-200',
    },
    {
      label: 'Active projects',
      value: formatNumber(7, locale),
      delta: '+2 in review',
      icon: Layers,
      tone:
        'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200',
    },
  ];
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
            Overview
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-foreground">
            Studio performance
          </h3>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-white dark:border-border dark:bg-background dark:text-foreground/70 dark:hover:bg-card/80"
        >
          Monthly
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-border dark:bg-background"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${card.tone}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                    {card.label}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-foreground">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-emerald-500">{card.delta}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 h-64 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-border dark:bg-background">
        <div className="h-full w-full rounded-2xl bg-[linear-gradient(120deg,rgba(34,211,238,0.18),rgba(124,92,255,0.12))]" />
      </div>
    </section>
  );
};

export default Stats;
