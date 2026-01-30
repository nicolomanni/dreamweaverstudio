import { faClock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const UpcomingTasks = () => {
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
            Upcoming Tasks
          </p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">Today</h3>
        </div>
        <span className="text-xs text-foreground/60">3 items</span>
      </div>
      <div className="mt-5 space-y-3">
        {[
          'Review panel continuity',
          'Upload character sheet',
          'Send draft to editor',
        ].map((task) => (
          <div
            key={task}
            className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground/80"
          >
            <span>{task}</span>
            <FontAwesomeIcon icon={faClock} className="text-primary" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingTasks;
