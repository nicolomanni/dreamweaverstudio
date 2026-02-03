import { useEffect, useState } from 'react';
import { DashboardLayout } from '@dreamweaverstudio/client-ui';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import RecentProjects from './RecentProjects';
import RenderPerformance from './RenderPerformance';
import RenderQueue from './RenderQueue';
import Stats from './Stats';
import UpcomingTasks from './UpcomingTasks';
import Welcome from './Welcome';
import { onAuthChange, signOutUser } from '../../auth';
import { useNavigate } from '@tanstack/react-router';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('DreamWeaver User');
  const [userEmail, setUserEmail] = useState('user@dreamweaver.studio');
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>();

  const handleLogout = async () => {
    await signOutUser();
    await navigate({ to: '/' });
  };

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (!user) {
        return;
      }
      setUserName(user.displayName || user.email || 'DreamWeaver User');
      setUserEmail(user.email || 'user@dreamweaver.studio');
      setUserAvatarUrl(user.photoURL || undefined);
    });
    return () => unsubscribe();
  }, []);

  return (
    <DashboardLayout
      projectTitle="Neon City Chronicles"
      credits={420}
      activeNav="projects"
      onLogout={handleLogout}
      userName={userName}
      userEmail={userEmail}
      userAvatarUrl={userAvatarUrl}
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
