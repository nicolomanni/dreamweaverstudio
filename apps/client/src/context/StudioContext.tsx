import { createContext, useContext } from 'react';
import type {
  IntegrationSettings,
  StudioSettings,
} from '@dreamweaverstudio/shared-types';

export type StudioContextValue = {
  studioSettings?: StudioSettings;
  integrationSettings?: IntegrationSettings;
  numberFormatLocale: string;
  creditAlertThreshold: number;
  stripeDefaultCurrency: string;
  stripeBalanceAmount: number | null;
  stripeBalanceDisplay: string;
  stripeBalanceLive: boolean;
  stripeBalanceLoading: boolean;
};

const StudioContext = createContext<StudioContextValue | null>(null);

export const StudioProvider = StudioContext.Provider;

export const useStudioContext = () => {
  const ctx = useContext(StudioContext);
  if (!ctx) {
    throw new Error('useStudioContext must be used within StudioProvider');
  }
  return ctx;
};
