import { useEffect, useMemo, useState } from 'react';
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
  type IntegrationSettingsResponse,
} from '@dreamweaverstudio/client-data-access-api';
import { signOutUser } from '../../auth';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  ChevronDown,
  Lock,
  PencilLine,
  X,
  XCircle,
  SlidersHorizontal,
  User,
  Zap,
} from 'lucide-react';
import {
  Avatar,
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  HelperText,
  IconButton,
  Input,
  Label,
  Select,
  useToast,
  Switch,
  Textarea,
} from '@dreamweaverstudio/client-ui';
import { getAuth } from 'firebase/auth';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { formatCurrency, normalizeCurrency } from '../../utils/currency';
import { useAuthUser } from '../../hooks/useAuthUser';

const STRIPE_CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
];

const NUMBER_FORMAT_OPTIONS = [
  { value: 'en-US', label: 'English (1,234.56)' },
  { value: 'it-IT', label: 'Italiano (1.234,56)' },
  { value: 'de-DE', label: 'Deutsch (1.234,56)' },
];

const GEMINI_MODEL_OPTIONS = [
  { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (Preview)' },
  { value: 'gemini-3-pro-image-preview', label: 'Gemini 3 Pro Image (Preview)' },
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (Preview)' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  {
    value: 'gemini-2.5-pro-preview-tts',
    label: 'Gemini 2.5 Pro TTS (Preview)',
  },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  {
    value: 'gemini-2.5-flash-preview-09-2025',
    label: 'Gemini 2.5 Flash (Preview 09/2025)',
  },
  {
    value: 'gemini-2.5-flash-image',
    label: 'Gemini 2.5 Flash Image',
  },
  {
    value: 'gemini-2.5-flash-native-audio-preview-12-2025',
    label: 'Gemini 2.5 Flash Live Audio (Preview 12/2025)',
  },
  {
    value: 'gemini-2.5-flash-preview-tts',
    label: 'Gemini 2.5 Flash TTS (Preview)',
  },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite' },
  {
    value: 'gemini-2.5-flash-lite-preview-09-2025',
    label: 'Gemini 2.5 Flash-Lite (Preview 09/2025)',
  },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Deprecated)' },
  {
    value: 'gemini-2.0-flash-001',
    label: 'Gemini 2.0 Flash 001 (Deprecated)',
  },
  {
    value: 'gemini-2.0-flash-exp',
    label: 'Gemini 2.0 Flash Experimental (Deprecated)',
  },
  {
    value: 'gemini-2.0-flash-lite',
    label: 'Gemini 2.0 Flash-Lite (Deprecated)',
  },
  {
    value: 'gemini-2.0-flash-lite-001',
    label: 'Gemini 2.0 Flash-Lite 001 (Deprecated)',
  },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Legacy)' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Legacy)' },
];

const GEMINI_SAFETY_OPTIONS = [
  { value: 'strict', label: 'Strict' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'relaxed', label: 'Relaxed' },
];

const UnsavedBadge = ({ show }: { show: boolean }) =>
  show ? (
    <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400">
      <span className="h-2 w-2 rounded-full bg-amber-500" />
      Unsaved
    </span>
  ) : null;

const SettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<
    'general' | 'profile' | 'integrations'
  >('general');
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [stripeSecret, setStripeSecret] = useState('');
  const [stripeHasSecret, setStripeHasSecret] = useState(false);
  const [stripeKeyEditable, setStripeKeyEditable] = useState(true);
  const [stripeDefaultCurrency, setStripeDefaultCurrency] = useState('USD');
  const [geminiEnabled, setGeminiEnabled] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [geminiHasKey, setGeminiHasKey] = useState(false);
  const [geminiKeyEditable, setGeminiKeyEditable] = useState(true);
  const [geminiModel, setGeminiModel] = useState('gemini-1.5-pro');
  const [geminiTemperature, setGeminiTemperature] = useState(0.7);
  const [geminiMaxTokens, setGeminiMaxTokens] = useState(2048);
  const [geminiSafetyEnabled, setGeminiSafetyEnabled] = useState(true);
  const [geminiSafetyPreset, setGeminiSafetyPreset] = useState<
    'strict' | 'balanced' | 'relaxed'
  >('balanced');
  const [geminiSystemPrompt, setGeminiSystemPrompt] = useState('');
  const [geminiStreaming, setGeminiStreaming] = useState(true);
  const [geminiTimeoutSec, setGeminiTimeoutSec] = useState(60);
  const [geminiRetryCount, setGeminiRetryCount] = useState(2);
  const [deviantEnabled, setDeviantEnabled] = useState(false);
  const [deviantClientId, setDeviantClientId] = useState('');
  const [deviantClientSecret, setDeviantClientSecret] = useState('');
  const [deviantHasSecret, setDeviantHasSecret] = useState(false);
  const [deviantKeyEditable, setDeviantKeyEditable] = useState(true);
  const [studioDisplayName, setStudioDisplayName] = useState(
    'hello@dreamweavercomics.art',
  );
  const [studioEmail, setStudioEmail] = useState('hello@dreamweavercomics.art');
  const [studioName, setStudioName] = useState('DreamWeaverComics');
  const [studioTimezone, setStudioTimezone] = useState('Europe/Rome');
  const [numberFormatLocale, setNumberFormatLocale] = useState('en-US');
  const [creditAlertThreshold, setCreditAlertThreshold] = useState(200);
  const [savingStudio, setSavingStudio] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingIntegrations, setSavingIntegrations] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { pushToast } = useToast();
  const [initialStudio, setInitialStudio] = useState<{
    displayName: string;
    email: string;
    studioName: string;
    timezone: string;
    numberFormatLocale: string;
    creditAlertThreshold: number;
  } | null>(null);
  const [initialProfile, setInitialProfile] = useState<{
    displayName: string;
    email: string;
    avatarUrl?: string;
  } | null>(null);
  const [initialIntegrations, setInitialIntegrations] = useState<{
    stripeEnabled: boolean;
    stripeSecret: string;
    stripeDefaultCurrency: string;
    geminiEnabled: boolean;
    geminiKey: string;
    geminiModel: string;
    geminiTemperature: number;
    geminiMaxTokens: number;
    geminiSafetyEnabled: boolean;
    geminiSafetyPreset: 'strict' | 'balanced' | 'relaxed';
    geminiSystemPrompt: string;
    geminiStreaming: boolean;
    geminiTimeoutSec: number;
    geminiRetryCount: number;
    deviantEnabled: boolean;
    deviantClientId: string;
    deviantClientSecret: string;
  } | null>(null);
  const [profileDisplayName, setProfileDisplayName] = useState('DreamWeaver User');
  const [profileEmail, setProfileEmail] = useState('user@dreamweaver.studio');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | undefined>();
  const { user } = useAuthUser();
  const hasUser = Boolean(user);
  const userName = user?.displayName || user?.email || 'DreamWeaver User';
  const userEmail = user?.email || 'user@dreamweaver.studio';

  const integrationsQuery = useQuery({
    queryKey: ['integrationSettings'],
    queryFn: fetchIntegrationSettings,
  });

  const studioQuery = useQuery({
    queryKey: ['studioSettings'],
    queryFn: fetchStudioSettings,
  });

  const profileQuery = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    enabled: hasUser,
  });

  const stripeBalanceQuery = useQuery({
    queryKey: ['stripeBalance'],
    queryFn: fetchStripeBalance,
    enabled: integrationsQuery.data?.stripe.enabled === true,
    staleTime: 60 * 1000,
  });

  const loading =
    integrationsQuery.isLoading ||
    studioQuery.isLoading ||
    profileQuery.isLoading;

  const stripeBalanceAmount =
    integrationsQuery.data?.stripe.enabled &&
    stripeBalanceQuery.data?.enabled &&
    stripeBalanceQuery.data.available !== undefined
      ? stripeBalanceQuery.data.available
      : null;


  const MASKED_VALUE = '••••••••';
  const stripeActive = stripeEnabled && stripeHasSecret;
  const geminiActive = geminiEnabled && geminiHasKey;
  const deviantActive = deviantEnabled && deviantHasSecret;
  const studioDisabled = loading || savingStudio;
  const profileDisabled = loading || savingProfile || uploadingAvatar;
  const integrationsDisabled = loading || savingIntegrations;
  const stripeBalance =
    stripeBalanceAmount !== null
      ? formatCurrency(
          stripeBalanceAmount / 100,
          stripeDefaultCurrency,
          {},
          numberFormatLocale,
        )
      : '—';
  const isStudioDirty = Boolean(
    initialStudio &&
      (studioDisplayName !== initialStudio.displayName ||
        studioEmail !== initialStudio.email ||
        studioName !== initialStudio.studioName ||
        studioTimezone !== initialStudio.timezone ||
        numberFormatLocale !== initialStudio.numberFormatLocale),
  );
  const creditAlertDirty = Boolean(
    initialStudio &&
      creditAlertThreshold !== initialStudio.creditAlertThreshold,
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
        stripeDefaultCurrency !== initialIntegrations.stripeDefaultCurrency ||
        geminiEnabled !== initialIntegrations.geminiEnabled ||
        geminiKey !== initialIntegrations.geminiKey ||
        geminiModel !== initialIntegrations.geminiModel ||
        geminiTemperature !== initialIntegrations.geminiTemperature ||
        geminiMaxTokens !== initialIntegrations.geminiMaxTokens ||
        geminiSafetyEnabled !== initialIntegrations.geminiSafetyEnabled ||
        geminiSafetyPreset !== initialIntegrations.geminiSafetyPreset ||
        geminiSystemPrompt !== initialIntegrations.geminiSystemPrompt ||
        geminiStreaming !== initialIntegrations.geminiStreaming ||
        geminiTimeoutSec !== initialIntegrations.geminiTimeoutSec ||
        geminiRetryCount !== initialIntegrations.geminiRetryCount ||
        deviantEnabled !== initialIntegrations.deviantEnabled ||
        deviantClientId !== initialIntegrations.deviantClientId ||
        deviantClientSecret !== initialIntegrations.deviantClientSecret ||
        creditAlertDirty),
  );

  const geminiModelOptions = useMemo(() => {
    if (!geminiModel) return GEMINI_MODEL_OPTIONS;
    const exists = GEMINI_MODEL_OPTIONS.some(
      (option) => option.value === geminiModel,
    );
    if (exists) return GEMINI_MODEL_OPTIONS;
    return [
      { value: geminiModel, label: `Current (${geminiModel})` },
      ...GEMINI_MODEL_OPTIONS,
    ];
  }, [geminiModel]);

  const stripeCurrencyOptions = useMemo(() => {
    const normalized = normalizeCurrency(stripeDefaultCurrency);
    const exists = STRIPE_CURRENCY_OPTIONS.some(
      (option) => option.value === normalized,
    );
    if (exists) return STRIPE_CURRENCY_OPTIONS;
    return [
      { value: normalized, label: `Current (${normalized})` },
      ...STRIPE_CURRENCY_OPTIONS,
    ];
  }, [stripeDefaultCurrency]);

  const numberFormatOptions = useMemo(() => {
    const normalized = numberFormatLocale || 'en-US';
    const exists = NUMBER_FORMAT_OPTIONS.some(
      (option) => option.value === normalized,
    );
    if (exists) return NUMBER_FORMAT_OPTIONS;
    return [
      { value: normalized, label: `Current (${normalized})` },
      ...NUMBER_FORMAT_OPTIONS,
    ];
  }, [numberFormatLocale]);

  useEffect(() => {
    const sectionLabel =
      activeSection === 'profile'
        ? 'Profile'
        : activeSection === 'integrations'
          ? 'Integrations'
          : 'Settings';
    document.title = `${sectionLabel} — DreamWeaverComics Studio`;
  }, [activeSection]);

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
    if (!location.pathname.startsWith('/settings')) {
      return;
    }
    const hash = location.hash ?? '';
    const resolved = resolveSectionFromHash(hash);
    setActiveSection((prev) => (prev === resolved ? prev : resolved));
    if (!hash) {
      const { pathname, search } = window.location;
      window.history.replaceState(null, '', `${pathname}${search}#${resolved}`);
    }
  }, [location.hash, location.pathname, location.search]);

  useEffect(() => {
    const settings = integrationsQuery.data;
    if (!settings || isIntegrationsDirty) return;
    setStripeEnabled(settings.stripe.enabled);
    setStripeHasSecret(settings.stripe.hasSecret);
    const stripeMasked = settings.stripe.hasSecret ? MASKED_VALUE : '';
    setStripeSecret(stripeMasked);
    setStripeKeyEditable(!settings.stripe.hasSecret);
    const stripeCurrency = normalizeCurrency(settings.stripe.defaultCurrency);
    setStripeDefaultCurrency(stripeCurrency);
    const geminiState = applyGeminiSettings(settings.gemini);
    setDeviantEnabled(settings.deviantArt.enabled);
    setDeviantHasSecret(settings.deviantArt.hasSecret);
    const deviantMasked = settings.deviantArt.hasSecret ? MASKED_VALUE : '';
    setDeviantClientId(deviantMasked);
    setDeviantClientSecret(deviantMasked);
    setDeviantKeyEditable(!settings.deviantArt.hasSecret);
    setInitialIntegrations({
      stripeEnabled: settings.stripe.enabled,
      stripeSecret: stripeMasked,
      stripeDefaultCurrency: stripeCurrency,
      geminiEnabled: geminiState.enabled,
      geminiKey: geminiState.masked,
      geminiModel: geminiState.model,
      geminiTemperature: geminiState.temperature,
      geminiMaxTokens: geminiState.maxOutputTokens,
      geminiSafetyEnabled: geminiState.safetyEnabled,
      geminiSafetyPreset: geminiState.safetyPreset,
      geminiSystemPrompt: geminiState.systemPrompt,
      geminiStreaming: geminiState.streaming,
      geminiTimeoutSec: geminiState.timeoutSec,
      geminiRetryCount: geminiState.retryCount,
      deviantEnabled: settings.deviantArt.enabled,
      deviantClientId: deviantMasked,
      deviantClientSecret: deviantMasked,
    });
  }, [integrationsQuery.data, isIntegrationsDirty]);

  useEffect(() => {
    if (integrationsQuery.error) {
      void handleUnauthorized(integrationsQuery.error).then((handled) => {
        if (!handled) {
          setError('Unable to load integration settings.');
        }
      });
    }
  }, [integrationsQuery.error]);

  useEffect(() => {
    if (!user || isProfileDirty) return;
    if (!profileQuery.data) {
      setProfileDisplayName(user.displayName || user.email || 'DreamWeaver User');
      setProfileEmail(user.email || 'user@dreamweaver.studio');
      setProfileAvatarUrl(user.photoURL || undefined);
    }
  }, [user, profileQuery.data, isProfileDirty]);

  useEffect(() => {
    const studio = studioQuery.data;
    if (!studio || isStudioDirty) return;
    setStudioDisplayName(studio.displayName);
    setStudioEmail(studio.email);
    setStudioName(studio.studioName);
    setStudioTimezone(studio.timezone);
    setNumberFormatLocale(studio.numberFormatLocale ?? 'en-US');
    setCreditAlertThreshold(studio.creditAlertThreshold ?? 200);
    setInitialStudio({
      displayName: studio.displayName,
      email: studio.email,
      studioName: studio.studioName,
      timezone: studio.timezone,
      numberFormatLocale: studio.numberFormatLocale ?? 'en-US',
      creditAlertThreshold: studio.creditAlertThreshold ?? 200,
    });
  }, [studioQuery.data, isStudioDirty]);

  useEffect(() => {
    if (studioQuery.error) {
      void handleUnauthorized(studioQuery.error).then((handled) => {
        if (!handled) {
          setError('Unable to load studio settings.');
        }
      });
    }
  }, [studioQuery.error]);

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile || isProfileDirty) return;
    setProfileDisplayName(profile.displayName);
    setProfileEmail(profile.email);
    setProfileAvatarUrl(profile.avatarUrl);
    setInitialProfile({
      displayName: profile.displayName,
      email: profile.email,
      avatarUrl: profile.avatarUrl,
    });
  }, [profileQuery.data, isProfileDirty]);

  useEffect(() => {
    if (profileQuery.error) {
      void handleUnauthorized(profileQuery.error).then((handled) => {
        if (!handled) {
          setError('Unable to load user profile.');
        }
      });
    }
  }, [profileQuery.error]);

  const handleUnauthorized = async (err: unknown) => {
    if (err instanceof Error && err.message === 'unauthorized') {
      await signOutUser();
      await navigate({ to: '/' });
      return true;
    }
    return false;
  };

  const applyGeminiSettings = (gemini: IntegrationSettingsResponse['gemini']) => {
    const masked = gemini.hasSecret ? MASKED_VALUE : '';
    const model = gemini.model ?? 'gemini-1.5-pro';
    const temperature = gemini.temperature ?? 0.7;
    const maxOutputTokens = gemini.maxOutputTokens ?? 2048;
    const safetyPreset = gemini.safetyPreset ?? 'balanced';
    const safetyEnabled = Boolean(gemini.safetyPreset);
    const systemPrompt = gemini.systemPrompt ?? '';
    const streaming = gemini.streaming ?? true;
    const timeoutSec = gemini.timeoutSec ?? 60;
    const retryCount = gemini.retryCount ?? 2;

    setGeminiEnabled(gemini.enabled);
    setGeminiHasKey(gemini.hasSecret);
    setGeminiKey(masked);
    setGeminiKeyEditable(!gemini.hasSecret);
    setGeminiModel(model);
    setGeminiTemperature(temperature);
    setGeminiMaxTokens(maxOutputTokens);
    setGeminiSafetyPreset(safetyPreset);
    setGeminiSafetyEnabled(safetyEnabled);
    setGeminiSystemPrompt(systemPrompt);
    setGeminiStreaming(streaming);
    setGeminiTimeoutSec(timeoutSec);
    setGeminiRetryCount(retryCount);

    return {
      enabled: gemini.enabled,
      hasSecret: gemini.hasSecret,
      masked,
      model,
      temperature,
      maxOutputTokens,
      safetyPreset,
      safetyEnabled,
      systemPrompt,
      streaming,
      timeoutSec,
      retryCount,
    };
  };

  const handleIntegrationsSave = async () => {
    setSavingIntegrations(true);
    setError(null);
    try {
      const stripeSecretValue =
        stripeSecret && stripeSecret !== MASKED_VALUE ? stripeSecret : undefined;
      const geminiKeyValue =
        geminiKey && geminiKey !== MASKED_VALUE ? geminiKey : undefined;
      const geminiSystemPromptValue = geminiSystemPrompt.trim()
        ? geminiSystemPrompt
        : undefined;
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
        defaultCurrency: normalizeCurrency(stripeDefaultCurrency),
      });
      const stripeMasked = stripe.hasSecret ? MASKED_VALUE : '';
      setStripeEnabled(stripe.enabled);
      setStripeHasSecret(stripe.hasSecret);
      setStripeSecret(stripeMasked);
      setStripeKeyEditable(!stripe.hasSecret);
      setStripeDefaultCurrency(
        normalizeCurrency(stripe.defaultCurrency ?? stripeDefaultCurrency),
      );

      const gemini = await updateGeminiSettings({
        enabled: geminiEnabled,
        apiKey: geminiKeyValue,
        model: geminiModel,
        temperature: geminiTemperature,
        maxOutputTokens: geminiMaxTokens,
        safetyPreset: geminiSafetyEnabled ? geminiSafetyPreset : null,
        systemPrompt: geminiSystemPromptValue,
        streaming: geminiStreaming,
        timeoutSec: geminiTimeoutSec,
        retryCount: geminiRetryCount,
      });
      const geminiState = applyGeminiSettings(gemini);

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
      setDeviantKeyEditable(!deviant.hasSecret);

      queryClient.setQueryData(['integrationSettings'], {
        stripe,
        gemini,
        deviantArt: deviant,
      });

      if (creditAlertDirty) {
        const updatedStudio = await updateStudioSettings({
          creditAlertThreshold,
        });
        const nextThreshold =
          updatedStudio.creditAlertThreshold ?? creditAlertThreshold;
        setCreditAlertThreshold(nextThreshold);
        setInitialStudio((prev) =>
          prev ? { ...prev, creditAlertThreshold: nextThreshold } : prev,
        );
        queryClient.setQueryData(['studioSettings'], updatedStudio);
      }

      setInitialIntegrations({
        stripeEnabled: stripe.enabled,
        stripeSecret: stripeMasked,
        stripeDefaultCurrency: normalizeCurrency(
          stripe.defaultCurrency ?? stripeDefaultCurrency,
        ),
        geminiEnabled: geminiState.enabled,
        geminiKey: geminiState.masked,
        geminiModel: geminiState.model,
        geminiTemperature: geminiState.temperature,
        geminiMaxTokens: geminiState.maxOutputTokens,
        geminiSafetyEnabled: geminiState.safetyEnabled,
        geminiSafetyPreset: geminiState.safetyPreset,
        geminiSystemPrompt: geminiState.systemPrompt,
        geminiStreaming: geminiState.streaming,
        geminiTimeoutSec: geminiState.timeoutSec,
        geminiRetryCount: geminiState.retryCount,
        deviantEnabled: deviant.enabled,
        deviantClientId: deviantMasked,
        deviantClientSecret: deviantMasked,
      });

      if (stripe.enabled && stripe.hasSecret) {
        queryClient.invalidateQueries({ queryKey: ['stripeBalance'] });
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
        numberFormatLocale,
        creditAlertThreshold,
      });
      setStudioDisplayName(updated.displayName);
      setStudioEmail(updated.email);
      setStudioName(updated.studioName);
      setStudioTimezone(updated.timezone);
      setNumberFormatLocale(updated.numberFormatLocale ?? numberFormatLocale);
      setCreditAlertThreshold(updated.creditAlertThreshold ?? creditAlertThreshold);
      setInitialStudio({
        displayName: updated.displayName,
        email: updated.email,
        studioName: updated.studioName,
        timezone: updated.timezone,
        numberFormatLocale: updated.numberFormatLocale ?? numberFormatLocale,
        creditAlertThreshold:
          updated.creditAlertThreshold ?? creditAlertThreshold,
      });
      queryClient.setQueryData(['studioSettings'], updated);
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
      queryClient.setQueryData(['userProfile'], updated);
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

  const integrations = [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Billing & payouts',
      enabled: stripeEnabled,
      active: stripeActive,
      onToggle: () => setStripeEnabled((prev) => !prev),
      logo: <img src="/logo-stripe.svg" alt="Stripe" className="h-8 w-8" />,
      logoBg: 'border border-slate-200 bg-white dark:border-border dark:bg-slate-900',
      learnMore: 'https://stripe.com',
    },
    {
      id: 'gemini',
      name: 'Gemini',
      description: 'AI story engine',
      enabled: geminiEnabled,
      active: geminiActive,
      onToggle: () => setGeminiEnabled((prev) => !prev),
      logo: <img src="/logo-gemini.svg" alt="Gemini" className="h-8 w-8" />,
      logoBg: 'border border-slate-200 bg-white dark:border-border dark:bg-slate-900',
      learnMore: 'https://ai.google.dev',
    },
    {
      id: 'deviant',
      name: 'DeviantArt',
      description: 'Inspiration feed',
      enabled: deviantEnabled,
      active: deviantActive,
      onToggle: () => setDeviantEnabled((prev) => !prev),
      logo: (
        <img src="/logo-deviantart.svg" alt="DeviantArt" className="h-8 w-8" />
      ),
      logoBg: 'border border-slate-200 bg-white dark:border-border dark:bg-slate-900',
      learnMore: 'https://www.deviantart.com',
    },
  ];

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Card as="aside">
          <CardBody size="sm">
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
          </CardBody>
        </Card>

        <div className="space-y-6">
          {activeSection === 'general' ? (
            <Card>
              <CardHeader className="sticky top-0 z-10 rounded-t-2xl bg-white/95 backdrop-blur dark:bg-card/95">
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
                  <Button
                    onClick={handleStudioSave}
                    disabled={studioDisabled}
                    variant="primary"
                    size="md"
                  >
                    {savingStudio ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </span>
                    ) : (
                      'Save studio'
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Display name</Label>
                  <Input
                    type="text"
                    value={studioDisplayName}
                    onChange={(event) => setStudioDisplayName(event.target.value)}
                    disabled={studioDisabled}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={studioEmail}
                    onChange={(event) => setStudioEmail(event.target.value)}
                    disabled={studioDisabled}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Studio name</Label>
                  <Input
                    type="text"
                    value={studioName}
                    onChange={(event) => setStudioName(event.target.value)}
                    disabled={studioDisabled}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Input
                    type="text"
                    value={studioTimezone}
                    onChange={(event) => setStudioTimezone(event.target.value)}
                    disabled={studioDisabled}
                    className="mt-2"
                  />
                </div>
                  <div>
                    <Label>Number format</Label>
                    <div className="relative mt-2">
                      <Select
                        value={numberFormatLocale}
                        onChange={(event) => setNumberFormatLocale(event.target.value)}
                        disabled={studioDisabled}
                        className="peer"
                      >
                        {numberFormatOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 peer-disabled:text-slate-400 dark:peer-disabled:text-foreground/40" />
                    </div>
                    <HelperText className="mt-2">
                      Controls thousand and decimal separators across the dashboard.
                    </HelperText>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : activeSection === 'profile' ? (
            <Card>
              <CardHeader className="sticky top-0 z-10 rounded-t-2xl bg-white/95 backdrop-blur dark:bg-card/95">
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
                  <Button
                    onClick={handleProfileSave}
                    disabled={profileDisabled}
                    variant="primary"
                    size="md"
                  >
                    {savingProfile ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </span>
                    ) : (
                      'Save profile'
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                <Avatar
                  src={profileAvatarUrl ?? undefined}
                  alt={profileDisplayName}
                  fallback={profileDisplayName
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)}
                  size="lg"
                  className="rounded-2xl border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-600 dark:border-border dark:bg-background dark:text-foreground/70"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
                    {userName}
                  </p>
                  <HelperText>{userEmail}</HelperText>
                </div>
                <Button
                  as="label"
                  variant="outline"
                  size="md"
                  className={`ml-auto ${profileDisabled ? 'pointer-events-none opacity-60' : ''}`}
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
                </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Display name</Label>
                    <Input
                      type="text"
                      value={profileDisplayName}
                      onChange={(event) => setProfileDisplayName(event.target.value)}
                      disabled={profileDisabled}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={profileEmail}
                      onChange={(event) => setProfileEmail(event.target.value)}
                      disabled={profileDisabled}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardHeader className="sticky top-0 z-10 rounded-t-2xl bg-white/95 backdrop-blur dark:bg-card/95">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
                    Integration
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-foreground">
                    Integrations
                  </h3>
                  <HelperText className="mt-2">
                    Supercharge your workflow using these integrations
                  </HelperText>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <UnsavedBadge show={isIntegrationsDirty} />
                  <Button
                    onClick={handleIntegrationsSave}
                    disabled={integrationsDisabled}
                    size="lg"
                    variant="primary"
                  >
                    {savingIntegrations ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </span>
                    ) : (
                      'Save integrations'
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                {error ? <Alert variant="danger">{error}</Alert> : null}
                <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-border dark:border-border dark:bg-card">
                  {integrations.map((item) => (
                    <div key={item.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.logoBg}`}
                        >
                          {item.logo}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
                            {item.name}
                          </p>
                          <HelperText>{item.description}</HelperText>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <a
                          href={item.learnMore}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900 dark:text-foreground/60 dark:hover:text-foreground"
                        >
                          Learn more
                        </a>
                        <Badge
                          variant={item.active ? 'success' : 'neutral'}
                          className="px-2 py-1 text-[10px] tracking-[0.25em]"
                        >
                          {item.active ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {item.active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Switch
                          checked={item.enabled}
                          onCheckedChange={() => item.onToggle()}
                          label={`Enable ${item.name} integration`}
                          disabled={integrationsDisabled}
                        />
                      </div>
                    </div>
                    {item.id === 'stripe' && stripeEnabled ? (
                      <div className="mt-4 space-y-4">
                        <div className="grid gap-x-4 gap-y-1 md:grid-cols-[180px_minmax(0,1fr)_auto]">
                          <Label htmlFor="stripe-secret-key" variant="inline">
                            Secret key
                          </Label>
                          <div className="relative">
                            <Input
                              id="stripe-secret-key"
                              type="password"
                              placeholder="Enter secret key"
                              value={stripeSecret}
                              onChange={(event) => setStripeSecret(event.target.value)}
                              onFocus={() => {
                                if (stripeSecret === MASKED_VALUE) {
                                  setStripeSecret('');
                                }
                              }}
                              disabled={
                                integrationsDisabled ||
                                (stripeHasSecret && !stripeKeyEditable)
                              }
                              className="pr-10"
                            />
                            {stripeHasSecret && !stripeKeyEditable ? (
                              <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            ) : null}
                          </div>
                          <div className="self-center">
                            {stripeHasSecret ? (
                              <IconButton
                                onClick={() => {
                                  if (stripeKeyEditable) {
                                    setStripeKeyEditable(false);
                                    setStripeSecret(MASKED_VALUE);
                                    return;
                                  }
                                  setStripeKeyEditable(true);
                                  if (stripeSecret === MASKED_VALUE) {
                                    setStripeSecret('');
                                  }
                                }}
                                disabled={integrationsDisabled}
                                aria-label={stripeKeyEditable ? 'Cancel edit' : 'Edit API key'}
                                title={stripeKeyEditable ? 'Cancel edit' : 'Edit API key'}
                                variant="outline"
                                size="md"
                              >
                                {stripeKeyEditable ? (
                                  <X className="h-4 w-4" />
                                ) : (
                                  <PencilLine className="h-4 w-4" />
                                )}
                              </IconButton>
                            ) : (
                              <span className="hidden h-10 w-10 md:inline-block" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 md:col-start-2 dark:text-foreground/60">
                            Used to authenticate Stripe API calls. Keep it private.
                          </p>
                        </div>
                        <div className="grid gap-x-4 gap-y-1 md:grid-cols-[180px_minmax(0,1fr)]">
                          <Label htmlFor="stripe-default-currency" variant="inline">
                            Default currency
                          </Label>
                          <div className="relative">
                            <Select
                              id="stripe-default-currency"
                              value={stripeDefaultCurrency}
                              onChange={(event) =>
                                setStripeDefaultCurrency(event.target.value)
                              }
                              disabled={integrationsDisabled}
                              className="peer"
                            >
                              {stripeCurrencyOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 peer-disabled:text-slate-400 dark:peer-disabled:text-foreground/40" />
                          </div>
                          <p className="text-xs text-slate-500 md:col-start-2 dark:text-foreground/60">
                            Used as the default for new prices and invoices.
                          </p>
                        </div>
                        <div className="grid gap-x-4 gap-y-1 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
                          <Label variant="inline">Available balance</Label>
                          <Input
                            type="text"
                            value={stripeBalance}
                            disabled
                            readOnly
                            className="font-semibold text-slate-900"
                          />
                        </div>
                      </div>
                    ) : null}
                    {item.id === 'gemini' && geminiEnabled ? (
                      <div className="mt-4 space-y-4">
                        <div className="grid gap-x-4 gap-y-1 md:grid-cols-[180px_minmax(0,1fr)_auto]">
                          <Label htmlFor="gemini-api-key" variant="inline">
                            API key
                          </Label>
                          <div className="relative">
                            <Input
                              id="gemini-api-key"
                              type="password"
                              placeholder="Enter API key"
                              value={geminiKey}
                              onChange={(event) => setGeminiKey(event.target.value)}
                              onFocus={() => {
                                if (geminiKey === MASKED_VALUE) {
                                  setGeminiKey('');
                                }
                              }}
                              disabled={
                                integrationsDisabled || (geminiHasKey && !geminiKeyEditable)
                              }
                              className="pr-10"
                            />
                            {geminiHasKey && !geminiKeyEditable ? (
                              <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            ) : null}
                          </div>
                          <div className="self-center">
                            {geminiHasKey ? (
                              <IconButton
                                onClick={() => {
                                  if (geminiKeyEditable) {
                                    setGeminiKeyEditable(false);
                                    setGeminiKey(MASKED_VALUE);
                                    return;
                                  }
                                  setGeminiKeyEditable(true);
                                  if (geminiKey === MASKED_VALUE) {
                                    setGeminiKey('');
                                  }
                                }}
                                disabled={integrationsDisabled}
                                aria-label={geminiKeyEditable ? 'Cancel edit' : 'Edit API key'}
                                title={geminiKeyEditable ? 'Cancel edit' : 'Edit API key'}
                                variant="outline"
                                size="md"
                              >
                                {geminiKeyEditable ? (
                                  <X className="h-4 w-4" />
                                ) : (
                                  <PencilLine className="h-4 w-4" />
                                )}
                              </IconButton>
                            ) : (
                              <span className="hidden h-10 w-10 md:inline-block" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 md:col-start-2 dark:text-foreground/60">
                            Gemini API (AI Studio) key used to authenticate requests.
                          </p>
                        </div>

                        <div className="grid gap-x-4 gap-y-1 md:grid-cols-[180px_minmax(0,1fr)]">
                          <Label htmlFor="gemini-model" variant="inline">
                            Model
                          </Label>
                          <div className="relative">
                            <Select
                              id="gemini-model"
                              value={geminiModel}
                              onChange={(event) => setGeminiModel(event.target.value)}
                              disabled={integrationsDisabled}
                              className="peer"
                            >
                              {geminiModelOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 peer-disabled:text-slate-400 dark:peer-disabled:text-foreground/40" />
                          </div>
                          <p className="text-xs text-slate-500 md:col-start-2 dark:text-foreground/60">
                            Select the Gemini model used for generation (preview models
                            require Gemini API access).
                          </p>
                        </div>

                        <div className="grid gap-x-4 gap-y-1 md:grid-cols-[180px_minmax(0,1fr)]">
                          <Label htmlFor="gemini-temperature" variant="inline">
                            Temperature
                          </Label>
                          <Input
                            id="gemini-temperature"
                            type="number"
                            min={0}
                            max={2}
                            step={0.1}
                            value={geminiTemperature}
                            onChange={(event) => {
                              const value = event.target.value;
                              setGeminiTemperature(value === '' ? 0 : Number(value));
                            }}
                            disabled={integrationsDisabled}
                          />
                          <p className="text-xs text-slate-500 md:col-start-2 dark:text-foreground/60">
                            Higher values make output more creative (0–2).
                          </p>
                        </div>

                        <div className="grid gap-x-4 gap-y-1 md:grid-cols-[180px_minmax(0,1fr)]">
                          <Label htmlFor="gemini-max-tokens" variant="inline">
                            Max output tokens
                          </Label>
                          <Input
                            id="gemini-max-tokens"
                            type="number"
                            min={1}
                            step={1}
                            value={geminiMaxTokens}
                            onChange={(event) => {
                              const value = event.target.value;
                              setGeminiMaxTokens(value === '' ? 0 : Number(value));
                            }}
                            disabled={integrationsDisabled}
                          />
                          <p className="text-xs text-slate-500 md:col-start-2 dark:text-foreground/60">
                            Limits how long responses can be.
                          </p>
                        </div>

                        <div className="grid gap-x-4 gap-y-1 md:grid-cols-[180px_minmax(0,1fr)]">
                          <Label htmlFor="gemini-safety" variant="inline">
                            Safety
                          </Label>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={geminiSafetyEnabled}
                                onCheckedChange={() =>
                                  setGeminiSafetyEnabled((prev) => !prev)
                                }
                                label="Enable Gemini safety"
                                disabled={integrationsDisabled}
                              />
                              <HelperText as="span">
                                {geminiSafetyEnabled ? 'On' : 'Off'}
                              </HelperText>
                            </div>
                            <div className="relative min-w-[220px] flex-1">
                              <Select
                                id="gemini-safety"
                                value={geminiSafetyPreset}
                                onChange={(event) => {
                                  const value = event.target.value as
                                    | 'strict'
                                    | 'balanced'
                                    | 'relaxed';
                                  setGeminiSafetyPreset(value);
                                  setGeminiSafetyEnabled(true);
                                }}
                                disabled={integrationsDisabled || !geminiSafetyEnabled}
                                className="peer"
                              >
                                {GEMINI_SAFETY_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </Select>
                              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 peer-disabled:text-slate-400 dark:peer-disabled:text-foreground/40" />
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 md:col-start-2 dark:text-foreground/60">
                            Disable to avoid sending any safety settings. Preset
                            controls filtering thresholds.
                          </p>
                        </div>

                        <div className="grid gap-x-4 gap-y-1 md:grid-cols-[180px_minmax(0,1fr)]">
                          <Label htmlFor="gemini-system-prompt" variant="inline">
                            System prompt
                          </Label>
                          <Textarea
                            id="gemini-system-prompt"
                            rows={3}
                            placeholder="Add a default style or instruction for Gemini"
                            value={geminiSystemPrompt}
                            onChange={(event) => setGeminiSystemPrompt(event.target.value)}
                            disabled={integrationsDisabled}
                            className="min-h-[96px]"
                          />
                          <p className="text-xs text-slate-500 md:col-start-2 dark:text-foreground/60">
                            Applied to every request as a base instruction.
                          </p>
                        </div>

                        <div className="grid gap-x-4 gap-y-1 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
                          <Label variant="inline">Streaming</Label>
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={geminiStreaming}
                              onCheckedChange={() => setGeminiStreaming((prev) => !prev)}
                              label="Enable Gemini streaming"
                              disabled={integrationsDisabled}
                            />
                            <HelperText as="span">
                              {geminiStreaming ? 'On' : 'Off'}
                            </HelperText>
                          </div>
                          <p className="text-xs text-slate-500 md:col-start-2 dark:text-foreground/60">
                            Stream tokens as they are generated.
                          </p>
                        </div>

                        <div className="grid gap-x-4 gap-y-1 md:grid-cols-[180px_minmax(0,1fr)]">
                          <Label htmlFor="gemini-timeout" variant="inline">
                            Timeout (sec)
                          </Label>
                          <Input
                            id="gemini-timeout"
                            type="number"
                            min={1}
                            step={1}
                            value={geminiTimeoutSec}
                            onChange={(event) => {
                              const value = event.target.value;
                              setGeminiTimeoutSec(value === '' ? 0 : Number(value));
                            }}
                            disabled={integrationsDisabled}
                          />
                          <p className="text-xs text-slate-500 md:col-start-2 dark:text-foreground/60">
                            Maximum time to wait for a response.
                          </p>
                        </div>

                        <div className="grid gap-x-4 gap-y-1 md:grid-cols-[180px_minmax(0,1fr)]">
                          <Label htmlFor="gemini-retry" variant="inline">
                            Retry count
                          </Label>
                          <Input
                            id="gemini-retry"
                            type="number"
                            min={0}
                            step={1}
                            value={geminiRetryCount}
                            onChange={(event) => {
                              const value = event.target.value;
                              setGeminiRetryCount(value === '' ? 0 : Number(value));
                            }}
                            disabled={integrationsDisabled}
                          />
                          <p className="text-xs text-slate-500 md:col-start-2 dark:text-foreground/60">
                            Number of automatic retries on failure.
                          </p>
                        </div>

                        <div className="grid gap-x-4 gap-y-1 md:grid-cols-[180px_minmax(0,1fr)]">
                          <Label htmlFor="gemini-credit-alert" variant="inline">
                            Credits alert threshold
                          </Label>
                          <Input
                            id="gemini-credit-alert"
                            type="number"
                            min={0}
                            step={1}
                            value={creditAlertThreshold}
                            onChange={(event) => {
                              const value = event.target.value;
                              setCreditAlertThreshold(value === '' ? 0 : Number(value));
                            }}
                            disabled={integrationsDisabled}
                          />
                          <p className="text-xs text-slate-500 md:col-start-2 dark:text-foreground/60">
                            Sends a bell notification when credits fall below this
                            value.
                          </p>
                        </div>
                      </div>
                    ) : null}
                    {item.id === 'deviant' && deviantEnabled ? (
                      <div className="mt-4 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="relative flex-1">
                            <Input
                              type="text"
                              placeholder="Enter client ID"
                              value={deviantClientId}
                              onChange={(event) => setDeviantClientId(event.target.value)}
                              onFocus={() => {
                                if (deviantClientId === MASKED_VALUE) {
                                  setDeviantClientId('');
                                }
                              }}
                              disabled={
                                integrationsDisabled ||
                                (deviantHasSecret && !deviantKeyEditable)
                              }
                              className="pr-10"
                            />
                            {deviantHasSecret && !deviantKeyEditable ? (
                              <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            ) : null}
                          </div>
                          {deviantHasSecret ? (
                            <IconButton
                              onClick={() => {
                                if (deviantKeyEditable) {
                                  setDeviantKeyEditable(false);
                                  setDeviantClientId(MASKED_VALUE);
                                  setDeviantClientSecret(MASKED_VALUE);
                                  return;
                                }
                                setDeviantKeyEditable(true);
                                if (deviantClientId === MASKED_VALUE) {
                                  setDeviantClientId('');
                                }
                                if (deviantClientSecret === MASKED_VALUE) {
                                  setDeviantClientSecret('');
                                }
                              }}
                              disabled={integrationsDisabled}
                              aria-label={
                                deviantKeyEditable ? 'Cancel edit' : 'Edit API keys'
                              }
                              title={deviantKeyEditable ? 'Cancel edit' : 'Edit API keys'}
                              variant="outline"
                              size="md"
                            >
                              {deviantKeyEditable ? (
                                <X className="h-4 w-4" />
                              ) : (
                                <PencilLine className="h-4 w-4" />
                              )}
                            </IconButton>
                          ) : null}
                        </div>
                        <div className="relative">
                          <Input
                            type="password"
                            placeholder="Enter client secret"
                            value={deviantClientSecret}
                            onChange={(event) => setDeviantClientSecret(event.target.value)}
                            onFocus={() => {
                              if (deviantClientSecret === MASKED_VALUE) {
                                setDeviantClientSecret('');
                              }
                            }}
                            disabled={
                              integrationsDisabled ||
                              (deviantHasSecret && !deviantKeyEditable)
                            }
                            className="pr-10"
                          />
                          {deviantHasSecret && !deviantKeyEditable ? (
                            <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </section>
    </>
  );
};

export default SettingsPage;
