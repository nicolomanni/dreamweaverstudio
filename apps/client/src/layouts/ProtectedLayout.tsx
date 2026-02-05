import { useEffect, useMemo, useRef } from 'react';
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@dreamweaverstudio/client-ui';
import {
  fetchIntegrationSettings,
  fetchStripeBalance,
  fetchStudioSettings,
} from '@dreamweaverstudio/client-data-access-api';
import { signOutUser } from '../auth';
import { useAuthUser } from '../hooks/useAuthUser';
import { formatCurrency, normalizeCurrency } from '../utils/currency';
import { StudioProvider } from '../context/StudioContext';

const resolveActiveNav = (pathname: string) => {
  if (pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/styles')) return 'styles';
  if (pathname.startsWith('/dashboard')) return 'analytics';
  return 'analytics';
};

const selectPathname = (state: { location: { pathname: string } }) =>
  state.location.pathname;

const ProtectedLayout = () => {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: selectPathname });
  const activeNav = resolveActiveNav(pathname);
  const { user } = useAuthUser();
  const hasForcedLogout = useRef(false);

  const userName = user?.displayName || user?.email || 'DreamWeaver User';
  const userEmail = user?.email || 'user@dreamweaver.studio';
  const userAvatarUrl = user?.photoURL || undefined;

  const handleLogout = async () => {
    await signOutUser();
    await navigate({ to: '/' });
  };

  const handleUnauthorized = async (err: unknown) => {
    if (hasForcedLogout.current) return true;
    if (err instanceof Error && err.message === 'unauthorized') {
      hasForcedLogout.current = true;
      await handleLogout();
      return true;
    }
    return false;
  };

  const studioQuery = useQuery({
    queryKey: ['studioSettings'],
    queryFn: fetchStudioSettings,
  });

  const integrationQuery = useQuery({
    queryKey: ['integrationSettings'],
    queryFn: fetchIntegrationSettings,
  });

  const stripeBalanceQuery = useQuery({
    queryKey: ['stripeBalance'],
    queryFn: fetchStripeBalance,
    enabled: integrationQuery.data?.stripe.enabled === true,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (studioQuery.error) {
      void handleUnauthorized(studioQuery.error);
    }
  }, [studioQuery.error]);

  useEffect(() => {
    if (integrationQuery.error) {
      void handleUnauthorized(integrationQuery.error);
    }
  }, [integrationQuery.error]);

  useEffect(() => {
    if (stripeBalanceQuery.error) {
      void handleUnauthorized(stripeBalanceQuery.error);
    }
  }, [stripeBalanceQuery.error]);

  const numberFormatLocale = studioQuery.data?.numberFormatLocale ?? 'en-US';
  const creditAlertThreshold = studioQuery.data?.creditAlertThreshold ?? 200;
  const aiCredits = studioQuery.data?.aiCredits;
  const stripeDefaultCurrency = normalizeCurrency(
    integrationQuery.data?.stripe.defaultCurrency,
  );
  const stripeBalanceAmount =
    integrationQuery.data?.stripe.enabled &&
    stripeBalanceQuery.data?.enabled &&
    stripeBalanceQuery.data.available !== undefined
      ? stripeBalanceQuery.data.available
      : null;
  const stripeBalanceDisplay =
    stripeBalanceAmount !== null
      ? formatCurrency(
          stripeBalanceAmount / 100,
          stripeDefaultCurrency,
          {},
          numberFormatLocale,
        )
      : '—';
  const stripeBalanceLoading =
    stripeBalanceQuery.isLoading && !stripeBalanceQuery.data;
  const stripeBalanceLive = Boolean(
    integrationQuery.data?.stripe.enabled && stripeBalanceQuery.data?.enabled,
  );

  const contextValue = useMemo(
    () => ({
      studioSettings: studioQuery.data,
      integrationSettings: integrationQuery.data,
      numberFormatLocale,
      creditAlertThreshold,
      stripeDefaultCurrency,
      stripeBalanceAmount,
      stripeBalanceDisplay,
      stripeBalanceLive,
      stripeBalanceLoading,
    }),
    [
      studioQuery.data,
      integrationQuery.data,
      numberFormatLocale,
      creditAlertThreshold,
      stripeDefaultCurrency,
      stripeBalanceAmount,
      stripeBalanceDisplay,
      stripeBalanceLive,
      stripeBalanceLoading,
    ],
  );

  return (
    <StudioProvider value={contextValue}>
      <DashboardLayout
        projectTitle="DreamWeaverComics Studio"
        credits={aiCredits ?? 0}
        creditsLoading={studioQuery.isLoading && !studioQuery.data}
        creditAlertThreshold={creditAlertThreshold}
        numberLocale={numberFormatLocale}
        stripeBalance={stripeBalanceDisplay}
        stripeBalanceLoading={stripeBalanceLoading}
        activeNav={activeNav}
        onLogout={handleLogout}
        userName={userName}
        userEmail={userEmail}
        userAvatarUrl={userAvatarUrl}
      >
        <Outlet />
      </DashboardLayout>
    </StudioProvider>
  );
};

export default ProtectedLayout;
