export type StorePublicData = {
  id: string;
  name: string;
  settings: any;
  logo_url: string | null;
  whatsapp_number?: string | null;
  owner_email?: string | null;
  slug?: string | null;
  updated_at_name?: string | null;
  description?: string | null;
  currency?: string | null;
  [key: string]: any;
};

export type StoreCachePayload = {
  data: StorePublicData;
  savedAt: number;
  expiresAt: number;
  version: number;
  signature: string;
};

export const STORE_CACHE_TTL = 1000 * 60 * 60 * 4; // 4 Horas
const STORE_CACHE_VERSION = 4;

export function getCacheKey(slug?: string): string {
  return `store-cache:v${STORE_CACHE_VERSION}:${slug || 'default'}`;
}

export function buildStoreSignature(data: Partial<StorePublicData> | null | undefined): string {
  if (!data) return "";
  try {
    return JSON.stringify({
      id: data.id ?? null,
      slug: data.slug ?? null,
      name: data.name ?? null,
      logo_url: data.logo_url ?? null,
      whatsapp_number: data.whatsapp_number ?? null,
      owner_email: data.owner_email ?? null,
      updated_at_name: data.updated_at_name ?? null,
      description: data.description ?? null,
      currency: data.currency ?? null,
      settings: data.settings ?? null,
    });
  } catch {
    return "";
  }
}

function isValidCachePayload(value: unknown): value is StoreCachePayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as StoreCachePayload;
  return (
    !!payload.data &&
    typeof payload.savedAt === "number" &&
    typeof payload.expiresAt === "number" &&
    typeof payload.version === "number" &&
    typeof payload.signature === "string"
  );
}

export function readStoreCache(slug?: string): StoreCachePayload | null {
  if (!slug || typeof window === "undefined") return null;
  const key = getCacheKey(slug);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!isValidCachePayload(parsed) || parsed.version !== STORE_CACHE_VERSION || Date.now() >= parsed.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    try { localStorage.removeItem(key); } catch {}
    return null;
  }
}

export function writeStoreCache(slug: string | undefined, data: StorePublicData): StoreCachePayload | null {
  if (!slug || typeof window === "undefined") return null;
  const now = Date.now();
  const payload: StoreCachePayload = {
    data,
    savedAt: now,
    expiresAt: now + STORE_CACHE_TTL,
    version: STORE_CACHE_VERSION,
    signature: buildStoreSignature(data),
  };
  try {
    localStorage.setItem(getCacheKey(slug), JSON.stringify(payload));
    return payload;
  } catch {
    return null;
  }
}

export function clearStoreCache(slug?: string): void {
  if (!slug || typeof window === "undefined") return;
  try {
    localStorage.removeItem(getCacheKey(slug));
  } catch {}
}

export function getSocialLinks(settings: any) {
  const social = settings?.social_links || settings?.socials || settings?.social || {};
  return [
    { key: "whatsapp", icon: "whatsapp", href: social?.whatsapp || settings?.whatsapp_link || null },
    { key: "instagram", icon: "instagram", href: social?.instagram || null },
    { key: "twitter", icon: "twitter", href: social?.twitter || social?.x || settings?.twitter || settings?.x || null },
    { key: "github", icon: "github", href: social?.github || null },
  ].filter((item): item is { key: string; icon: string; href: string } => typeof item.href === "string" && item.href.trim().length > 0);
}