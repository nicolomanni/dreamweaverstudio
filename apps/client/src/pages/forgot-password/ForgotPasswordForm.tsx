import { FormEvent, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { sendPasswordReset } from '../../auth';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await sendPasswordReset(email);
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to send password reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-lg dw-fade-up">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="DreamWeaver Studio" className="h-12 w-12" />
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-foreground/60">
              DreamWeaver
            </p>
            <p className="text-sm font-semibold text-foreground">Studio</p>
          </div>
        </div>
        <div className="mt-8">
          <h1 className="text-3xl font-semibold text-foreground">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-foreground/60">
            We've sent a password reset link to your email address.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm">
            <Link
              to="/"
              className="font-semibold text-primary hover:text-primary/90"
            >
              Back to login
            </Link>
            <span className="text-foreground/30">•</span>
            <a
              href="mailto:support@dreamweaver.studio"
              className="text-foreground/70 hover:text-foreground"
            >
              Need help? Contact support
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg dw-fade-up">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="DreamWeaver Studio" className="h-12 w-12" />
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-foreground/60">
            DreamWeaver
          </p>
          <p className="text-sm font-semibold text-foreground">Studio</p>
        </div>
      </div>
      <div className="mt-8">
        <h1 className="text-3xl font-semibold text-foreground">
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm text-foreground/60">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>
      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="email-address" className="dw-label">
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
            disabled={isSubmitting}
            className="dw-input"
            placeholder="name@example.com"
          />
        </div>
        {error ? <p className="text-xs text-rose-400">{error}</p> : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="dw-btn dw-btn-md dw-btn-primary w-full"
        >
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
