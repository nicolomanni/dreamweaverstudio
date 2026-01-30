import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightDots } from '@fortawesome/free-solid-svg-icons';

const RenderPerformance = () => {
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
            Render Performance
          </p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">
            Weekly Output
          </h3>
        </div>
        <span className="flex items-center gap-2 text-xs text-foreground/60">
          <FontAwesomeIcon icon={faArrowUpRightDots} />
          +12% vs last week
        </span>
      </div>
      <div className="mt-6 h-48 rounded-2xl border border-border bg-background/60">
        <div className="h-full w-full rounded-2xl bg-[linear-gradient(120deg,rgba(6,182,212,0.15),rgba(139,92,246,0.05))]" />
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-foreground/60">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <span
            key={day}
            className="rounded-full border border-border bg-background/70 px-3 py-1"
          >
            {day}
          </span>
        ))}
      </div>
    </div>
  );
};

export default RenderPerformance;
