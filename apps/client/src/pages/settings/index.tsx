import { useEffect, useState } from 'react';
import { DashboardLayout } from '@dreamweaverstudio/client-ui';
import {
  fetchIntegrationSettings,
  fetchStripeBalance,
  updateDeviantArtSettings,
  updateGeminiSettings,
  updateStripeSettings,
  fetchStudioSettings,
  fetchUserProfile,
  updateStudioSettings,
  updateUserProfile,
  firebaseApp,
} from '@dreamweaverstudio/client-data-access-api';
import { onAuthChange, signOutUser } from '../../auth';
import { useNavigate } from '@tanstack/react-router';
import {
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  User,
  Zap,
} from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

const Toggle = ({
  enabled,
  onChange,
  label,
  disabled = false,
}: {
  enabled: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    disabled={disabled}
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black ${
      enabled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
    } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
  >
    <span className="sr-only">{label}</span>
    <span
      aria-hidden="true"
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
  );

const UnsavedBadge = ({ show }: { show: boolean }) =>
  show ? (
    <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">
      <span className="h-2 w-2 rounded-full bg-amber-500" />
      Unsaved
    </span>
  ) : null;

const SettingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<
    'general' | 'profile' | 'integrations'
  >('general');
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [stripeSecret, setStripeSecret] = useState('');
  const [stripeHasSecret, setStripeHasSecret] = useState(false);
  const [stripeBalance, setStripeBalance] = useState<string>('—');
  const [geminiEnabled, setGeminiEnabled] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [geminiHasKey, setGeminiHasKey] = useState(false);
  const [deviantEnabled, setDeviantEnabled] = useState(false);
  const [deviantClientId, setDeviantClientId] = useState('');
  const [deviantClientSecret, setDeviantClientSecret] = useState('');
  const [deviantHasSecret, setDeviantHasSecret] = useState(false);
  const [studioDisplayName, setStudioDisplayName] = useState(
    'hello@dreamweavercomics.art',
  );
  const [studioEmail, setStudioEmail] = useState('hello@dreamweavercomics.art');
  const [studioName, setStudioName] = useState('DreamWeaverComics');
  const [studioTimezone, setStudioTimezone] = useState('Europe/Rome');
  const [savingStudio, setSavingStudio] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingIntegrations, setSavingIntegrations] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<
    { id: number; type: 'success' | 'error'; message: string }[]
  >([]);
  const [initialStudio, setInitialStudio] = useState<{
    displayName: string;
    email: string;
    studioName: string;
    timezone: string;
  } | null>(null);
  const [initialProfile, setInitialProfile] = useState<{
    displayName: string;
    email: string;
    avatarUrl?: string;
  } | null>(null);
  const [initialIntegrations, setInitialIntegrations] = useState<{
    stripeEnabled: boolean;
    stripeSecret: string;
    geminiEnabled: boolean;
    geminiKey: string;
    deviantEnabled: boolean;
    deviantClientId: string;
    deviantClientSecret: string;
  } | null>(null);
  const [userName, setUserName] = useState('DreamWeaver User');
  const [userEmail, setUserEmail] = useState('user@dreamweaver.studio');
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>();
  const [profileDisplayName, setProfileDisplayName] = useState('DreamWeaver User');
  const [profileEmail, setProfileEmail] = useState('user@dreamweaver.studio');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | undefined>();

  const MASKED_VALUE = '••••••••';
  const stripeActive = stripeEnabled && stripeHasSecret;
  const geminiActive = geminiEnabled && geminiHasKey;
  const deviantActive = deviantEnabled && deviantHasSecret;
  const studioDisabled = loading || savingStudio;
  const profileDisabled = loading || savingProfile || uploadingAvatar;
  const integrationsDisabled = loading || savingIntegrations;
  const isStudioDirty = Boolean(
    initialStudio &&
      (studioDisplayName !== initialStudio.displayName ||
        studioEmail !== initialStudio.email ||
        studioName !== initialStudio.studioName ||
        studioTimezone !== initialStudio.timezone),
  );
  const isProfileDirty = Boolean(
    initialProfile &&
      (profileDisplayName !== initialProfile.displayName ||
        profileEmail !== initialProfile.email ||
        (profileAvatarUrl ?? '') !== (initialProfile.avatarUrl ?? '')),
  );
  const isIntegrationsDirty = Boolean(
    initialIntegrations &&
      (stripeEnabled !== initialIntegrations.stripeEnabled ||
        stripeSecret !== initialIntegrations.stripeSecret ||
        geminiEnabled !== initialIntegrations.geminiEnabled ||
        geminiKey !== initialIntegrations.geminiKey ||
        deviantEnabled !== initialIntegrations.deviantEnabled ||
        deviantClientId !== initialIntegrations.deviantClientId ||
        deviantClientSecret !== initialIntegrations.deviantClientSecret),
  );

  const pushToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3200);
    }
  };

  const resolveSectionFromHash = (hash: string) => {
    const value = hash.replace('#', '');
    if (value === 'profile' || value === 'integrations' || value === 'general') {
      return value;
    }
    return 'general';
  };

  const syncSectionToHash = (section: 'general' | 'profile' | 'integrations') => {
    if (typeof window === 'undefined') return;
    window.location.hash = section;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const applyHash = () => {
      const resolved = resolveSectionFromHash(window.location.hash);
      setActiveSection(resolved);
      if (!window.location.hash) {
        window.location.hash = resolved;
      }
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const settings = await fetchIntegrationSettings();
        if (!mounted) return;
        setStripeEnabled(settings.stripe.enabled);
        setStripeHasSecret(settings.stripe.hasSecret);
        const stripeMasked = settings.stripe.hasSecret ? MASKED_VALUE : '';
        setStripeSecret(stripeMasked);
        setGeminiEnabled(settings.gemini.enabled);
        setGeminiHasKey(settings.gemini.hasSecret);
        const geminiMasked = settings.gemini.hasSecret ? MASKED_VALUE : '';
        setGeminiKey(geminiMasked);
        setDeviantEnabled(settings.deviantArt.enabled);
        setDeviantHasSecret(settings.deviantArt.hasSecret);
        const deviantMasked = settings.deviantArt.hasSecret ? MASKED_VALUE : '';
        setDeviantClientId(deviantMasked);
        setDeviantClientSecret(deviantMasked);
        setInitialIntegrations({
          stripeEnabled: settings.stripe.enabled,
          stripeSecret: stripeMasked,
          geminiEnabled: settings.gemini.enabled,
          geminiKey: geminiMasked,
          deviantEnabled: settings.deviantArt.enabled,
          deviantClientId: deviantMasked,
          deviantClientSecret: deviantMasked,
        });
        if (settings.stripe.enabled) {
          const balance = await fetchStripeBalance();
          if (mounted && balance.enabled && balance.available !== undefined) {
            const formatted = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: balance.currency ?? 'USD',
            }).format(balance.available / 100);
            setStripeBalance(formatted);
          }
        }
      } catch (err) {
        if (mounted) {
          if (await handleUnauthorized(err)) return;
          setError('Unable to load integration settings.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (!user) return;
      setUserName(user.displayName || user.email || 'DreamWeaver User');
      setUserEmail(user.email || 'user@dreamweaver.studio');
      setUserAvatarUrl(user.photoURL || undefined);
      setProfileDisplayName(user.displayName || user.email || 'DreamWeaver User');
      setProfileEmail(user.email || 'user@dreamweaver.studio');
      setProfileAvatarUrl(user.photoURL || undefined);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      try {
        const studio = await fetchStudioSettings();
        if (mounted) {
          setStudioDisplayName(studio.displayName);
          setStudioEmail(studio.email);
          setStudioName(studio.studioName);
          setStudioTimezone(studio.timezone);
          setInitialStudio({
            displayName: studio.displayName,
            email: studio.email,
            studioName: studio.studioName,
            timezone: studio.timezone,
          });
        }
      } catch (err) {
        if (mounted) {
          if (await handleUnauthorized(err)) return;
          setError('Unable to load studio settings.');
        }
      }
    };
    loadSettings();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      if (!userEmail) return;
      try {
        const profile = await fetchUserProfile();
        if (!mounted || !profile) return;
        setProfileDisplayName(profile.displayName);
        setProfileEmail(profile.email);
        setProfileAvatarUrl(profile.avatarUrl);
        setInitialProfile({
          displayName: profile.displayName,
          email: profile.email,
          avatarUrl: profile.avatarUrl,
        });
      } catch (err) {
        if (mounted) {
          if (await handleUnauthorized(err)) return;
          setError('Unable to load user profile.');
        }
      }
    };
    loadProfile();
    return () => {
      mounted = false;
    };
  }, [userEmail]);

  const handleLogout = async () => {
    await signOutUser();
    await navigate({ to: '/' });
  };

  const handleUnauthorized = async (err: unknown) => {
    if (err instanceof Error && err.message === 'unauthorized') {
      await signOutUser();
      await navigate({ to: '/' });
      return true;
    }
    return false;
  };

  const handleIntegrationsSave = async () => {
    setSavingIntegrations(true);
    setError(null);
    try {
      const stripeSecretValue =
        stripeSecret && stripeSecret !== MASKED_VALUE ? stripeSecret : undefined;
      const geminiKeyValue =
        geminiKey && geminiKey !== MASKED_VALUE ? geminiKey : undefined;
      const deviantClientIdValue =
        deviantClientId && deviantClientId !== MASKED_VALUE
          ? deviantClientId
          : undefined;
      const deviantClientSecretValue =
        deviantClientSecret && deviantClientSecret !== MASKED_VALUE
          ? deviantClientSecret
          : undefined;

      const stripe = await updateStripeSettings({
        enabled: stripeEnabled,
        secretKey: stripeSecretValue,
      });
      const stripeMasked = stripe.hasSecret ? MASKED_VALUE : '';
      setStripeEnabled(stripe.enabled);
      setStripeHasSecret(stripe.hasSecret);
      setStripeSecret(stripeMasked);

      const gemini = await updateGeminiSettings({
        enabled: geminiEnabled,
        apiKey: geminiKeyValue,
      });
      const geminiMasked = gemini.hasSecret ? MASKED_VALUE : '';
      setGeminiEnabled(gemini.enabled);
      setGeminiHasKey(gemini.hasSecret);
      setGeminiKey(geminiMasked);

      const deviant = await updateDeviantArtSettings({
        enabled: deviantEnabled,
        clientId: deviantClientIdValue,
        clientSecret: deviantClientSecretValue,
      });
      const deviantMasked = deviant.hasSecret ? MASKED_VALUE : '';
      setDeviantEnabled(deviant.enabled);
      setDeviantHasSecret(deviant.hasSecret);
      setDeviantClientId(deviantMasked);
      setDeviantClientSecret(deviantMasked);
      setInitialIntegrations({
        stripeEnabled: stripe.enabled,
        stripeSecret: stripeMasked,
        geminiEnabled: gemini.enabled,
        geminiKey: geminiMasked,
        deviantEnabled: deviant.enabled,
        deviantClientId: deviantMasked,
        deviantClientSecret: deviantMasked,
      });

      if (stripe.enabled && stripe.hasSecret) {
        const balance = await fetchStripeBalance();
        if (balance.enabled && balance.available !== undefined) {
          const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: balance.currency ?? 'USD',
          }).format(balance.available / 100);
          setStripeBalance(formatted);
        }
      }
      pushToast('success', 'Integrations updated successfully.');
    } catch (err) {
      if (await handleUnauthorized(err)) return;
      setError('Unable to save integration settings.');
      pushToast('error', 'Failed to update integrations.');
    } finally {
      setSavingIntegrations(false);
    }
  };

  const handleStudioSave = async () => {
    setSavingStudio(true);
    setError(null);
    try {
      const updated = await updateStudioSettings({
        displayName: studioDisplayName,
        email: studioEmail,
        studioName,
        timezone: studioTimezone,
      });
      setStudioDisplayName(updated.displayName);
      setStudioEmail(updated.email);
      setStudioName(updated.studioName);
      setStudioTimezone(updated.timezone);
      setInitialStudio({
        displayName: updated.displayName,
        email: updated.email,
        studioName: updated.studioName,
        timezone: updated.timezone,
      });
      pushToast('success', 'Studio settings saved.');
    } catch (err) {
      if (await handleUnauthorized(err)) return;
      setError('Unable to save studio settings.');
      pushToast('error', 'Failed to save studio settings.');
    } finally {
      setSavingStudio(false);
    }
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    setError(null);
    try {
      const updated = await updateUserProfile({
        displayName: profileDisplayName,
        email: profileEmail,
        avatarUrl: profileAvatarUrl,
      });
      setProfileDisplayName(updated.displayName);
      setProfileEmail(updated.email);
      setProfileAvatarUrl(updated.avatarUrl);
      setInitialProfile({
        displayName: updated.displayName,
        email: updated.email,
        avatarUrl: updated.avatarUrl,
      });
      pushToast('success', 'Profile updated successfully.');
    } catch (err) {
      if (await handleUnauthorized(err)) return;
      setError('Unable to save user profile.');
      pushToast('error', 'Failed to save profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    setError(null);
    try {
      const auth = getAuth(firebaseApp);
      const user = auth.currentUser;
      if (!user) {
        throw new Error('unauthorized');
      }
      const storage = getStorage(firebaseApp);
      const avatarRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(avatarRef, file);
      const url = await getDownloadURL(avatarRef);
      setProfileAvatarUrl(url);
      pushToast('success', 'Avatar uploaded successfully.');
    } catch (err) {
      if (await handleUnauthorized(err)) return;
      setError('Unable to upload avatar.');
      pushToast('error', 'Failed to upload avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <DashboardLayout
      projectTitle="DreamWeaverComics Studio"
      credits={1240}
      activeNav="settings"
      onLogout={handleLogout}
      userName={userName}
      userEmail={userEmail}
      userAvatarUrl={userAvatarUrl}
    >
      <div className="pointer-events-none fixed right-6 top-6 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${
              toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
                : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200'
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            {toast.message}
          </div>
        ))}
      </div>
      <section className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-border dark:bg-card">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
            Settings
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-foreground">
            Account
          </h2>
          <nav className="mt-6 space-y-2">
            {[
              { label: 'General', icon: SlidersHorizontal, id: 'general' as const },
              { label: 'Profile', icon: User, id: 'profile' as const },
              { label: 'Integrations', icon: Zap, id: 'integrations' as const },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.id);
                    syncSectionToHash(item.id);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-foreground/70 dark:hover:bg-background/80'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="space-y-6">
          {activeSection === 'general' ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
                    General
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-foreground">
                    Studio settings
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <UnsavedBadge show={isStudioDirty} />
                  <button
                    type="button"
                    onClick={handleStudioSave}
                    disabled={studioDisabled}
                    className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingStudio ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </span>
                    ) : (
                      'Save studio'
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                    Display name
                  </label>
                  <input
                    type="text"
                    value={studioDisplayName}
                    onChange={(event) => setStudioDisplayName(event.target.value)}
                    disabled={studioDisabled}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none dark:border-border dark:bg-background dark:text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                    Email
                  </label>
                  <input
                    type="email"
                    value={studioEmail}
                    onChange={(event) => setStudioEmail(event.target.value)}
                    disabled={studioDisabled}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none dark:border-border dark:bg-background dark:text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                    Studio name
                  </label>
                  <input
                    type="text"
                    value={studioName}
                    onChange={(event) => setStudioName(event.target.value)}
                    disabled={studioDisabled}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none dark:border-border dark:bg-background dark:text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={studioTimezone}
                    onChange={(event) => setStudioTimezone(event.target.value)}
                    disabled={studioDisabled}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none dark:border-border dark:bg-background dark:text-foreground"
                  />
                </div>
              </div>
            </div>
          ) : activeSection === 'profile' ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
                    Profile
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-foreground">
                    User preferences
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <UnsavedBadge show={isProfileDirty} />
                  <button
                    type="button"
                    onClick={handleProfileSave}
                    disabled={profileDisabled}
                    className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingProfile ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </span>
                    ) : (
                      'Save profile'
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-600 dark:border-border dark:bg-background dark:text-foreground/70">
                  {profileAvatarUrl ? (
                    <img
                      src={profileAvatarUrl}
                      alt={profileDisplayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    profileDisplayName
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
                    {userName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-foreground/60">
                    {userEmail}
                  </p>
                </div>
                <label
                  className={`ml-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 transition-colors hover:bg-white dark:border-border dark:bg-background dark:text-foreground/70 ${
                    profileDisabled ? 'pointer-events-none opacity-60' : 'cursor-pointer'
                  }`}
                >
                  {uploadingAvatar ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Uploading...
                    </>
                  ) : (
                    'Upload avatar'
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        handleAvatarUpload(file);
                      }
                    }}
                  />
                </label>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                    Display name
                  </label>
                  <input
                    type="text"
                    value={profileDisplayName}
                    onChange={(event) => setProfileDisplayName(event.target.value)}
                    disabled={profileDisabled}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none dark:border-border dark:bg-background dark:text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(event) => setProfileEmail(event.target.value)}
                    disabled={profileDisabled}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none dark:border-border dark:bg-background dark:text-foreground"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
                    Integrations
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-foreground">
                    Plug &amp; play providers
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 dark:text-foreground/60">
                    Toggle providers on or off
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <UnsavedBadge show={isIntegrationsDirty} />
                  <button
                    type="button"
                    onClick={handleIntegrationsSave}
                    disabled={integrationsDisabled}
                    className="rounded-full bg-primary px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingIntegrations ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </span>
                    ) : (
                      'Save integrations'
                    )}
                  </button>
                </div>
              </div>
              {error ? (
                <p className="mt-4 text-sm text-rose-500">{error}</p>
              ) : null}
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-border dark:bg-background">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
                        Stripe
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-foreground">
                        Billing &amp; payouts
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-foreground/60">
                        {stripeActive ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-slate-400" />
                        )}
                        <span>{stripeActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                    <Toggle
                      enabled={stripeEnabled}
                      onChange={() => setStripeEnabled((prev) => !prev)}
                      label="Enable Stripe integration"
                      disabled={integrationsDisabled}
                    />
                  </div>
                  {stripeEnabled ? (
                    <div className="mt-4 space-y-3">
                      <input
                        type="password"
                        placeholder="Enter secret key"
                        value={stripeSecret}
                        onChange={(event) => setStripeSecret(event.target.value)}
                        onFocus={() => {
                          if (stripeSecret === MASKED_VALUE) {
                            setStripeSecret('');
                          }
                        }}
                        disabled={integrationsDisabled}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none dark:border-border dark:bg-card dark:text-foreground"
                      />
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-foreground/60">
                        <span>Available balance</span>
                        <span className="font-semibold text-slate-900 dark:text-foreground">
                          {stripeBalance}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-xs text-slate-500 dark:text-foreground/60">
                      Enable Stripe to configure keys and view balance.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 dark:border-border dark:bg-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
                        Gemini
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-foreground">
                        AI Story Engine
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-foreground/60">
                        {geminiActive ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-slate-400" />
                        )}
                        <span>{geminiActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                    <Toggle
                      enabled={geminiEnabled}
                      onChange={() => setGeminiEnabled((prev) => !prev)}
                      label="Enable Gemini integration"
                      disabled={integrationsDisabled}
                    />
                  </div>
                  {geminiEnabled ? (
                    <div className="mt-4 space-y-3">
                      <input
                        type="password"
                        placeholder="Enter API key"
                        value={geminiKey}
                        onChange={(event) => setGeminiKey(event.target.value)}
                        onFocus={() => {
                          if (geminiKey === MASKED_VALUE) {
                            setGeminiKey('');
                          }
                        }}
                        disabled={integrationsDisabled}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none dark:border-border dark:bg-card dark:text-foreground"
                      />
                    </div>
                  ) : (
                    <p className="mt-4 text-xs text-slate-500 dark:text-foreground/60">
                      Enable Gemini to configure the API key.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 dark:border-border dark:bg-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
                        DeviantArt
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-foreground">
                        Inspiration feed
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-foreground/60">
                        {deviantActive ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-slate-400" />
                        )}
                        <span>{deviantActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                    <Toggle
                      enabled={deviantEnabled}
                      onChange={() => setDeviantEnabled((prev) => !prev)}
                      label="Enable DeviantArt integration"
                      disabled={integrationsDisabled}
                    />
                  </div>
                  {deviantEnabled ? (
                    <div className="mt-4 space-y-3">
                      <input
                        type="text"
                        placeholder="Enter client ID"
                        value={deviantClientId}
                        onChange={(event) => setDeviantClientId(event.target.value)}
                        onFocus={() => {
                          if (deviantClientId === MASKED_VALUE) {
                            setDeviantClientId('');
                          }
                        }}
                        disabled={integrationsDisabled}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none dark:border-border dark:bg-card dark:text-foreground"
                      />
                      <input
                        type="password"
                        placeholder="Enter client secret"
                        value={deviantClientSecret}
                        onChange={(event) => setDeviantClientSecret(event.target.value)}
                        onFocus={() => {
                          if (deviantClientSecret === MASKED_VALUE) {
                            setDeviantClientSecret('');
                          }
                        }}
                        disabled={integrationsDisabled}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none dark:border-border dark:bg-card dark:text-foreground"
                      />
                    </div>
                  ) : (
                    <p className="mt-4 text-xs text-slate-500 dark:text-foreground/60">
                      Enable DeviantArt to configure credentials.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
};

export default SettingsPage;
