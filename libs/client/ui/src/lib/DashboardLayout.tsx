import { ReactNode, useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import {
  Bot,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  Coins,
  FolderKanban,
  FolderOpen,
  HelpCircle,
  LineChart,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Sun,
  User,
  UserCircle,
  Users,
  X,
  Bell,
  ClipboardList,
} from 'lucide-react';

type NavItem = {
  id:
    | 'ecommerce'
    | 'project'
    | 'marketing'
    | 'analytic'
    | 'ai'
    | 'projects'
    | 'customer'
    | 'products'
    | 'orders'
    | 'account'
    | 'help'
    | 'calendar'
    | 'files';
  label: string;
  icon: LucideIcon;
};

const dashboardItems: NavItem[] = [
  { id: 'ecommerce', label: 'Ecommerce', icon: ShoppingCart },
  { id: 'project', label: 'Project', icon: FolderKanban },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'analytic', label: 'Analytic', icon: LineChart },
];

const conceptItems: Array<{
  id: NavItem['id'];
  label: string;
  icon: LucideIcon;
  children: Array<{ id: string; label: string }>;
}> = [
  {
    id: 'ai',
    label: 'AI',
    icon: Bot,
    children: [
      { id: 'ai-chat', label: 'Chat' },
      { id: 'ai-image', label: 'Image' },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderKanban,
    children: [
      { id: 'projects-board', label: 'Scrum Board' },
      { id: 'projects-list', label: 'List' },
      { id: 'projects-details', label: 'Details' },
      { id: 'projects-tasks', label: 'Tasks' },
    ],
  },
  {
    id: 'customer',
    label: 'Customer',
    icon: Users,
    children: [
      { id: 'customer-list', label: 'List' },
      { id: 'customer-edit', label: 'Edit' },
      { id: 'customer-details', label: 'Details' },
    ],
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    children: [
      { id: 'products-list', label: 'List' },
      { id: 'products-edit', label: 'Edit' },
      { id: 'products-create', label: 'Create' },
    ],
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: ClipboardList,
    children: [
      { id: 'orders-list', label: 'List' },
      { id: 'orders-edit', label: 'Edit' },
    ],
  },
];

const otherItems: NavItem[] = [
  { id: 'account', label: 'Account', icon: UserCircle },
  { id: 'help', label: 'Help Center', icon: HelpCircle },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'files', label: 'File Manager', icon: FolderOpen },
];

export type DashboardLayoutProps = {
  children: ReactNode;
  projectTitle?: string;
  credits?: number;
  activeNav?: NavItem['id'];
  userName?: string;
  userEmail?: string;
  userAvatarUrl?: string;
  onLogout?: () => void | Promise<void>;
};

export function DashboardLayout({
  children,
  projectTitle = 'DreamWeaver Studio',
  credits = 120,
  activeNav = 'marketing',
  userName = 'Niki M',
  userEmail = 'niki@dreamweaver.studio',
  userAvatarUrl,
  onLogout,
}: DashboardLayoutProps) {
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    ai: false,
    projects: false,
    customer: false,
    products: false,
    orders: false,
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const stored = window.localStorage.getItem('dw-theme');
      const nextTheme = stored === 'light' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
      setIsDark(nextTheme === 'dark');
    }
  }, []);

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

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-background dark:text-foreground">
      <div className="flex min-h-screen">
        <aside
          className={`hidden min-h-screen flex-col border-r border-slate-200 bg-white transition-all duration-200 dark:border-border dark:bg-black/80 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:flex ${
            isSidebarCollapsed ? 'w-[88px] min-w-[88px]' : 'w-[290px] min-w-[290px]'
          }`}
        >
          <div className="flex h-16 items-center px-6">
            {isSidebarCollapsed ? (
              <img
                src="/logo.svg"
                alt="DreamWeaver Studio"
                className="h-9 w-9"
              />
            ) : (
              <>
                <img
                  src="/logo-dw.svg"
                  alt="DreamWeaver Studio"
                  className="h-10 w-full max-w-none object-contain dark:hidden"
                />
                <img
                  src="/logo-dw-light.svg"
                  alt="DreamWeaver Studio"
                  className="hidden h-10 w-full max-w-none object-contain dark:block"
                />
              </>
            )}
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
                    <button
                      key={item.id}
                      type="button"
                      aria-label={item.label}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex h-12 w-full items-center ${
                        isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
                      } rounded-xl text-sm font-semibold transition-colors duration-200 ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-foreground/70 dark:hover:bg-card/80 dark:hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {isSidebarCollapsed ? null : <span>{item.label}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="mt-8">
              {!isSidebarCollapsed ? (
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-foreground/50">
                  Concepts
                </p>
              ) : null}
              <div className="mt-3 flex flex-col gap-1">
                {conceptItems.map((item) => {
                  const isOpen = openMenus[item.id];
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => toggleMenu(item.id)}
                        aria-expanded={isOpen}
                        className={`flex h-12 w-full items-center rounded-xl text-sm font-semibold text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-foreground/70 dark:hover:bg-card/80 dark:hover:text-foreground ${
                          isSidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          {isSidebarCollapsed ? null : item.label}
                        </span>
                        {isSidebarCollapsed ? null : (
                          <ChevronDown
                            className={`text-xs transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </button>
                      {isOpen && !isSidebarCollapsed ? (
                        <div className="ml-10 mt-1 flex flex-col gap-1">
                          {item.children.map((child) => (
                            <button
                              key={child.id}
                              type="button"
                              className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-foreground/60 dark:hover:bg-card/80 dark:hover:text-foreground"
                            >
                              <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-foreground/30" />
                              {child.label}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-8">
              {!isSidebarCollapsed ? (
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-foreground/50">
                  Others
                </p>
              ) : null}
              <nav className="mt-3 flex flex-col gap-1">
                {otherItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                    type="button"
                    className={`flex h-12 w-full items-center rounded-xl text-sm font-semibold text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-foreground/70 dark:hover:bg-card/80 dark:hover:text-foreground ${
                      isSidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {isSidebarCollapsed ? null : <span>{item.label}</span>}
                  </button>
                  );
                })}
              </nav>
            </div>
          </div>
          <div className={`${isSidebarCollapsed ? 'px-3' : 'px-4'} pb-6`}>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-primary/30 transition-colors duration-200 hover:bg-primary/90"
            >
              <Sparkles className="h-5 w-5" />
              {isSidebarCollapsed ? null : <span>New Project</span>}
            </button>
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
              src="/logo-dw.svg"
              alt="DreamWeaver Studio"
              className="h-10 w-full max-w-none object-contain dark:hidden"
            />
            <img
              src="/logo-dw-light.svg"
              alt="DreamWeaver Studio"
              className="hidden h-10 w-full max-w-none object-contain dark:block"
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
                  <button
                    key={item.id}
                    type="button"
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-foreground/70 dark:hover:bg-card/80 dark:hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-foreground/50">
                Concepts
              </p>
              <div className="mt-3 flex flex-col gap-1">
                {conceptItems.map((item) => {
                  const isOpen = openMenus[item.id];
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => toggleMenu(item.id)}
                        aria-expanded={isOpen}
                        className="flex h-12 w-full items-center justify-between rounded-xl px-3 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-foreground/70 dark:hover:bg-card/80 dark:hover:text-foreground"
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </span>
                        <ChevronDown
                          className={`text-xs transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen ? (
                        <div className="ml-10 mt-1 flex flex-col gap-1">
                          {item.children.map((child) => (
                            <button
                              key={child.id}
                              type="button"
                              className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-foreground/60 dark:hover:bg-card/80 dark:hover:text-foreground"
                            >
                              <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-foreground/30" />
                              {child.label}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-foreground/50">
                Others
              </p>
              <nav className="mt-3 flex flex-col gap-1">
                {otherItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                    type="button"
                    className="flex h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-foreground/70 dark:hover:bg-card/80 dark:hover:text-foreground"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                  );
                })}
              </nav>
            </div>
          </div>
          <div className="px-4 pb-6">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-primary/30 transition-colors duration-200 hover:bg-primary/90"
            >
              <Sparkles className="h-5 w-5" />
              New Project
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-6 shadow-sm backdrop-blur dark:border-border dark:bg-black/60 dark:shadow-2xl">
            <div className="relative flex items-center gap-3">
              <button
                type="button"
                aria-label="Collapse sidebar"
                onClick={() => setIsSidebarCollapsed((prev) => !prev)}
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
                      placeholder="Search projects, prompts..."
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
              <button
                type="button"
                aria-label="Notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-foreground/70 dark:hover:bg-card/80"
              >
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500 dark:border-black" />
                <Bell className="h-5 w-5" />
              </button>
              <Link
                to="/settings"
                aria-label="Settings"
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-foreground/70 dark:hover:bg-card/80"
              >
                <Settings className="h-5 w-5" />
              </Link>
              <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-card dark:text-foreground/80 md:flex">
                <Coins className="h-4 w-4 text-amber-400" />
                <span>{credits}</span>
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
                      to="/profile"
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
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
