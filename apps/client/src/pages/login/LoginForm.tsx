import { FormEvent, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { useNavigate, Link } from '@tanstack/react-router';
import { signInWithEmailPassword, signInWithGoogle } from '../../auth';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signInWithEmailPassword(email, password);
      await navigate({ to: '/dashboard' });
    } catch (err) {
      setError('Authentication failed. Check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      await navigate({ to: '/dashboard' });
    } catch (err) {
      setError('Google sign-in failed. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg dw-fade-up">
      <div className="flex flex-col items-start gap-3">
        <img
          src="/logo-dw.svg"
          alt="DreamWeaver Studio"
          className="h-12 w-auto dark:hidden"
        />
        <img
          src="/logo-dw-light.svg"
          alt="DreamWeaver Studio"
          className="hidden h-12 w-auto dark:block"
        />
      </div>
      <div className="mt-8">
        <h1 className="text-3xl font-semibold text-foreground">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-foreground/60">
          Sign in to continue building your storyboards.
        </p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label
            htmlFor="email-address"
            className="text-xs text-foreground/70"
          >
            Email
          </label>
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-input bg-card/90 px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
            placeholder="you@dreamweaver.studio"
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-input bg-card/90 px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-foreground/80"
            >
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-primary hover:text-primary/90"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        {error ? <p className="text-xs text-rose-400">{error}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-black transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-8 flex items-center gap-3 text-xs text-foreground/40">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="mt-6 space-y-5">
        <button
          type="button"
          onClick={handleGoogle}
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card/60 px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-card/80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FontAwesomeIcon icon={faGoogle} />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
