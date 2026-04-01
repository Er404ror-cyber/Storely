import currencyCodes from 'currency-codes';

export type GeoCurrencySource =
  | 'system-currency'
  | 'timezone-map'
  | 'locale-region'
  | 'southern-africa-heuristic'
  | 'fallback';

export interface GeoCurrencyResult {
  currency: string;
  country: string;
  source: GeoCurrencySource;
  timeZone: string;
  locale: string;
  languages: string[];
}

const TZ_GEO_MAP: Record<string, { currency: string; country: string }> = {
  // AFRICA
  'Africa/Maputo': { currency: 'MZN', country: 'MZ' },
  'Africa/Johannesburg': { currency: 'ZAR', country: 'ZA' },
  'Africa/Harare': { currency: 'ZWG', country: 'ZW' },
  'Africa/Lagos': { currency: 'NGN', country: 'NG' },
  'Africa/Nairobi': { currency: 'KES', country: 'KE' },
  'Africa/Cairo': { currency: 'EGP', country: 'EG' },
  'Africa/Casablanca': { currency: 'MAD', country: 'MA' },
  'Africa/Tunis': { currency: 'TND', country: 'TN' },
  'Africa/Accra': { currency: 'GHS', country: 'GH' },
  'Africa/Addis_Ababa': { currency: 'ETB', country: 'ET' },

  // ASIA
  'Asia/Kolkata': { currency: 'INR', country: 'IN' },
  'Asia/Dubai': { currency: 'AED', country: 'AE' },
  'Asia/Singapore': { currency: 'SGD', country: 'SG' },
  'Asia/Kuala_Lumpur': { currency: 'MYR', country: 'MY' },
  'Asia/Bangkok': { currency: 'THB', country: 'TH' },
  'Asia/Jakarta': { currency: 'IDR', country: 'ID' },
  'Asia/Manila': { currency: 'PHP', country: 'PH' },
  'Asia/Tokyo': { currency: 'JPY', country: 'JP' },
  'Asia/Seoul': { currency: 'KRW', country: 'KR' },
  'Asia/Shanghai': { currency: 'CNY', country: 'CN' },
  'Asia/Hong_Kong': { currency: 'HKD', country: 'HK' },
  'Asia/Karachi': { currency: 'PKR', country: 'PK' },
  'Asia/Dhaka': { currency: 'BDT', country: 'BD' },
  'Asia/Colombo': { currency: 'LKR', country: 'LK' },
  'Asia/Kathmandu': { currency: 'NPR', country: 'NP' },

  // EUROPE
  'Europe/Lisbon': { currency: 'EUR', country: 'PT' },
  'Europe/London': { currency: 'GBP', country: 'GB' },
  'Europe/Zurich': { currency: 'CHF', country: 'CH' },
  'Europe/Stockholm': { currency: 'SEK', country: 'SE' },
  'Europe/Oslo': { currency: 'NOK', country: 'NO' },
  'Europe/Copenhagen': { currency: 'DKK', country: 'DK' },
  'Europe/Warsaw': { currency: 'PLN', country: 'PL' },
  'Europe/Prague': { currency: 'CZK', country: 'CZ' },
  'Europe/Budapest': { currency: 'HUF', country: 'HU' },
  'Europe/Bucharest': { currency: 'RON', country: 'RO' },
  'Europe/Istanbul': { currency: 'TRY', country: 'TR' },
  'Europe/Paris': { currency: 'EUR', country: 'FR' },
  'Europe/Berlin': { currency: 'EUR', country: 'DE' },
  'Europe/Madrid': { currency: 'EUR', country: 'ES' },
  'Europe/Rome': { currency: 'EUR', country: 'IT' },
  'Europe/Amsterdam': { currency: 'EUR', country: 'NL' },
  'Europe/Brussels': { currency: 'EUR', country: 'BE' },
  'Europe/Vienna': { currency: 'EUR', country: 'AT' },
  'Europe/Helsinki': { currency: 'EUR', country: 'FI' },
  'Europe/Dublin': { currency: 'EUR', country: 'IE' },
  'Europe/Athens': { currency: 'EUR', country: 'GR' },

  // AMERICAS
  'America/New_York': { currency: 'USD', country: 'US' },
  'America/Chicago': { currency: 'USD', country: 'US' },
  'America/Denver': { currency: 'USD', country: 'US' },
  'America/Los_Angeles': { currency: 'USD', country: 'US' },
  'America/Toronto': { currency: 'CAD', country: 'CA' },
  'America/Vancouver': { currency: 'CAD', country: 'CA' },
  'America/Mexico_City': { currency: 'MXN', country: 'MX' },
  'America/Sao_Paulo': { currency: 'BRL', country: 'BR' },
  'America/Argentina/Buenos_Aires': { currency: 'ARS', country: 'AR' },
  'America/Santiago': { currency: 'CLP', country: 'CL' },
  'America/Bogota': { currency: 'COP', country: 'CO' },
  'America/Lima': { currency: 'PEN', country: 'PE' },

  // OCEANIA
  'Australia/Sydney': { currency: 'AUD', country: 'AU' },
  'Australia/Melbourne': { currency: 'AUD', country: 'AU' },
  'Australia/Perth': { currency: 'AUD', country: 'AU' },
  'Pacific/Auckland': { currency: 'NZD', country: 'NZ' },
};

const LOCALE_REGION_MAP: Record<string, { currency: string; country: string }> = {
  MZ: { currency: 'MZN', country: 'MZ' },
  ZA: { currency: 'ZAR', country: 'ZA' },
  ZW: { currency: 'ZWG', country: 'ZW' },
  AO: { currency: 'AOA', country: 'AO' },
  NG: { currency: 'NGN', country: 'NG' },
  KE: { currency: 'KES', country: 'KE' },
  IN: { currency: 'INR', country: 'IN' },
  AE: { currency: 'AED', country: 'AE' },
  SG: { currency: 'SGD', country: 'SG' },
  MY: { currency: 'MYR', country: 'MY' },
  US: { currency: 'USD', country: 'US' },
  CA: { currency: 'CAD', country: 'CA' },
  MX: { currency: 'MXN', country: 'MX' },
  BR: { currency: 'BRL', country: 'BR' },
  PT: { currency: 'EUR', country: 'PT' },
  GB: { currency: 'GBP', country: 'GB' },
  CH: { currency: 'CHF', country: 'CH' },
  AU: { currency: 'AUD', country: 'AU' },
  NZ: { currency: 'NZD', country: 'NZ' },
  JP: { currency: 'JPY', country: 'JP' },
  CN: { currency: 'CNY', country: 'CN' },
  HK: { currency: 'HKD', country: 'HK' },
  TH: { currency: 'THB', country: 'TH' },
  ID: { currency: 'IDR', country: 'ID' },
  PH: { currency: 'PHP', country: 'PH' },
  PK: { currency: 'PKR', country: 'PK' },
  BD: { currency: 'BDT', country: 'BD' },
  LK: { currency: 'LKR', country: 'LK' },
  NP: { currency: 'NPR', country: 'NP' },
  KR: { currency: 'KRW', country: 'KR' },
};

const CURRENCY_TO_COUNTRY: Record<string, string> = {
  MZN: 'MZ',
  ZAR: 'ZA',
  ZWG: 'ZW',
  AOA: 'AO',
  NGN: 'NG',
  KES: 'KE',
  INR: 'IN',
  AED: 'AE',
  SGD: 'SG',
  MYR: 'MY',
  USD: 'US',
  CAD: 'CA',
  MXN: 'MX',
  BRL: 'BR',
  EUR: 'PT',
  GBP: 'GB',
  CHF: 'CH',
  AUD: 'AU',
  NZD: 'NZ',
  JPY: 'JP',
  CNY: 'CN',
  HKD: 'HK',
  SEK: 'SE',
  NOK: 'NO',
  DKK: 'DK',
  PLN: 'PL',
  CZK: 'CZ',
  HUF: 'HU',
  RON: 'RO',
  TRY: 'TR',
  ARS: 'AR',
  CLP: 'CL',
  COP: 'CO',
  PEN: 'PE',
  THB: 'TH',
  IDR: 'ID',
  PHP: 'PH',
  PKR: 'PK',
  BDT: 'BD',
  LKR: 'LK',
  NPR: 'NP',
  KRW: 'KR',
  EGP: 'EG',
  MAD: 'MA',
  TND: 'TN',
  GHS: 'GH',
  ETB: 'ET',
};

function safeSystemCurrency(locale: string): string {
  try {
    const currency = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
    }).resolvedOptions().currency;

    return typeof currency === 'string' && currency.trim() ? currency : 'USD';
  } catch {
    return 'USD';
  }
}

function isGenericCurrency(code?: string): boolean {
  return !code || code === 'USD';
}

export function countryCodeToFlag(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌍';

  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export function getCurrencyCountry(code: string): string {
  return CURRENCY_TO_COUNTRY[code] || '';
}

export function getCurrencyDisplayName(code: string, locale = 'en'): string {
  const info = currencyCodes.code(code);
  if (!info) return code;

  try {
    const displayNames = new Intl.DisplayNames([locale], { type: 'currency' });
    return displayNames.of(code) || info.currency || code;
  } catch {
    return info.currency || code;
  }
}

function safeNavigatorLocale(): string {
  if (typeof navigator === 'undefined') return 'en-US';
  return navigator.language || 'en-US';
}

function safeNavigatorLanguages(locale: string): string[] {
  if (typeof navigator === 'undefined') return [locale];

  const langs = navigator.languages;
  if (Array.isArray(langs) && langs.length > 0) {
    return [...langs];
  }

  return [locale];
}

function safeTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    return '';
  }
}

export function getUserGeoCurrency(): GeoCurrencyResult {
  const locale = safeNavigatorLocale();
  const languages = safeNavigatorLanguages(locale);
  const timeZone = safeTimeZone();
  const region = locale.split('-')[1]?.toUpperCase() || '';
  const systemCurrency = safeSystemCurrency(locale);

  console.group('🌍 [geoUserCurrency]');
  console.log('locale:', locale);
  console.log('languages:', languages);
  console.log('timeZone:', timeZone);
  console.log('systemCurrency:', systemCurrency);
  console.log('region:', region);

  if (!isGenericCurrency(systemCurrency)) {
    const result: GeoCurrencyResult = {
      currency: systemCurrency,
      country: getCurrencyCountry(systemCurrency) || region || 'US',
      source: 'system-currency',
      timeZone,
      locale,
      languages: [...languages],
    };

    console.log('✅ system-currency:', result);
    console.groupEnd();
    return result;
  }

  const normalizedLanguages = languages.map((lang) => lang.toLowerCase());

  if (
    timeZone === 'Africa/Maputo' ||
    region === 'MZ' ||
    normalizedLanguages.some((lang) => lang === 'pt-mz' || lang.endsWith('-mz'))
  ) {
    const result: GeoCurrencyResult = {
      currency: 'MZN',
      country: 'MZ',
      source: 'southern-africa-heuristic',
      timeZone,
      locale,
      languages: [...languages],
    };

    console.log('✅ mozambique heuristic:', result);
    console.groupEnd();
    return result;
  }

  const timezoneMatch = TZ_GEO_MAP[timeZone];
  if (timezoneMatch) {
    const result: GeoCurrencyResult = {
      currency: timezoneMatch.currency,
      country: timezoneMatch.country,
      source: 'timezone-map',
      timeZone,
      locale,
      languages: [...languages],
    };

    console.log('✅ timezone-map:', result);
    console.groupEnd();
    return result;
  }

  const localeRegionMatch = region ? LOCALE_REGION_MAP[region] : undefined;
  if (localeRegionMatch) {
    const result: GeoCurrencyResult = {
      currency: localeRegionMatch.currency,
      country: localeRegionMatch.country,
      source: 'locale-region',
      timeZone,
      locale,
      languages: [...languages],
    };

    console.log('✅ locale-region:', result);
    console.groupEnd();
    return result;
  }

  const fallback: GeoCurrencyResult = {
    currency: 'USD',
    country: 'US',
    source: 'fallback',
    timeZone,
    locale,
    languages: [...languages],
  };

  console.log('⚠️ fallback:', fallback);
  console.groupEnd();
  return fallback;
}

export function getUserCurrency(): string {
  return getUserGeoCurrency().currency;
}

export function getUserCountry(): string {
  return getUserGeoCurrency().country;
}