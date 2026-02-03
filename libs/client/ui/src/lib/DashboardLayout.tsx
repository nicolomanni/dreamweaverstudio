import { ReactNode, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLayerGroup,
  faPenNib,
  faImages,
  faCog,
  faCoins,
  faMagnifyingGlass,
  faBell,
  faWandMagicSparkles,
  faBars,
  faXmark,
  faChevronDown,
  faRightFromBracket,
  faUser,
  faMoon,
  faSun,
} from '@fortawesome/free-solid-svg-icons';

type NavItem = {
  id: 'projects' | 'editor' | 'gallery' | 'settings';
  label: string;
  icon: typeof faLayerGroup;
};

const navItems: NavItem[] = [
  { id: 'projects', label: 'Projects', icon: faLayerGroup },
  { id: 'editor', label: 'Editor', icon: faPenNib },
  { id: 'gallery', label: 'Gallery', icon: faImages },
  { id: 'settings', label: 'Settings', icon: faCog },
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
  activeNav = 'projects',
  userName = 'Niki M',
  userEmail = 'niki@dreamweaver.studio',
  userAvatarUrl,
  onLogout,
}: DashboardLayoutProps) {
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-background dark:text-foreground">
      <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.08),_transparent_45%)]">
        <aside className="group/sidebar relative hidden min-h-screen w-64 flex-col items-center gap-2 border-r border-slate-200 bg-white/90 py-6 shadow-2xl dark:border-border dark:bg-black/80 lg:flex">
          <div className="absolute inset-y-0 right-0 w-px bg-border/60" />
          <div className="flex w-full items-center gap-3 px-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow dark:border-border dark:bg-card/80">
              <img
                src="/logo.png"
                alt="DreamWeaver Studio"
                className="h-8 w-8"
              />
            </div>
            <div>
              <img
                src="/logo-dw.png"
                alt="DreamWeaver Studio"
                className="h-7 w-auto"
              />
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-foreground/50">
                DreamWeaver
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
                Studio
              </p>
            </div>
          </div>
          <nav className="mt-10 flex w-full flex-col gap-2 px-4">
            {navItems.map((item) => {
              const isActive = item.id === activeNav;
              return (
                <div key={item.id} className="group relative flex items-center">
                  <button
                    type="button"
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex h-11 w-full items-center gap-3 rounded-2xl border border-transparent px-3 transition-colors duration-200 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow dark:bg-card dark:text-primary'
                        : 'text-slate-500 hover:text-slate-900 dark:text-foreground/70 dark:hover:text-foreground'
                    } hover:border-slate-200 hover:bg-slate-100 dark:hover:border-border/60 dark:hover:bg-card/80`}
                  >
                    <FontAwesomeIcon icon={item.icon} />
                    <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                      {item.label}
                    </span>
                  </button>
                  <span className="pointer-events-none absolute left-16 whitespace-nowrap rounded-md bg-card px-3 py-1 text-xs text-foreground opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-hover/sidebar:opacity-0">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </nav>
          <div className="mt-auto w-full px-4">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-primary/30 transition-colors duration-200 hover:bg-primary/90"
            >
              <FontAwesomeIcon icon={faWandMagicSparkles} />
              <span>New Project</span>
            </button>
            <p className="mt-4 hidden text-center text-[10px] uppercase tracking-[0.3em] text-foreground/40 group-hover/sidebar:block">
              DreamWeaver Lab
            </p>
          </div>
        </aside>

        {isSidebarOpen ? (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 -translate-x-full bg-white/95 shadow-2xl transition-transform duration-200 dark:bg-black/90 lg:hidden ${
            isSidebarOpen ? 'translate-x-0' : ''
          }`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card/80 shadow">
                <img
                  src="/logo-dw.png"
                  alt="DreamWeaver Studio"
                  className="h-8 w-8"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-foreground/50">
                  DreamWeaver
                </p>
                <p className="text-sm font-semibold text-foreground">Studio</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setIsSidebarOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 dark:border-border dark:bg-card dark:text-foreground/80"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
          <nav className="mt-2 flex flex-col gap-2 px-4">
            {navItems.map((item) => {
              const isActive = item.id === activeNav;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex h-11 w-full items-center gap-3 rounded-2xl border border-transparent px-3 transition-colors duration-200 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow dark:bg-card dark:text-primary'
                      : 'text-slate-500 hover:text-slate-900 dark:text-foreground/70 dark:hover:text-foreground'
                  } hover:border-slate-200 hover:bg-slate-100 dark:hover:border-border/60 dark:hover:bg-card/80`}
                >
                  <FontAwesomeIcon icon={item.icon} />
                  <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="mt-auto w-full px-4 pb-6">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-primary/30 transition-colors duration-200 hover:bg-primary/90"
            >
              <FontAwesomeIcon icon={faWandMagicSparkles} />
              New Project
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur dark:border-border dark:bg-background/70">
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setIsSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-border dark:bg-card dark:text-foreground/70 lg:hidden"
              >
                <FontAwesomeIcon icon={faBars} />
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-border dark:bg-card lg:hidden">
                <img
                  src="/logo.png"
                  alt="DreamWeaver Studio"
                  className="h-6 w-6"
                />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 dark:text-foreground/50">
                  DreamWeaver Studio
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
                  {projectTitle}
                </p>
              </div>
            </div>
            <div className="hidden flex-1 justify-center px-8 lg:flex">
              <div className="flex w-full max-w-md items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 dark:border-border dark:bg-card/70 dark:text-foreground/70">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                <input
                  type="search"
                  placeholder="Search projects, prompts, assets..."
                  className="w-full bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none dark:text-foreground dark:placeholder:text-foreground/40"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors duration-200 hover:text-slate-900 dark:border-border dark:bg-card dark:text-foreground/80 dark:hover:text-foreground"
              >
                <FontAwesomeIcon icon={isDark ? faSun : faMoon} />
              </button>
              <button
                type="button"
                aria-label="Notifications"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors duration-200 hover:text-slate-900 dark:border-border dark:bg-card dark:text-foreground/70 dark:hover:text-foreground"
              >
                <FontAwesomeIcon icon={faBell} />
              </button>
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1 text-sm text-slate-700 dark:border-border dark:bg-card dark:text-foreground lg:flex">
                <FontAwesomeIcon icon={faCoins} className="text-amber-400" />
                <span className="text-slate-600 dark:text-foreground/80">
                  Credits
                </span>
                <span className="font-semibold text-slate-900 dark:text-foreground">
                  {credits}
                </span>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                  aria-label="Open user menu"
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 transition-colors duration-200 hover:text-slate-900 dark:border-border dark:bg-card dark:text-foreground/80 dark:hover:text-foreground"
                >
                  {userAvatarUrl ? (
                    <img
                      src={userAvatarUrl}
                      alt={userName}
                      className="h-8 w-8 rounded-full border border-border object-cover"
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
                  <span className="hidden text-xs font-semibold lg:inline">
                    {userName}
                  </span>
                  <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
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
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-foreground/80 dark:hover:bg-background/70"
                    >
                      <FontAwesomeIcon icon={faUser} />
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-foreground/80 dark:hover:bg-background/70"
                    >
                      <FontAwesomeIcon icon={faRightFromBracket} />
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-white text-slate-900 dark:bg-background dark:text-foreground bg-grid-pattern">
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
