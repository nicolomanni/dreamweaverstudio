import { useEffect } from 'react';
import QuickActions from './QuickActions';
import RecentProjects from './RecentProjects';
import RenderPerformance from './RenderPerformance';
import RenderQueue from './RenderQueue';
import Stats from './Stats';
import UpcomingTasks from './UpcomingTasks';
import { useStudioContext } from '../../context/StudioContext';

const Dashboard = () => {
  useEffect(() => {
    document.title = 'Dashboard — DreamWeaverComics Studio';
  }, []);

  const {
    numberFormatLocale,
    stripeDefaultCurrency,
    stripeBalanceAmount,
    stripeBalanceLive,
    stripeBalanceLoading,
  } = useStudioContext();

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[1.6fr_0.7fr]">
        <Stats
          currency={stripeDefaultCurrency}
          locale={numberFormatLocale}
          stripeBalanceAmount={stripeBalanceAmount}
          stripeBalanceLive={stripeBalanceLive}
          stripeBalanceLoading={stripeBalanceLoading}
        />
        <div className="grid gap-6">
          <UpcomingTasks currency={stripeDefaultCurrency} locale={numberFormatLocale} />
          <RenderQueue locale={numberFormatLocale} />
          <QuickActions currency={stripeDefaultCurrency} locale={numberFormatLocale} />
        </div>
      </section>

      <RenderPerformance locale={numberFormatLocale} />

      <RecentProjects currency={stripeDefaultCurrency} locale={numberFormatLocale} />
    </>
  );
};

export default Dashboard;
