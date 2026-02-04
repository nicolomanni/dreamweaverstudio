import { FastifyInstance } from 'fastify';
import Stripe from 'stripe';
import {
  getIntegrationSettings,
  updateStripeIntegration,
  updateGeminiIntegration,
  updateDeviantArtIntegration,
} from '@dreamweaverstudio/server-data-access-db';

type StripePayload = {
  enabled?: boolean;
  secretKey?: string;
  publishableKey?: string;
  defaultCurrency?: string;
};

type GeminiPayload = {
  enabled?: boolean;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  safetyPreset?: 'strict' | 'balanced' | 'relaxed' | null;
  systemPrompt?: string;
  streaming?: boolean;
  timeoutSec?: number;
  retryCount?: number;
};

type DeviantArtPayload = {
  enabled?: boolean;
  clientId?: string;
  clientSecret?: string;
};

function maskSecret(secret?: string) {
  if (!secret) return { hasSecret: false };
  const last4 = secret.slice(-4);
  return { hasSecret: true, last4 };
}

function maskKey(secret?: string) {
  if (!secret) return { hasSecret: false };
  return { hasSecret: true };
}

export default async function (fastify: FastifyInstance) {
  fastify.get('/integrations', async () => {
    const settings = await getIntegrationSettings();
    if (!settings) {
      return {
        stripe: { enabled: false, ...maskSecret(undefined) },
        gemini: { enabled: false, ...maskKey(undefined) },
        deviantArt: { enabled: false, ...maskKey(undefined) },
      };
    }

    return {
      stripe: {
        enabled: settings.stripe?.enabled ?? false,
        defaultCurrency: settings.stripe?.defaultCurrency,
        ...maskSecret(settings.stripe?.secretKey),
      },
      gemini: {
        enabled: settings.gemini?.enabled ?? false,
        model: settings.gemini?.model,
        temperature: settings.gemini?.temperature,
        maxOutputTokens: settings.gemini?.maxOutputTokens,
        safetyPreset: settings.gemini?.safetyPreset,
        systemPrompt: settings.gemini?.systemPrompt,
        streaming: settings.gemini?.streaming,
        timeoutSec: settings.gemini?.timeoutSec,
        retryCount: settings.gemini?.retryCount,
        ...maskKey(settings.gemini?.apiKey),
      },
      deviantArt: {
        enabled: settings.deviantArt?.enabled ?? false,
        ...maskKey(settings.deviantArt?.clientSecret),
      },
    };
  });

  fastify.put('/integrations/stripe', async (request) => {
    const payload = (request.body ?? {}) as StripePayload;
    const updated = await updateStripeIntegration({
      enabled: payload.enabled,
      secretKey: payload.secretKey,
      publishableKey: payload.publishableKey,
      defaultCurrency: payload.defaultCurrency,
    });

    return {
      stripe: {
        enabled: updated.stripe?.enabled ?? false,
        defaultCurrency: updated.stripe?.defaultCurrency,
        ...maskSecret(updated.stripe?.secretKey),
      },
    };
  });

  fastify.put('/integrations/gemini', async (request) => {
    const payload = (request.body ?? {}) as GeminiPayload;
    const updated = await updateGeminiIntegration({
      enabled: payload.enabled,
      apiKey: payload.apiKey,
      model: payload.model,
      temperature: payload.temperature,
      maxOutputTokens: payload.maxOutputTokens,
      safetyPreset: payload.safetyPreset,
      systemPrompt: payload.systemPrompt,
      streaming: payload.streaming,
      timeoutSec: payload.timeoutSec,
      retryCount: payload.retryCount,
    });

    return {
      gemini: {
        enabled: updated.gemini?.enabled ?? false,
        model: updated.gemini?.model,
        temperature: updated.gemini?.temperature,
        maxOutputTokens: updated.gemini?.maxOutputTokens,
        safetyPreset: updated.gemini?.safetyPreset,
        systemPrompt: updated.gemini?.systemPrompt,
        streaming: updated.gemini?.streaming,
        timeoutSec: updated.gemini?.timeoutSec,
        retryCount: updated.gemini?.retryCount,
        ...maskKey(updated.gemini?.apiKey),
      },
    };
  });

  fastify.put('/integrations/deviantart', async (request) => {
    const payload = (request.body ?? {}) as DeviantArtPayload;
    const updated = await updateDeviantArtIntegration({
      enabled: payload.enabled,
      clientId: payload.clientId,
      clientSecret: payload.clientSecret,
    });

    return {
      deviantArt: {
        enabled: updated.deviantArt?.enabled ?? false,
        ...maskKey(updated.deviantArt?.clientSecret),
      },
    };
  });

  fastify.get('/integrations/stripe/balance', async () => {
    const settings = await getIntegrationSettings();
    const enabled = settings?.stripe?.enabled ?? false;
    if (!enabled) {
      return { enabled: false };
    }

    const secretKey =
      settings?.stripe?.secretKey ?? process.env.STRIPE_SECRET;
    if (!secretKey) {
      return { enabled: true, error: 'Stripe secret key is not configured.' };
    }

    const stripe = new Stripe(secretKey);
    const balance = await stripe.balance.retrieve();
    const available =
      balance.available?.reduce((sum, entry) => sum + entry.amount, 0) ?? 0;
    const pending =
      balance.pending?.reduce((sum, entry) => sum + entry.amount, 0) ?? 0;

    return {
      enabled: true,
      currency: balance.available?.[0]?.currency ?? 'usd',
      available,
      pending,
    };
  });
}
