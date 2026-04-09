export const PRODUCT_IMAGE_LIMIT = 1024 * 1024;
export const PRODUCT_IMAGE_SLOTS = 4;

export const PRODUCT_LIMITS = {
  name: 30,
  category: 15,
  description: 600,
  maxBreaks: 4,
};

export const PRODUCT_UNIT_OPTIONS = [
  'un',
  'par',
  'kit',
  'pacote',
  'caixa',
  'kg',
  'hora',
  'dia',
  'semana',
  'mes',
  'servico',
  'g',
  'l',
  'ml',
  'm',
  'cm',
  'm2',
  'm3',
] as const;

export function sanitizeMajor(value: string): string {
  const clean = value.replace(/\D/g, '');
  return clean.replace(/^0+(?=\d)/, '');
}

export function sanitizeCents(value: string): string {
  return value.replace(/\D/g, '').slice(0, 2);
}

export function splitPrice(value: string | number | null | undefined): {
  major: string;
  cents: string;
} {
  if (value === null || value === undefined || value === '') {
    return { major: '', cents: '00' };
  }

  const normalized = Number(value);
  if (Number.isNaN(normalized)) {
    return { major: '', cents: '00' };
  }

  const [major, cents] = normalized.toFixed(2).split('.');
  return { major, cents };
}

export function composePrice(major: string, cents: string): string {
  const safeMajor = major.trim() === '' ? '' : sanitizeMajor(major);
  const safeCents = sanitizeCents(cents).padEnd(2, '0').slice(0, 2);

  if (!safeMajor) return '';
  return `${safeMajor}.${safeCents}`;
}

export function normalizePriceString(value: string): string {
  const numeric = Number(value);
  if (Number.isNaN(numeric) || numeric < 0) return '';
  return numeric.toFixed(2);
}

export function createProductSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
}

export function normalizeCategory(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}