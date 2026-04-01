import currencyCodes from 'currency-codes';

export type GeoSource =
  | 'system-currency'
  | 'southern-africa-heuristic'
  | 'timezone-map'
  | 'locale-region'
  | 'fallback';

export type GeoConfig = {
  currency: string;
  country: string;
  source: GeoSource;
};

const TZ_GEO_MAP: Record<string, { currency: string; country: string }> = {
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

  // AFRICA
  'Africa/Johannesburg': { currency: 'ZAR', country: 'ZA' },
  'Africa/Maputo': { currency: 'MZN', country: 'MZ' },
  'Africa/Lagos': { currency: 'NGN', country: 'NG' },
  'Africa/Nairobi': { currency: 'KES', country: 'KE' },
  'Africa/Cairo': { currency: 'EGP', country: 'EG' },
  'Africa/Casablanca': { currency: 'MAD', country: 'MA' },
  'Africa/Tunis': { currency: 'TND', country: 'TN' },
  'Africa/Accra': { currency: 'GHS', country: 'GH' },
  'Africa/Addis_Ababa': { currency: 'ETB', country: 'ET' },
  'Africa/Harare': { currency: 'ZWG', country: 'ZW' },

  // EUROPE
  'Europe/London': { currency: 'GBP', country: 'GB' },
  'Europe/Zurich': { currency: 'CHF', country: 'CH' },
  'Europe/Stockholm': { currency: 'SEK', country: 'SE' },
  'Europe/Oslo': { currency: 'NOK', country: 'NO' },
  'Europe/Copenhagen': { currency: 'DKK', country: 'DK' },
  'Europe/Prague': { currency: 'CZK', country: 'CZ' },
  'Europe/Warsaw': { currency: 'PLN', country: 'PL' },
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
  'Europe/Lisbon': { currency: 'EUR', country: 'PT' },
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
  BR: { currency: 'BRL', country: 'BR' },
  PT: { currency: 'EUR', country: 'PT' },
  US: { currency: 'USD', country: 'US' },
  MZ: { currency: 'MZN', country: 'MZ' },
  IN: { currency: 'INR', country: 'IN' },
  AO: { currency: 'AOA', country: 'AO' },
  ZA: { currency: 'ZAR', country: 'ZA' },
  ZW: { currency: 'ZWG', country: 'ZW' },
  NG: { currency: 'NGN', country: 'NG' },
  KE: { currency: 'KES', country: 'KE' },
  AE: { currency: 'AED', country: 'AE' },
  SG: { currency: 'SGD', country: 'SG' },
  MY: { currency: 'MYR', country: 'MY' },
};

const SYSTEM_CURRENCY_COUNTRY_MAP: Record<string, string> = {
  BRL: 'BR',
  EUR: 'PT',
  MZN: 'MZ',
  INR: 'IN',
  AOA: 'AO',
  ZAR: 'ZA',
  ZWG: 'ZW',
  NGN: 'NG',
  KES: 'KE',
  AED: 'AE',
  SGD: 'SG',
  MYR: 'MY',
  USD: 'US',
};

function isLikelyGenericCurrency(code?: string): boolean {
  return !code || code === 'USD';
}

function getSafeBrowserLocale(): string {
  if (typeof window === 'undefined') return 'en-US';
  return window.navigator.language || 'en-US';
}

function getSafeLanguages(): string[] {
  if (typeof window === 'undefined') return ['en-US'];

  const langs = window.navigator.languages;
  if (Array.isArray(langs) && langs.length > 0) {
    return [...langs];
  }

  return [window.navigator.language || 'en-US'];
}

function getSafeTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    return '';
  }
}

function getSafeSystemCurrency(locale: string): string {
  try {
    const detected = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
    }).resolvedOptions().currency;

    return typeof detected === 'string' && detected.trim() ? detected : 'USD';
  } catch {
    return 'USD';
  }
}

export function countryCodeToFlag(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌍';

  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export function getCurrencyDisplayName(code: string, locale: string = 'en'): string {
  const item = currencyCodes.code(code);
  if (!item) return code;

  try {
    const parts = new Intl.DisplayNames([locale], { type: 'currency' });
    const localized = parts.of(code);
    return localized || item.currency || code;
  } catch {
    return item.currency || code;
  }
}

export function getUserGeoConfig(): GeoConfig {
  try {
    const timeZone = getSafeTimeZone();
    const browserLocale = getSafeBrowserLocale();
    const allLanguages = getSafeLanguages();
    const [, region] = browserLocale.split('-');
    const countryCodeFromLocale = region?.toUpperCase() || '';
    const systemCurrency = getSafeSystemCurrency(browserLocale);

    console.group('🌍 [geoUserCurrency] análise iniciada');
    console.log('timeZone:', timeZone);
    console.log('browserLocale:', browserLocale);
    console.log('languages:', allLanguages);
    console.log('systemCurrency:', systemCurrency);

    // 1) moeda do sistema, quando não for genérica
    if (!isLikelyGenericCurrency(systemCurrency)) {
      const result: GeoConfig = {
        currency: systemCurrency,
        country: SYSTEM_CURRENCY_COUNTRY_MAP[systemCurrency] || countryCodeFromLocale || 'US',
        source: 'system-currency',
      };

      console.log('✅ etapa 1: moeda do sistema usada', result);
      console.groupEnd();
      return result;
    }

    // 2) desempate para sul de África
    const southernAfricaTZs = [
      'Africa/Johannesburg',
      'Africa/Maputo',
      'Africa/Harare',
      'Africa/Gaborone',
      'Africa/Blantyre',
    ];

    if (southernAfricaTZs.includes(timeZone)) {
      const normalizedLangs = allLanguages.map((l) => l.toLowerCase());

      const isMozambique =
        timeZone === 'Africa/Maputo' ||
        countryCodeFromLocale === 'MZ' ||
        normalizedLangs.some((l) => l === 'pt-mz' || l.includes('-mz')) ||
        (normalizedLangs.some((l) => l.startsWith('pt')) && timeZone !== 'Africa/Johannesburg');

      if (isMozambique) {
        const result: GeoConfig = {
          currency: 'MZN',
          country: 'MZ',
          source: 'southern-africa-heuristic',
        };

        console.log('✅ etapa 2: Moçambique detectado', result);
        console.groupEnd();
        return result;
      }

      if (timeZone === 'Africa/Harare' || countryCodeFromLocale === 'ZW') {
        const result: GeoConfig = {
          currency: 'ZWG',
          country: 'ZW',
          source: 'southern-africa-heuristic',
        };

        console.log('✅ etapa 2: Zimbabwe detectado', result);
        console.groupEnd();
        return result;
      }

      const result: GeoConfig = {
        currency: 'ZAR',
        country: 'ZA',
        source: 'southern-africa-heuristic',
      };

      console.log('✅ etapa 2: África do Sul por fallback regional', result);
      console.groupEnd();
      return result;
    }

    // 3) mapa direto por timezone
    const tzMatch = TZ_GEO_MAP[timeZone];
    if (tzMatch) {
      const result: GeoConfig = {
        currency: tzMatch.currency,
        country: tzMatch.country,
        source: 'timezone-map',
      };

      console.log('✅ etapa 3: timezone map', result);
      console.groupEnd();
      return result;
    }

    // 4) locale
    if (countryCodeFromLocale && LOCALE_REGION_MAP[countryCodeFromLocale]) {
      const localeMatch = LOCALE_REGION_MAP[countryCodeFromLocale];

      const result: GeoConfig = {
        currency: localeMatch.currency,
        country: localeMatch.country,
        source: 'locale-region',
      };

      console.log('✅ etapa 4: região do navegador', result);
      console.groupEnd();
      return result;
    }

    // 5) fallback
    const fallback: GeoConfig = {
      currency: 'USD',
      country: 'US',
      source: 'fallback',
    };

    console.log('⚠️ fallback global', fallback);
    console.groupEnd();
    return fallback;
  } catch (error) {
    console.error('❌ erro ao detectar geo/currency', error);

    return {
      currency: 'USD',
      country: 'US',
      source: 'fallback',
    };
  }
}

export function getUserCurrency(): string {
  return getUserGeoConfig().currency;
}

export function getUserCountry(): string {
  return getUserGeoConfig().country;
}