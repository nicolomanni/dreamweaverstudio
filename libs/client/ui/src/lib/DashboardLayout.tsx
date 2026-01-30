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
};

export function DashboardLayout({
  children,
  projectTitle = 'DreamWeaver Studio',
  credits = 120,
  activeNav = 'projects',
}: DashboardLayoutProps) {
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.08),_transparent_45%)]">
        <aside className="group/sidebar relative hidden min-h-screen w-20 flex-col items-center gap-2 bg-black/80 py-6 shadow-2xl transition-[width] duration-200 hover:w-64 lg:flex">
          <div className="absolute inset-y-0 right-0 w-px bg-border/60" />
          <div className="flex w-full items-center gap-3 px-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card/80 shadow">
              <img
                src="/logo-dw.png"
                alt="DreamWeaver Studio"
                className="h-8 w-8"
              />
            </div>
            <div className="opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100">
              <p className="text-xs uppercase tracking-[0.4em] text-foreground/50">
                DreamWeaver
              </p>
              <p className="text-sm font-semibold text-foreground">
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
                        ? 'bg-card text-primary shadow'
                        : 'text-foreground/70 hover:text-foreground'
                    } hover:border-border/60 hover:bg-card/80`}
                  >
                    <FontAwesomeIcon icon={item.icon} />
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100">
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
              <span className="opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100">
                New Project
              </span>
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
          className={`fixed inset-y-0 left-0 z-50 w-64 -translate-x-full bg-black/90 shadow-2xl transition-transform duration-200 lg:hidden ${
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
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground/80"
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
                      ? 'bg-card text-primary shadow'
                      : 'text-foreground/70 hover:text-foreground'
                  } hover:border-border/60 hover:bg-card/80`}
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
          <header className="flex h-16 items-center justify-between border-b border-border bg-background/60 px-6 backdrop-blur">
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setIsSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground/70 lg:hidden"
              >
                <FontAwesomeIcon icon={faBars} />
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card lg:hidden">
                <img
                  src="/logo-dw.png"
                  alt="DreamWeaver Studio"
                  className="h-6 w-6"
                />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-foreground/50">
                  DreamWeaver Studio
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {projectTitle}
                </p>
              </div>
            </div>
            <div className="hidden flex-1 justify-center px-8 lg:flex">
              <div className="flex w-full max-w-md items-center gap-3 rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-foreground/70">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                <input
                  type="search"
                  placeholder="Search projects, prompts, assets..."
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground/40 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground/80 transition-colors duration-200 hover:text-foreground"
              >
                <FontAwesomeIcon icon={isDark ? faSun : faMoon} />
              </button>
              <button
                type="button"
                aria-label="Notifications"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground/70 transition-colors duration-200 hover:text-foreground"
              >
                <FontAwesomeIcon icon={faBell} />
              </button>
              <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-1 text-sm lg:flex">
                <FontAwesomeIcon icon={faCoins} className="text-amber-400" />
                <span className="text-foreground/80">Credits</span>
                <span className="font-semibold text-foreground">{credits}</span>
              </div>
              <div className="h-9 w-9 overflow-hidden rounded-full border border-border bg-gradient-to-br from-primary/60 to-secondary/60" />
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-background text-foreground bg-grid-pattern">
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
