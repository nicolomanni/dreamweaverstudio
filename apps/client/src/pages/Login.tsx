import { FormEvent, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from '@tanstack/react-router';

import { setAuthenticated } from '../auth';

export function Login() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setIsSubmitting(true);
    setAuthenticated(true);
    await navigate({ to: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden items-center justify-center overflow-hidden bg-black lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/30" />
          <div className="absolute inset-0 opacity-60 bg-grid-pattern" />
          <div className="relative z-10 max-w-md text-center">
            <p className="text-xs uppercase tracking-[0.5em] text-foreground/60">
              DreamWeaver
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-foreground">
              DreamWeaver Studio
            </h1>
            <p className="mt-4 text-sm text-foreground/70">
              Shape cinematic panels, orchestrate AI tools, and publish your
              next comic universe.
            </p>
          </div>
        </section>

        <section className="relative flex items-center justify-center px-6 py-12">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground/80 transition-colors duration-200 hover:text-foreground"
          >
            <FontAwesomeIcon icon={isDark ? faSun : faMoon} />
          </button>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">
                Welcome back
              </h2>
              <p className="text-sm text-foreground/70">
                Sign in to continue building your storyboards.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleSubmit()}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background/60 px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-background/80"
            >
              <FontAwesomeIcon icon={faGoogle} />
              Sign in with Google
            </button>

            <div className="my-6 flex items-center gap-3 text-xs text-foreground/50">
              <span className="h-px flex-1 bg-border" />
              or continue with email
              <span className="h-px flex-1 bg-border" />
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs text-foreground/70">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@dreamweaver.studio"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-xs text-foreground/70">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-black transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
