import { useEffect, useState } from 'react';
import { DashboardLayout } from '@dreamweaverstudio/client-ui';
import QuickActions from './QuickActions';
import RecentProjects from './RecentProjects';
import RenderPerformance from './RenderPerformance';
import RenderQueue from './RenderQueue';
import Stats from './Stats';
import UpcomingTasks from './UpcomingTasks';
import {
  fetchStudioSettings,
  fetchIntegrationSettings,
  fetchStripeBalance,
} from '@dreamweaverstudio/client-data-access-api';
import { onAuthChange, signOutUser } from '../../auth';
import { useNavigate } from '@tanstack/react-router';
import { formatCurrency, normalizeCurrency } from '../../utils/currency';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('DreamWeaver User');
  const [userEmail, setUserEmail] = useState('user@dreamweaver.studio');
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>();
  const [creditAlertThreshold, setCreditAlertThreshold] = useState<number | undefined>(
    200,
  );
  const [stripeDefaultCurrency, setStripeDefaultCurrency] = useState('USD');
  const [stripeBalanceAmount, setStripeBalanceAmount] = useState<number | null>(
    null,
  );
  const [stripeBalanceLoading, setStripeBalanceLoading] = useState(true);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [numberFormatLocale, setNumberFormatLocale] = useState('en-US');

  const handleLogout = async () => {
    await signOutUser();
    await navigate({ to: '/' });
  };

  useEffect(() => {
    document.title = 'Dashboard — DreamWeaverComics Studio';
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (!user) {
        return;
      }
      setUserName(user.displayName || user.email || 'DreamWeaver User');
      setUserEmail(user.email || 'user@dreamweaver.studio');
      setUserAvatarUrl(user.photoURL || undefined);
      setCreditsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const studio = await fetchStudioSettings();
        if (mounted) {
          setCreditAlertThreshold(studio.creditAlertThreshold ?? 200);
          setNumberFormatLocale(studio.numberFormatLocale ?? 'en-US');
        }
      } catch (err) {
        if (err instanceof Error && err.message === 'unauthorized') {
          await signOutUser();
          await navigate({ to: '/' });
        }
      } finally {
        if (mounted) setCreditsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    let mounted = true;
    const loadIntegrations = async () => {
      try {
        const settings = await fetchIntegrationSettings();
        if (mounted) {
          setStripeDefaultCurrency(
            normalizeCurrency(settings.stripe.defaultCurrency),
          );
        }
      } catch (err) {
        if (err instanceof Error && err.message === 'unauthorized') {
          await signOutUser();
          await navigate({ to: '/' });
        }
      }
    };
    loadIntegrations();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    let mounted = true;
    const loadStripeBalance = async () => {
      setStripeBalanceLoading(true);
      try {
        const balance = await fetchStripeBalance();
        if (!mounted || !balance.enabled || balance.available === undefined) {
          return;
        }
        setStripeBalanceAmount(balance.available);
      } catch (err) {
        // keep placeholder
      } finally {
        if (mounted) setStripeBalanceLoading(false);
      }
    };
    loadStripeBalance();
    return () => {
      mounted = false;
    };
  }, []);

  const stripeBalance =
    stripeBalanceAmount !== null
      ? formatCurrency(
          stripeBalanceAmount / 100,
          stripeDefaultCurrency,
          {},
          numberFormatLocale,
        )
      : '—';

  return (
    <DashboardLayout
      projectTitle="DreamWeaverComics Studio"
      credits={1240}
      creditsLoading={creditsLoading}
      creditAlertThreshold={creditAlertThreshold}
      numberLocale={numberFormatLocale}
      stripeBalance={stripeBalance}
      stripeBalanceLoading={stripeBalanceLoading}
      activeNav="analytics"
      onLogout={handleLogout}
      userName={userName}
      userEmail={userEmail}
      userAvatarUrl={userAvatarUrl}
    >
      <section className="grid gap-6 lg:grid-cols-[1.6fr_0.7fr]">
        <Stats currency={stripeDefaultCurrency} locale={numberFormatLocale} />
        <div className="grid gap-6">
          <UpcomingTasks currency={stripeDefaultCurrency} locale={numberFormatLocale} />
          <RenderQueue locale={numberFormatLocale} />
          <QuickActions currency={stripeDefaultCurrency} locale={numberFormatLocale} />
        </div>
      </section>

      <RenderPerformance locale={numberFormatLocale} />

      <RecentProjects currency={stripeDefaultCurrency} locale={numberFormatLocale} />
    </DashboardLayout>
  );
};

export default Dashboard;
