import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlay } from '@fortawesome/free-solid-svg-icons';

const Welcome = () => {
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-xl backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-foreground/60">
            Welcome Back
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-foreground">
            Neon City Chronicles
          </h2>
          <p className="mt-2 text-sm text-foreground/70">
            AI render flow is stable. Next scene queued for ink pass and
            lighting refinement.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black shadow-lg shadow-primary/30 transition-colors duration-200 hover:bg-primary/90">
          <FontAwesomeIcon icon={faCirclePlay} />
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
            className="rounded-xl border border-border bg-background/60 px-4 py-3"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
              {stat.label}
            </p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-xl font-semibold text-foreground">
                {stat.value}
              </p>
              <span className="text-xs text-primary">{stat.delta}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Welcome;
