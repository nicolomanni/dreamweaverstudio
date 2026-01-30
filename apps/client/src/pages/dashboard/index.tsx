import { DashboardLayout } from '@dreamweaverstudio/client-ui';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import RecentProjects from './RecentProjects';
import RenderPerformance from './RenderPerformance';
import RenderQueue from './RenderQueue';
import Stats from './Stats';
import UpcomingTasks from './UpcomingTasks';
import Welcome from './Welcome';

const Dashboard = () => {
  return (
    <DashboardLayout
      projectTitle="Neon City Chronicles"
      credits={420}
      activeNav="projects"
    >
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <Welcome />
        <QuickActions />
      </section>

      <Stats />

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <RenderPerformance />
        <UpcomingTasks />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <RecentActivity />
        <RenderQueue />
      </section>

      <RecentProjects />
    </DashboardLayout>
  );
};

export default Dashboard;
