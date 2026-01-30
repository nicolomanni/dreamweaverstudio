import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLayerGroup,
  faWandMagicSparkles,
  faCoins,
  faFileExport,
} from '@fortawesome/free-solid-svg-icons';

const stats = [
  {
    label: 'Panels Ready',
    value: '128',
    delta: '+12%',
    icon: faLayerGroup,
  },
  {
    label: 'Renders Today',
    value: '36',
    delta: '+9%',
    icon: faWandMagicSparkles,
  },
  {
    label: 'Credits Used',
    value: '1,240',
    delta: '-4%',
    icon: faCoins,
  },
  {
    label: 'Exports',
    value: '22',
    delta: '+3%',
    icon: faFileExport,
  },
];

const Stats = () => {
  const isLoading = false;
  return (
    <section className="grid gap-6 lg:grid-cols-4">
      {stats.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-border bg-card/80 p-5 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
              {card.label}
            </p>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/70 text-primary">
              <FontAwesomeIcon icon={card.icon} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded-full bg-border" />
            ) : (
              <span className="text-3xl font-semibold text-foreground">
                {card.value}
              </span>
            )}
            {isLoading ? (
              <div className="h-4 w-10 animate-pulse rounded-full bg-border" />
            ) : (
              <span className="text-xs font-semibold text-primary">
                {card.delta}
              </span>
            )}
          </div>
        </div>
      ))}
    </section>
  );
};

export default Stats;
