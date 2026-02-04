import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  Outlet,
} from '@tanstack/react-router';

import Login from './pages/login';
import Dashboard from './pages/dashboard';
import ForgotPasswordPage from './pages/forgot-password';
import SettingsPage from './pages/settings';
import { getAuthState } from './auth';

const rootRoute = createRootRoute({
  component: Outlet,
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
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
  beforeLoad: async () => {
    const user = await getAuthState();
    if (!user) {
      throw redirect({ to: '/' });
    }
  },
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: ForgotPasswordPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
  beforeLoad: async () => {
    const user = await getAuthState();
    if (!user) {
      throw redirect({ to: '/' });
    }
  },
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  dashboardRoute,
  forgotPasswordRoute,
  settingsRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
