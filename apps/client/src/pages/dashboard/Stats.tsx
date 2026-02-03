import {
  Coins,
  LineChart,
  TrendingUp,
  Users,
} from 'lucide-react';

const stats = [
  {
    label: 'Total marketing spend',
    value: '$192,817',
    delta: '+5.3%',
    icon: Coins,
    tone: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200',
  },
  {
    label: 'ROI',
    value: '270%',
    delta: '+8.1%',
    icon: LineChart,
    tone: 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-200',
  },
  {
    label: 'Conversion rates',
    value: '4.5%',
    delta: '+0.9%',
    icon: TrendingUp,
    tone:
      'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200',
  },
  {
    label: 'Total leads',
    value: '1,289',
    delta: '+16.2%',
    icon: Users,
    tone: 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-200',
  },
];

const Stats = () => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-foreground">
          Kpi summary
        </h3>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((card, index) => {
          const Icon = card.icon;
          return (
          <div
            key={card.label}
            className={`flex flex-col gap-4 ${
              index < 3
                ? 'border-b border-slate-200 pb-6 md:border-b-0 md:border-r md:pr-6 dark:border-border'
                : ''
            }`}
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-full ${card.tone}`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-slate-500 dark:text-foreground/60">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-foreground">
                {card.value}
              </p>
              <p className="mt-1 text-sm text-emerald-500">{card.delta}</p>
            </div>
          </div>
        );
        })}
      </div>
    </section>
  );
};

export default Stats;
