import { FormEvent, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { useNavigate } from '@tanstack/react-router';

import { signInWithEmailPassword, signInWithGoogle } from '../../auth';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="w-full max-w-md space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Welcome back</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Sign in to continue building your storyboards.
        </p>
      </div>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card/60 px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FontAwesomeIcon icon={faGoogle} />
        Sign in with Google
      </button>

      <div className="flex items-center gap-3 text-xs text-foreground/40">
        <span className="h-px flex-1 bg-border" />
        or continue with email
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="email-address" className="text-xs text-foreground/70">
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
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none"
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
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none"
            placeholder="••••••••"
          />
        </div>
        {error ? (
          <p className="text-xs text-rose-400">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-bold text-black transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
