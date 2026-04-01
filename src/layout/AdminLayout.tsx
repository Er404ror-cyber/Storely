import { useState, useEffect, useMemo, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  Settings,
  Loader2,
  Menu,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { AdminSidebar } from '../components/headers/adminHeader';
import { useTranslate } from '../context/LanguageContext';
import type { AdminPage, AdminStore, CachePayload } from '../types/admin';

const BASE_DOMAIN = 'https://storelyy.vercel.app';

const ADMIN_STORE_CACHE_TTL = 1000 * 60 * 5;
const ADMIN_PAGES_CACHE_TTL = 1000 * 60 * 2;

const ADMIN_STORE_CACHE_KEY = 'storelyy_admin_store_cache';

type DataSource = 'cache' | 'network' | 'none';

function getAdminPagesCacheKey(storeId?: string) {
  return `storelyy_admin_pages_cache:${storeId ?? 'unknown'}`;
}

function generateSlug(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

function readCache<T>(key: string): CachePayload<T> | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachePayload<T>;

    if (
      !parsed ||
      typeof parsed.savedAt !== 'number' ||
      typeof parsed.expiresAt !== 'number' ||
      parsed.data == null
    ) {
      localStorage.removeItem(key);
      return null;
    }

    if (Date.now() >= parsed.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

function writeCache<T>(key: string, data: T, ttl: number): CachePayload<T> | null {
  if (typeof window === 'undefined') return null;

  const now = Date.now();

  const payload: CachePayload<T> = {
    data,
    savedAt: now,
    expiresAt: now + ttl,
  };

  try {
    localStorage.setItem(key, JSON.stringify(payload));
    return payload;
  } catch {
    return null;
  }
}

function clearCache(key: string) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch {
    // ignore localStorage removal errors
  }
}

function formatCacheRemaining(ms: number) {
  if (ms <= 0) return '0s';

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, lang, setLang } = useTranslate();

  const isEditorRoute = location.pathname.includes('/editor/');

  const [isOpen, setIsOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [storeCacheLeft, setStoreCacheLeft] = useState(0);
  const [source, setSource] = useState<DataSource>('none');

  const initialStoreCache = useMemo(
    () => readCache<AdminStore>(ADMIN_STORE_CACHE_KEY),
    []
  );

  const handleLangChange = useCallback(() => {
    const newLang = lang === 'pt' ? 'en' : 'pt';
    setLang(newLang);

    toast.success(newLang === 'pt' ? 'Idioma: Português' : 'Language: English', {
      id: 'lang',
      icon: '🌎',
      style: {
        borderRadius: '12px',
        background: '#1e293b',
        color: '#fff',
        fontSize: '12px',
      },
    });
  }, [lang, setLang]);

  useEffect(() => {
    if (initialStoreCache) {
      setSource('cache');
      setStoreCacheLeft(Math.max(initialStoreCache.expiresAt - Date.now(), 0));
    } else {
      setSource('none');
      setStoreCacheLeft(0);
    }
  }, [initialStoreCache]);

  useEffect(() => {
    if (isEditorRoute) setIsOpen(false);
  }, [location.pathname, isEditorRoute]);

  const {
    data: store,
    isLoading: storeLoading,
    isFetching: storeFetching,
  } = useQuery<AdminStore>({
    queryKey: ['admin-store'],
    initialData: initialStoreCache?.data,
    initialDataUpdatedAt: initialStoreCache?.savedAt,
    staleTime: ADMIN_STORE_CACHE_TTL,
    gcTime: ADMIN_STORE_CACHE_TTL * 6,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not found');
      }

      const { data, error } = await supabase
        .from('stores')
        .select('id, name, slug, owner_id, logo_url, updated_at_name, created_at, currency')
        .eq('owner_id', user.id)
        .single();

      if (error) throw error;

      const safeStore: AdminStore = {
        id: data.id,
        name: data.name ?? '',
        slug: data.slug ?? '',
        owner_id: data.owner_id,
        logo_url: data.logo_url ?? null,
        updated_at_name: data.updated_at_name ?? null,
        created_at: data.created_at ?? '',
        currency: data.currency ?? null,
      };

      const payload = writeCache(ADMIN_STORE_CACHE_KEY, safeStore, ADMIN_STORE_CACHE_TTL);

      setSource('network');
      setStoreCacheLeft(payload ? Math.max(payload.expiresAt - Date.now(), 0) : 0);

      return safeStore;
    },
  });

  const storeId = store?.id ?? '';

  const initialPagesCache = useMemo(() => {
    if (!storeId) return null;
    return readCache<AdminPage[]>(getAdminPagesCacheKey(storeId));
  }, [storeId]);

  const {
    data: pages = [],
    isLoading: pagesLoading,
  } = useQuery<AdminPage[]>({
    queryKey: ['admin-pages', storeId],
    enabled: !!storeId,
    initialData: initialPagesCache?.data,
    initialDataUpdatedAt: initialPagesCache?.savedAt,
    staleTime: ADMIN_PAGES_CACHE_TTL,
    gcTime: ADMIN_PAGES_CACHE_TTL * 6,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
    queryFn: async () => {
      if (!storeId) {
        throw new Error('Store not found');
      }

      const { data, error } = await supabase
        .from('pages')
        .select('id, store_id, title, slug, type, is_home, created_at')
        .eq('store_id', storeId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const safePages: AdminPage[] = (data || []).map((page) => ({
        id: page.id,
        store_id: page.store_id,
        title: page.title ?? '',
        slug: page.slug ?? '',
        type: page.type ?? '',
        is_home: page.is_home ?? false,
        created_at: page.created_at ?? '',
      }));

      writeCache(getAdminPagesCacheKey(storeId), safePages, ADMIN_PAGES_CACHE_TTL);
      return safePages;
    },
  });

  useEffect(() => {
    if (store?.name) {
      setNewName(store.name);
    }
  }, [store?.name]);

  const updateStoreMutation = useMutation({
    mutationFn: async (name: string) => {
      const cleanName = name.trim();
      const newSlug = generateSlug(cleanName);

      if (!store || !cleanName) {
        throw new Error(t('invalid_store_name'));
      }

      if (
        cleanName.toLowerCase() === store.name.toLowerCase() ||
        newSlug === store.slug
      ) {
        setIsEditingName(false);
        return store;
      }

      const { data: existingStore, error: slugCheckError } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', store.id)
        .maybeSingle();

      if (slugCheckError) throw slugCheckError;
      if (existingStore) throw new Error(t('name_taken'));

      const { data, error } = await supabase
        .from('stores')
        .update({
          name: cleanName,
          slug: newSlug,
          updated_at_name: new Date().toISOString(),
        })
        .eq('id', store.id)
        .select('id, name, slug, owner_id, logo_url, updated_at_name, created_at, currency')
        .single();

      if (error) {
        throw new Error(error.code === '23505' ? t('name_taken') : error.message);
      }

      const safeStore: AdminStore = {
        id: data.id,
        name: data.name ?? '',
        slug: data.slug ?? '',
        owner_id: data.owner_id,
        logo_url: data.logo_url ?? null,
        updated_at_name: data.updated_at_name ?? null,
        created_at: data.created_at ?? '',
        currency: data.currency ?? null,
      };

      return safeStore;
    },
    onSuccess: (updatedStore) => {
      if (!updatedStore) return;

      queryClient.setQueryData(['admin-store'], updatedStore);

      const payload = writeCache(
        ADMIN_STORE_CACHE_KEY,
        updatedStore,
        ADMIN_STORE_CACHE_TTL
      );

      setSource('network');
      setStoreCacheLeft(payload ? Math.max(payload.expiresAt - Date.now(), 0) : 0);
      setIsEditingName(false);
      toast.success(t('update_success'));
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();

      clearCache(ADMIN_STORE_CACHE_KEY);
      if (storeId) {
        clearCache(getAdminPagesCacheKey(storeId));
      }

      queryClient.clear();
      navigate('/');
    } catch {
      toast.error(t('error_exiting'));
    }
  }, [navigate, queryClient, storeId, t]);

  useEffect(() => {
    if (!store?.updated_at_name) {
      setTimeLeft('');
      return;
    }

    const updatedAt = store.updated_at_name;

    const interval = window.setInterval(() => {
      const lastUpdate = new Date(updatedAt).getTime();
      const diff = lastUpdate + 24 * 60 * 60 * 1000 - Date.now();

      if (diff <= 0) {
        setTimeLeft('');
        window.clearInterval(interval);
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [store?.updated_at_name]);

  useEffect(() => {
    const syncCacheLeft = () => {
      const cache = readCache<AdminStore>(ADMIN_STORE_CACHE_KEY);
      const next = cache ? Math.max(cache.expiresAt - Date.now(), 0) : 0;

      setStoreCacheLeft((prev) => (prev !== next ? next : prev));

      if (!storeFetching) {
        setSource(cache ? 'cache' : 'none');
      }
    };

    syncCacheLeft();
    const interval = window.setInterval(syncCacheLeft, 1000);

    return () => window.clearInterval(interval);
  }, [storeFetching]);

  const statusText = storeFetching
    ? t('cacheStatusSyncing')
    : source === 'cache'
      ? t('cacheStatusLocal')
      : source === 'network'
        ? t('cacheStatusNetwork')
        : t('cacheStatusWaiting');

  if (storeLoading && !store) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  const storeUrl = `${BASE_DOMAIN}/${store?.slug ?? ''}`;

  const menuItems = [
    { path: '/admin', label: t('nav_dashboard'), icon: <LayoutDashboard size={20} /> },
    { path: '/admin/paginas', label: t('nav_pages'), icon: <FileText size={20} /> },
    { path: '/admin/produtos', label: t('nav_products'), icon: <ShoppingBag size={20} /> },
    { path: '/admin/configuracoes', label: t('nav_settings'), icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-white font-sans text-slate-900 overflow-hidden relative">
      <AdminSidebar
        t={t}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        store={store}
        pages={pages}
        location={location}
        isEditingName={isEditingName}
        setIsEditingName={setIsEditingName}
        newName={newName}
        setNewName={setNewName}
        timeLeft={timeLeft}
        updateStoreMutation={updateStoreMutation}
        confirmLogout={confirmLogout}
        setConfirmLogout={setConfirmLogout}
        handleLogout={handleLogout}
        storeUrl={storeUrl}
        menuItems={menuItems}
        lang={lang}
        handleLangChange={handleLangChange}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full bg-white relative overflow-hidden">
        {isEditorRoute && !isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="fixed top-3 sm:top-5 left-5 z-[70] w-10 h-10 flex items-center justify-center bg-white/80 border border-slate-200 shadow-lg rounded-xl text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <Menu size={20} strokeWidth={2.5} />
          </button>
        )}

        {!isEditorRoute && (
          <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-slate-100 bg-white/90 sticky top-0 z-50 shrink-0 ">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setIsOpen(true)}
                className="p-2 -ml-2 text-slate-600 lg:hidden"
              >
                <Menu size={24} />
              </button>

              <div className="min-w-0">
                <div className="font-black text-[12px] md:text-[13px] uppercase italic truncate max-w-[160px] md:max-w-[240px]">
                  {store?.name}
                </div>

                <div className="text-[9px] md:text-[10px] text-slate-400 truncate">
                  {t('cacheLabel')} · {formatCacheRemaining(storeCacheLeft)} · {statusText}
                  {store?.currency ? ` · ${store.currency}` : ''}
                </div>
              </div>
            </div>

            <a
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 -mr-2 text-slate-400"
            >
              <ExternalLink size={20} />
            </a>
          </header>
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet
            context={{
              store,
              pages,
              pagesLoading,
            }}
          />
        </div>
      </main>
    </div>
  );
}