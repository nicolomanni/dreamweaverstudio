import { DashboardLayout } from '@dreamweaverstudio/client-ui';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLayerGroup,
  faWandMagicSparkles,
  faCoins,
  faArrowUpRightDots,
  faClock,
  faCirclePlay,
  faFileExport,
} from '@fortawesome/free-solid-svg-icons';

export function Dashboard() {
  const isLoading = false;
  const projectRows = [
    {
      name: 'Neon City Chronicles',
      status: 'In Progress',
      panels: 28,
      updated: '2h ago',
    },
    {
      name: 'Glass District Noir',
      status: 'Review',
      panels: 12,
      updated: 'Yesterday',
    },
    {
      name: 'Aetherline Prologue',
      status: 'Draft',
      panels: 6,
      updated: '3 days ago',
    },
  ];

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

  return (
    <DashboardLayout
      projectTitle="Neon City Chronicles"
      credits={420}
      activeNav="projects"
    >
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
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
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card/80 via-background/80 to-card/60 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-foreground/60">
            Quick Actions
          </p>
          <div className="mt-4 space-y-3">
            {[
              { title: 'Generate Panels', detail: 'Launch batch render' },
              { title: 'Refine Prompts', detail: 'Adjust tone + lighting' },
              { title: 'Export PDF', detail: 'Prepare for review' },
            ].map((action) => (
              <button
                key={action.title}
                type="button"
                className="flex w-full flex-col items-start gap-1 rounded-xl border border-border bg-background/70 px-4 py-3 text-left transition-colors duration-200 hover:bg-card"
              >
                <span className="text-sm font-semibold text-foreground">
                  {action.title}
                </span>
                <span className="text-xs text-foreground/60">
                  {action.detail}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

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

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
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
        <div className="rounded-2xl border border-border bg-card/80 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
                Upcoming Tasks
              </p>
              <h3 className="mt-2 text-lg font-semibold text-foreground">
                Today
              </h3>
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
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-border bg-card/80 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
                Recent Activity
              </p>
              <h3 className="mt-2 text-lg font-semibold text-foreground">
                Studio Timeline
              </h3>
            </div>
            <span className="text-xs text-foreground/60">Last 24h</span>
          </div>
          <div className="mt-6 space-y-4">
            {(isLoading
              ? Array.from({ length: 4 }, (_, index) => ({
                  item: `Loading activity ${index + 1}`,
                  time: '',
                }))
              : [
                  {
                    item: 'Generated 4 panels for “Rain District Alley”.',
                    time: '1h ago',
                  },
                  {
                    item: 'Uploaded 3 concept references to Gallery.',
                    time: '2h ago',
                  },
                  {
                    item: 'Refined lighting prompts for Scene 02.',
                    time: '3h ago',
                  },
                  {
                    item: 'Exported storyboard draft to PDF.',
                    time: '4h ago',
                  },
                ]
            ).map((entry, index) => (
              <div
                key={`${entry.item}-${index}`}
                className="flex items-start gap-3 rounded-xl border border-border bg-background/60 px-4 py-3"
              >
                <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1">
                  {isLoading ? (
                    <>
                      <div className="h-4 w-3/4 animate-pulse rounded-full bg-border" />
                      <div className="mt-2 h-3 w-1/3 animate-pulse rounded-full bg-border" />
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-foreground/80">
                        {entry.item}
                      </p>
                      <p className="text-xs text-foreground/50">
                        {entry.time}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card/80 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
            Render Queue
          </p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">
            Current Jobs
          </h3>
          <div className="mt-5 space-y-4">
            {(isLoading
              ? [
                  { title: 'Loading job', progress: '60%' },
                  { title: 'Loading job', progress: '40%' },
                  { title: 'Loading job', progress: '20%' },
                ]
              : [
                  { title: 'Panel 12 · Neon Alley', progress: '80%' },
                  { title: 'Panel 13 · Rain Cut', progress: '45%' },
                  { title: 'Cover Draft · Alt B', progress: '15%' },
                ]
            ).map((job, index) => (
              <div key={`${job.title}-${index}`} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  {isLoading ? (
                    <div className="h-4 w-2/3 animate-pulse rounded-full bg-border" />
                  ) : (
                    <span className="text-foreground/80">{job.title}</span>
                  )}
                  {isLoading ? (
                    <div className="h-3 w-10 animate-pulse rounded-full bg-border" />
                  ) : (
                    <span className="text-xs text-foreground/50">
                      {job.progress}
                    </span>
                  )}
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: job.progress }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card/80 p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
              Recent Projects
            </p>
            <h3 className="mt-2 text-lg font-semibold text-foreground">
              Latest Activity
            </h3>
          </div>
          <button
            type="button"
            className="rounded-full border border-border bg-background/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-foreground/70 transition-colors duration-200 hover:bg-card"
          >
            View all
          </button>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[680px] w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.25em] text-foreground/50">
              <tr>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Panels</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {projectRows.map((row) => (
                <tr
                  key={row.name}
                  className="transition-colors hover:bg-background/60"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl border border-border bg-gradient-to-br from-primary/30 via-background to-secondary/30" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {row.name}
                        </p>
                        <p className="text-xs text-foreground/50">
                          3 scenes · 2 characters
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-foreground/70">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-foreground/70">
                    {row.panels}
                  </td>
                  <td className="px-4 py-4 text-foreground/70">
                    {row.updated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          { title: 'Neo Tokyo Alley', status: 'Concept', date: 'Today' },
          { title: 'Rain District Glow', status: 'Storyboard', date: '2d ago' },
          { title: 'Crimson Signal', status: 'Render', date: '4d ago' },
        ].map((asset) => (
          <div
            key={asset.title}
            className="rounded-2xl border border-border bg-card/80 p-4 shadow-lg"
          >
            <div className="h-36 rounded-xl border border-border bg-[linear-gradient(135deg,rgba(6,182,212,0.2),rgba(15,23,42,0.2))]" />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {asset.title}
                </p>
                <p className="text-xs text-foreground/50">{asset.status}</p>
              </div>
              <span className="text-xs text-foreground/50">{asset.date}</span>
            </div>
          </div>
        ))}
      </section>
    </DashboardLayout>
  );
}

export default Dashboard;
