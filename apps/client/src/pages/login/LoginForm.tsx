import { FormEvent, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { useNavigate, Link } from '@tanstack/react-router';
import {
  Button,
  Checkbox,
  HelperText,
  Input,
  Label,
} from '@dreamweaverstudio/client-ui';
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
          <Label htmlFor="email-address">Email</Label>
          <Input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
            placeholder="name@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox
              id="remember-me"
              name="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isSubmitting}
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

        {error ? <HelperText className="text-rose-400">{error}</HelperText> : null}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          size="md"
          variant="primary"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-8 flex items-center gap-3 text-xs text-foreground/40">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="mt-6 space-y-5">
        <Button
          type="button"
          onClick={handleGoogle}
          disabled={isSubmitting}
          className="w-full justify-center gap-3"
          variant="outline"
          size="md"
        >
          <FontAwesomeIcon icon={faGoogle} />
          Sign in with Google
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;
