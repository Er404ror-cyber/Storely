import { supabase } from "../lib/supabase";

export const SLUG_CACHE_TTL_MS = 1000 * 60 * 20;
export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 20;
export const STORE_NAME_MAX_LENGTH = 15;
export const PASSWORD_MIN_LENGTH = 6;

export type AuthMode = "signup" | "login" | "forgot";
export type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

type SlugCacheEntry = {
  exists: boolean;
  expiresAt: number;
};

const memorySlugCache = new Map<string, SlugCacheEntry>();
const inflightSlugChecks = new Map<string, Promise<boolean>>();

const RESERVED_SLUGS = new Set([
  "admin", "api", "app", "auth", "blog", "dashboard", "help", "login",
  "register", "reset-password", "settings", "store", "stores", "support",
  "privacy", "terms", "about", "contact", "home",
]);

// Validação Regex para evitar enviar emails falsos para o Supabase
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function slugifyStoreName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function readSlugCache(slug: string): SlugCacheEntry | null {
  if (!slug) return null;
  const memory = memorySlugCache.get(slug);
  if (memory && memory.expiresAt > Date.now()) return memory;

  try {
    const raw = sessionStorage.getItem(`storely:slug:${slug}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SlugCacheEntry;
    if (parsed.expiresAt > Date.now()) {
      memorySlugCache.set(slug, parsed);
      return parsed;
    }
    sessionStorage.removeItem(`storely:slug:${slug}`);
  } catch {
    // ignore
  }
  return null;
}

export function writeSlugCache(slug: string, exists: boolean) {
  const entry: SlugCacheEntry = {
    exists,
    expiresAt: Date.now() + SLUG_CACHE_TTL_MS,
  };
  memorySlugCache.set(slug, entry);
  try {
    sessionStorage.setItem(`storely:slug:${slug}`, JSON.stringify(entry));
  } catch {
    // ignore
  }
}

export async function fetchSlugExists(slug: string): Promise<boolean> {
  const cached = readSlugCache(slug);
  if (cached) return cached.exists;

  const pending = inflightSlugChecks.get(slug);
  if (pending) return pending;

  const promise = (async () => {
    const { data, error } = await supabase
      .from("stores")
      .select("id")
      .eq("slug", slug)
      .limit(1);

    if (error) throw error;
    const exists = Array.isArray(data) && data.length > 0;
    writeSlugCache(slug, exists);
    return exists;
  })();

  inflightSlugChecks.set(slug, promise);

  try {
    return await promise;
  } finally {
    inflightSlugChecks.delete(slug);
  }
}

export function isValidSlug(slug: string) {
  if (!slug) return false;
  if (slug.length < SLUG_MIN_LENGTH) return false;
  if (slug.length > SLUG_MAX_LENGTH) return false;
  if (!/^[a-z0-9-]+$/.test(slug)) return false;
  if (RESERVED_SLUGS.has(slug)) return false;
  return true;
}