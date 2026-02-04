import { useEffect, useState } from 'react';
import {
  BookOpen,
  Coins,
  Layers,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { fetchStripeBalance } from '@dreamweaverstudio/client-data-access-api';

const stats = [
  {
    label: 'Stripe balance',
    value: '$42,180',
    delta: '+12% vs last month',
    icon: Coins,
    tone: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200',
  },
  {
    label: 'Published comics',
    value: '38',
    delta: '+4 this month',
    icon: BookOpen,
    tone: 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-200',
  },
  {
    label: 'Active projects',
    value: '7',
    delta: '+2 in review',
    icon: Layers,
    tone:
      'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200',
  },
  {
    label: 'Render success rate',
    value: '97.4%',
    delta: '+1.2% vs last month',
    icon: Sparkles,
    tone: 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-200',
  },
];

const Stats = () => {
  const [stripeValue, setStripeValue] = useState(stats[0].value);
  const [stripeDelta, setStripeDelta] = useState(stats[0].delta);

  useEffect(() => {
    let mounted = true;
    const loadBalance = async () => {
      try {
        const balance = await fetchStripeBalance();
        if (!mounted || !balance.enabled || balance.available === undefined) {
          return;
        }
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: balance.currency ?? 'USD',
        }).format(balance.available / 100);
        setStripeValue(formatted);
        setStripeDelta('Live balance');
      } catch (err) {
        // keep placeholder values
      }
    };
    loadBalance();
    return () => {
      mounted = false;
    };
  }, []);

  const cards = [
    { ...stats[0], value: stripeValue, delta: stripeDelta },
    stats[1],
    stats[2],
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
