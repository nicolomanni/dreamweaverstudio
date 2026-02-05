import { useEffect, useRef, useState } from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  Outlet,
  useRouterState,
} from '@tanstack/react-router';

import Login from './pages/login';
import Dashboard from './pages/dashboard';
import ForgotPasswordPage from './pages/forgot-password';
import SettingsPage from './pages/settings';
import StylesListPage from './pages/styles';
import StyleCreatePage from './pages/styles/new';
import StyleDetailPage from './pages/styles/detail';
import { getAuthState } from './auth';
import { subscribeLoading } from '@dreamweaverstudio/client-data-access-api';
import ProtectedLayout from './layouts/ProtectedLayout';

const selectIsLoading = (state: { isLoading: boolean }) => state.isLoading;

const RootLayout = () => {
  const isLoading = useRouterState({ select: selectIsLoading });
  const [apiLoading, setApiLoading] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(false);
  const startRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const minVisibleMs = 450;

  useEffect(() => subscribeLoading((count) => setApiLoading(count > 0)), []);

  useEffect(() => {
    const shouldShow = isLoading || apiLoading;
    if (shouldShow) {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      if (!loaderVisible) {
        startRef.current = Date.now();
        setLoaderVisible(true);
      } else if (!startRef.current) {
        startRef.current = Date.now();
      }
      return;
    }

    if (!loaderVisible) {
      return;
    }
    const startedAt = startRef.current ?? Date.now();
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(minVisibleMs - elapsed, 0);
    hideTimeoutRef.current = window.setTimeout(() => {
      setLoaderVisible(false);
      startRef.current = null;
      hideTimeoutRef.current = null;
    }, remaining);
  }, [apiLoading, isLoading, loaderVisible]);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);
  return (
    <>
      {loaderVisible ? (
        <>
          <div className="pointer-events-none fixed left-0 top-0 z-50 h-2 w-full bg-slate-200/80 shadow-sm backdrop-blur dark:bg-slate-800/80">
            <div className="dw-loading-bar h-full" />
          </div>
          <div className="pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 shadow-lg backdrop-blur dark:border-border dark:bg-black/75 dark:text-foreground/80">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(124,92,255,0.6)]" />
              Loading
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </div>
          </div>
          <div className="pointer-events-none fixed right-4 top-4 z-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-lg backdrop-blur dark:border-border dark:bg-black/70 dark:text-foreground/80">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </div>
          </div>
        </>
      ) : null}
      <Outlet />
    </>
  );
};

const rootRoute = createRootRoute({
  component: RootLayout,
});

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  component: ProtectedLayout,
  beforeLoad: async () => {
    const user = await getAuthState();
    if (!user) {
      throw redirect({ to: '/' });
    }
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Login,
  beforeLoad: async () => {
    const user = await getAuthState();
    if (user) {
      throw redirect({ to: '/dashboard' });
    }
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/dashboard',
  component: Dashboard,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: ForgotPasswordPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/settings',
  component: SettingsPage,
});

const stylesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/styles',
  component: StylesListPage,
});

const stylesNewRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/styles/new',
  component: StyleCreatePage,
});

const stylesDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/styles/$styleId',
  component: StyleDetailPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  forgotPasswordRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    settingsRoute,
    stylesRoute,
    stylesNewRoute,
    stylesDetailRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
