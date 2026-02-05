import { ReactNode, useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import {
  ChevronLeft,
  ChevronDown,
  Coins,
  CreditCard,
  LineChart,
  LogOut,
  Menu,
  Moon,
  Palette,
  Search,
  Settings,
  Sun,
  User,
  X,
  Bell,
} from 'lucide-react';

type NavItem = {
  id: 'analytics' | 'settings' | 'styles';
  label: string;
  icon: LucideIcon;
  href: string;
};

const dashboardItems: NavItem[] = [
  {
    id: 'analytics',
    label: 'Analytics',
    icon: LineChart,
    href: '/dashboard',
  },
];

const generalItems: NavItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
  {
    id: 'styles',
    label: 'Styles',
    icon: Palette,
    href: '/styles',
  },
];

export type DashboardLayoutProps = {
  children: ReactNode;
  projectTitle?: string;
  credits?: number;
  creditsLoading?: boolean;
  creditAlertThreshold?: number;
  numberLocale?: string;
  stripeBalance?: string;
  stripeBalanceLoading?: boolean;
  activeNav?: NavItem['id'];
  userName?: string;
  userEmail?: string;
  userAvatarUrl?: string;
  onLogout?: () => void | Promise<void>;
};

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export function DashboardLayout({
  children,
  projectTitle = 'DreamWeaver Studio',
  credits = 120,
  creditsLoading = false,
  creditAlertThreshold,
  numberLocale,
  stripeBalance = '—',
  stripeBalanceLoading = false,
  activeNav = 'analytics',
  userName = 'Niki M',
  userEmail = 'niki@dreamweaver.studio',
  userAvatarUrl,
  onLogout,
}: DashboardLayoutProps) {
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('dw-sidebar') === 'collapsed';
  });
  const prevCreditsRef = useRef<number | null>(null);
  const resolvedLocale = numberLocale ?? 'en-US';
  const numberFormatter = new Intl.NumberFormat(resolvedLocale);

  const pushNotification = (title: string, message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const createdAt = new Date().toISOString();
    setNotifications((prev) => [
      { id, title, message, createdAt, read: false },
      ...prev,
    ]);
  };

  const unreadCount = notifications.filter((item) => !item.read).length;
  const formattedCredits =
    typeof credits === 'number'
      ? numberFormatter.format(credits)
      : '—';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const stored = window.localStorage.getItem('dw-theme');
      const nextTheme = stored === 'light' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
      setIsDark(nextTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (creditsLoading) {
      prevCreditsRef.current = credits;
      return;
    }
    if (creditAlertThreshold === undefined || creditAlertThreshold === null) {
      prevCreditsRef.current = credits;
      return;
    }
    const storageKey = 'dw-credit-alert';
    let storedThreshold: number | undefined;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        storedThreshold = JSON.parse(stored)?.threshold;
      }
    } catch (err) {
      storedThreshold = undefined;
    }

    const isBelow = credits <= creditAlertThreshold;
    const wasBelow =
      prevCreditsRef.current !== null &&
      prevCreditsRef.current <= creditAlertThreshold;

    if (isBelow && !wasBelow && storedThreshold !== creditAlertThreshold) {
      pushNotification(
        'Credits threshold reached',
        `You have ${numberFormatter.format(
          credits,
        )} credits left, which is below your alert threshold of ${numberFormatter.format(
          creditAlertThreshold,
        )}.`,
      );
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ threshold: creditAlertThreshold }),
      );
    }

    if (!isBelow && storedThreshold === creditAlertThreshold) {
      window.localStorage.removeItem(storageKey);
    }

    prevCreditsRef.current = credits;
  }, [credits, creditAlertThreshold, creditsLoading]);

  useEffect(() => {
    if (!isNotificationsOpen) return;
    setNotifications((prev) => {
      const hasUnread = prev.some((item) => !item.read);
      if (!hasUnread) return prev;
      return prev.map((item) => (item.read ? item : { ...item, read: true }));
    });
  }, [isNotificationsOpen]);


  const toggleTheme = () => {
    if (typeof document === 'undefined') {
      return;
    }
    const nextTheme = document.documentElement.classList.contains('dark')
      ? 'light'
      : 'dark';
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    window.localStorage.setItem('dw-theme', nextTheme);
    setIsDark(nextTheme === 'dark');
  };

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
    setIsUserMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-background dark:text-foreground">
      <div className="flex h-screen overflow-hidden">
        <aside
          className={`hidden min-h-screen flex-col border-r border-slate-200 bg-white transition-all duration-200 dark:border-border dark:bg-black/80 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:flex ${
            isSidebarCollapsed ? 'w-[88px] min-w-[88px]' : 'w-[290px] min-w-[290px]'
          }`}
        >
          <div className="flex h-16 items-center px-6">
            <div className="relative h-10 w-full">
              <img
                src={isDark ? '/logo-dw-light.svg' : '/logo-dw.svg'}
                alt="DreamWeaver Studio"
                className={`absolute inset-0 h-10 w-full max-w-none object-contain transition-all duration-200 ${
                  isSidebarCollapsed ? 'opacity-0 scale-95' : 'opacity-100'
                }`}
              />
              <img
                src="/logo.svg"
                alt="DreamWeaver Studio"
                className={`absolute left-0 top-0 h-10 w-10 object-contain transition-all duration-200 ${
                  isSidebarCollapsed ? 'opacity-100' : 'opacity-0 scale-95'
                }`}
              />
            </div>
          </div>
          <div
            className={`flex-1 overflow-y-auto pb-6 dw-scrollbar-hidden ${
              isSidebarCollapsed ? 'px-3' : 'px-4'
            }`}
          >
            <div className="mt-2">
              {!isSidebarCollapsed ? (
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-foreground/50">
                  Dashboard
                </p>
              ) : null}
              <nav className="mt-3 flex flex-col gap-1">
                {dashboardItems.map((item) => {
                  const isActive = item.id === activeNav;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      aria-label={item.label}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group relative flex h-12 w-full items-center ${
                        isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
                      } rounded-xl text-sm font-semibold transition-colors duration-200 ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-foreground/70 dark:hover:bg-card/80 dark:hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span
                        className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ${
                          isSidebarCollapsed ? 'max-w-0 opacity-0' : 'max-w-[180px] opacity-100'
                        }`}
                      >
                        {item.label}
                      </span>
                      {isSidebarCollapsed ? (
                        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                          {item.label}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="mt-8">
              {!isSidebarCollapsed ? (
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-foreground/50">
                  General
                </p>
              ) : null}
              <nav className="mt-3 flex flex-col gap-1">
                {generalItems.map((item) => {
                  const isActive = item.id === activeNav;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      aria-label={item.label}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group relative flex h-12 w-full items-center ${
                        isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
                      } rounded-xl text-sm font-semibold transition-colors duration-200 ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-foreground/70 dark:hover:bg-card/80 dark:hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span
                        className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ${
                          isSidebarCollapsed ? 'max-w-0 opacity-0' : 'max-w-[180px] opacity-100'
                        }`}
                      >
                        {item.label}
                      </span>
                      {isSidebarCollapsed ? (
                        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                          {item.label}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
          <div className={`${isSidebarCollapsed ? 'px-3' : 'px-4'} pb-6`}>
            <div className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 dark:border-border dark:bg-background dark:text-foreground/60">
              {isSidebarCollapsed ? `v${__APP_VERSION__}` : `Dashboard v${__APP_VERSION__}`}
            </div>
          </div>
        </aside>

        {isSidebarOpen ? (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[290px] -translate-x-full bg-white shadow-2xl transition-transform duration-200 dark:bg-black/90 lg:hidden ${
            isSidebarOpen ? 'translate-x-0' : ''
          }`}
        >
          <div className="flex h-16 items-center justify-between px-5">
            <img
              src={isDark ? '/logo-dw-light.svg' : '/logo-dw.svg'}
              alt="DreamWeaver Studio"
              className="h-10 w-full max-w-none object-contain"
            />
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setIsSidebarOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 dark:border-border dark:bg-card dark:text-foreground/80"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-6 dw-scrollbar-hidden">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-foreground/50">
              Dashboard
            </p>
            <nav className="mt-3 flex flex-col gap-1">
              {dashboardItems.map((item) => {
                const isActive = item.id === activeNav;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-foreground/70 dark:hover:bg-card/80 dark:hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-foreground/50">
                General
              </p>
              <nav className="mt-3 flex flex-col gap-1">
                {generalItems.map((item) => {
                  const isActive = item.id === activeNav;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors duration-200 ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-foreground/70 dark:hover:bg-card/80 dark:hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
          <div className="px-4 pb-6">
            <div className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 dark:border-border dark:bg-background dark:text-foreground/60">
              Dashboard v{__APP_VERSION__}
            </div>
          </div>
        </aside>

        <div className="flex min-h-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-6 shadow-sm backdrop-blur dark:border-border dark:bg-black/60 dark:shadow-2xl">
            <div className="relative flex items-center gap-3">
              <button
                type="button"
                aria-label="Collapse sidebar"
                onClick={() =>
                  setIsSidebarCollapsed((prev) => {
                    const next = !prev;
                    if (typeof window !== 'undefined') {
                      window.localStorage.setItem('dw-sidebar', next ? 'collapsed' : 'expanded');
                    }
                    return next;
                  })
                }
                className="hidden h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-foreground/70 dark:hover:bg-card/80 lg:flex"
              >
                <ChevronLeft
                  className={`text-xl transition-transform ${
                    isSidebarCollapsed ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setIsSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 dark:text-foreground/70 dark:hover:bg-card/80 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Search"
                onClick={() => setIsSearchOpen((open) => !open)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-foreground/70 dark:hover:bg-card/80"
              >
                <Search className="h-5 w-5" />
              </button>
              {isSearchOpen ? (
                <div className="absolute left-0 top-[calc(100%+0.5rem)] z-40 w-[320px] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-border dark:bg-card">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-border dark:bg-background dark:text-foreground/70">
                    <Search className="h-4 w-4" />
                    <input
                      type="search"
                      placeholder="Search..."
                      className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-foreground dark:placeholder:text-foreground/40"
                    />
                  </div>
                </div>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-foreground/70 dark:hover:bg-card/80"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div className="relative">
                <button
                  type="button"
                  aria-label="Notifications"
                  onClick={() => setIsNotificationsOpen((open) => !open)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-foreground/70 dark:hover:bg-card/80"
                >
                  {unreadCount > 0 ? (
                    <span className="absolute right-2 top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-semibold text-white dark:border-black">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  ) : null}
                  <Bell className="h-5 w-5" />
                </button>
                {isNotificationsOpen ? (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-border dark:bg-card">
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-border">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
                        Notifications
                      </p>
                      {notifications.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setNotifications([])}
                          className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900 dark:text-foreground/60 dark:hover:text-foreground"
                        >
                          Clear
                        </button>
                      ) : null}
                    </div>
                    <div className="max-h-72 overflow-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-slate-500 dark:text-foreground/60">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.map((item) => (
                          <div
                            key={item.id}
                            className="border-b border-slate-100 px-4 py-3 last:border-b-0 dark:border-border"
                          >
                            <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
                              {item.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-foreground/60">
                              {item.message}
                            </p>
                            <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
                              {new Date(item.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
              <Link
                to="/settings"
                aria-label="Settings"
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-foreground/70 dark:hover:bg-card/80"
              >
                <Settings className="h-5 w-5" />
              </Link>
              <div className="flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-2.5 text-xs font-semibold text-slate-600 dark:border-border dark:bg-card dark:text-foreground/80">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200">
                    <CreditCard className="h-3.5 w-3.5" />
                  </span>
                  <div className="leading-tight">
                    <p className="text-[8px] uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                      Stripe
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-foreground">
                      {stripeBalanceLoading ? (
                        <span className="inline-flex items-center gap-2 text-slate-400 dark:text-foreground/50">
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        </span>
                      ) : (
                        <span>{stripeBalance}</span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="h-7 w-px bg-slate-200 dark:bg-border" />
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-200">
                    <Coins className="h-3.5 w-3.5" />
                  </span>
                  <div className="leading-tight">
                    <p className="text-[8px] uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                      AI credits
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-foreground">
                      {creditsLoading ? (
                        <span className="inline-flex items-center gap-2 text-slate-400 dark:text-foreground/50">
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        </span>
                      ) : (
                        <span>{formattedCredits}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  aria-label="Open user menu"
                  className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-1 py-1 text-sm text-slate-700 transition-colors duration-200 hover:bg-slate-100 dark:bg-card dark:text-foreground/80 dark:hover:text-foreground"
                >
                  {userAvatarUrl ? (
                    <img
                      src={userAvatarUrl}
                      alt={userName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-gradient-to-br from-primary/60 to-secondary/60 text-xs font-semibold text-black">
                      {userName
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isUserMenuOpen ? (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-border dark:bg-card">
                    <div className="border-b border-slate-200 px-4 py-3 dark:border-border">
                      <p className="text-xs text-slate-500 dark:text-foreground/60">
                        Signed in as
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
                        {userEmail}
                      </p>
                    </div>
                    <Link
                      to="/settings"
                      hash="profile"
                      className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-foreground/80 dark:hover:bg-background/70"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-foreground/80 dark:hover:bg-background/70"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-slate-50 text-slate-900 dark:bg-background dark:text-foreground bg-grid-pattern">
            <div className="mx-auto flex w-full max-w-none flex-col gap-8 px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
