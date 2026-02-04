export const normalizeCurrency = (value?: string) =>
  (value ?? 'USD').toUpperCase();

const resolveLocale = (locale?: string) => locale ?? 'en-US';

export const formatNumber = (
  value: number,
  locale?: string,
  options: Intl.NumberFormatOptions = {},
) =>
  new Intl.NumberFormat(resolveLocale(locale), {
    ...options,
  }).format(value);

export const formatCurrency = (
  amount: number,
  currency?: string,
  options: Intl.NumberFormatOptions = {},
  locale?: string,
) => {
  const code = normalizeCurrency(currency);
  return new Intl.NumberFormat(resolveLocale(locale), {
    style: 'currency',
    currency: code,
    ...options,
  }).format(amount);
};

export const formatCurrencyCompact = (
  amount: number,
  currency?: string,
  locale?: string,
) =>
  formatCurrency(
    amount,
    currency,
    {
      notation: 'compact',
      maximumFractionDigits: 1,
    },
    locale,
  );
