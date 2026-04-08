import { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Circle,
  Fingerprint,
  Globe,
  Home,
  Layers,
  Layout,
  Mail,
  Package,
  Phone,
  Plus,
  Settings2,
  Sparkles,
  Store,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useTranslate } from '../context/LanguageContext';

interface Product {
  id: string;
  name: string;
  price: number;
  currency?: string | null;
  image_url?: string | null;
  main_image?: string | null;
  is_active: boolean;
  created_at?: string;
}

interface Page {
  id: string;
  title: string;
  is_home: boolean;
  updated_at?: string;
}

interface StoreRow {
  id: string;
  name?: string | null;
  slug?: string | null;
  logo_url?: string | null;
  whatsapp_number?: string | null;
  currency?: string | null;
  created_at?: string | null;
  settings?: {
    currency?: string | null;
  } | null;
}

interface StepItem {
  id: string;
  title: string;
  desc: string;
  done: boolean;
  icon: LucideIcon;
  actionLabel: string;
  onClick: () => void;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
}

interface ActionCardProps {
  title: string;
  desc: string;
  icon: LucideIcon;
  onClick: () => void;
  primary?: boolean;
}

const resolveCurrency = (store?: StoreRow | null) =>
  store?.currency || store?.settings?.currency || '';

const StatCard = memo(function StatCard({
  label,
  value,
  icon: Icon,
}: StatCardProps) {
  return (
    <div
      className="rounded-[1.6rem] border border-gray-200 bg-white p-4 shadow-sm"
      style={{ contain: 'layout style paint' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-400">
            {label}
          </p>
          <p className="mt-2 truncate text-2xl font-black tracking-tight text-gray-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-blue-600">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
});

const ActionCard = memo(function ActionCard({
  title,
  desc,
  icon: Icon,
  onClick,
  primary = false,
}: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className={[
        'group w-full rounded-[1.5rem] border p-4 text-left transition-all duration-200 active:scale-[0.99]',
        primary
          ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
          : 'border-gray-200 bg-white text-gray-900 hover:border-blue-200 hover:bg-gray-50',
      ].join(' ')}
      style={{ contain: 'layout style paint' }}
    >
      <div className="flex items-center gap-4">
        <div
          className={[
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
            primary ? 'bg-white/10' : 'bg-blue-50 text-blue-600',
          ].join(' ')}
        >
          <Icon size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-black tracking-tight">
            {title}
          </h3>
          <p
            className={[
              'mt-1 text-sm',
              primary ? 'text-blue-100' : 'text-gray-500',
            ].join(' ')}
          >
            {desc}
          </p>
        </div>

        <ArrowRight
          size={16}
          className={primary ? 'text-white/80' : 'text-gray-300 group-hover:text-blue-500'}
        />
      </div>
    </button>
  );
});

const SetupStepCard = memo(function SetupStepCard({ item }: { item: StepItem }) {
  const Icon = item.icon;

  return (
    <div
      className={[
        'rounded-[1.4rem] border p-4 transition-all',
        item.done
          ? 'border-emerald-200 bg-emerald-50/80'
          : 'border-gray-200 bg-white',
      ].join(' ')}
      style={{ contain: 'layout style paint' }}
    >
      <div className="flex items-start gap-4">
        <div
          className={[
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
            item.done
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-700',
          ].join(' ')}
        >
          <Icon size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black tracking-tight text-gray-900">
              {item.title}
            </h3>
            {item.done ? (
              <CheckCircle2 size={16} className="text-emerald-600" />
            ) : (
              <Circle size={14} className="text-gray-300" />
            )}
          </div>

          <p className="mt-1 text-sm text-gray-500">{item.desc}</p>

          {!item.done && (
            <button
              onClick={item.onClick}
              className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-white transition-colors hover:bg-blue-600"
            >
              {item.actionLabel}
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

const ProductRow = memo(function ProductRow({
  product,
  onClick,
  fallbackCurrency,
  activeLabel,
  pausedLabel,
}: {
  product: Product;
  onClick: () => void;
  fallbackCurrency: string;
  activeLabel: string;
  pausedLabel: string;
}) {
  const image = product.image_url || product.main_image || '';

  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-[1.4rem] border border-gray-200 bg-white p-4 text-left transition-all hover:border-blue-200 hover:bg-gray-50 active:scale-[0.995]"
      style={{ contain: 'layout style paint' }}
    >
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <Package size={20} className="text-gray-300" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-black tracking-tight text-gray-900">
          {product.name}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={[
              'rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide',
              product.is_active
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-gray-100 text-gray-500',
            ].join(' ')}
          >
            {product.is_active ? activeLabel : pausedLabel}
          </span>

          <span className="text-xs font-black text-blue-600">
            {product.price}{' '}
            <span className="uppercase">
              {product.currency || fallbackCurrency || 'USD'}
            </span>
          </span>
        </div>
      </div>

      <ArrowRight size={16} className="shrink-0 text-gray-300 group-hover:text-blue-500" />
    </button>
  );
});

const PageRow = memo(function PageRow({
  page,
  onClick,
  homeLabel,
  pageLabel,
}: {
  page: Page;
  onClick: () => void;
  homeLabel: string;
  pageLabel: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'group w-full rounded-[1.4rem] border p-4 text-left transition-all active:scale-[0.995]',
        page.is_home
          ? 'border-gray-900 bg-gray-900 text-white hover:bg-blue-600'
          : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-gray-50',
      ].join(' ')}
      style={{ contain: 'layout style paint' }}
    >
      <div className="flex items-center gap-4">
        <div
          className={[
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
            page.is_home ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700',
          ].join(' ')}
        >
          {page.is_home ? <Home size={19} /> : <Layout size={19} />}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={[
              'text-[10px] font-black uppercase tracking-[0.22em]',
              page.is_home ? 'text-white/60' : 'text-gray-400',
            ].join(' ')}
          >
            {page.is_home ? homeLabel : pageLabel}
          </p>
          <h3 className="mt-1 truncate text-sm font-black tracking-tight">
            {page.title}
          </h3>
        </div>

        {page.is_home ? (
          <ArrowUpRight size={16} className="shrink-0 text-white/70" />
        ) : (
          <ArrowRight size={16} className="shrink-0 text-gray-300 group-hover:text-blue-500" />
        )}
      </div>
    </button>
  );
});

function Dashboard() {
  const navigate = useNavigate();
  const { t, language } = useTranslate();

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['dashboard-professional-v3'],
    queryFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw new Error('Not authenticated');

      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (storeError || !store) throw new Error('Store not found');

      const [productsRes, pagesRes] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('store_id', store.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('pages')
          .select('*')
          .eq('store_id', store.id)
          .order('updated_at', { ascending: false }),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (pagesRes.error) throw pagesRes.error;

      const products: Product[] = productsRes.data ?? [];
      const pages: Page[] = pagesRes.data ?? [];

      return {
        store: store as StoreRow,
        owner_email: user.email ?? '',
        createdAt: store.created_at,
        products,
        pages,
        activeProducts: products.filter((p) => p.is_active),
        pausedProducts: products.filter((p) => !p.is_active),
        homePage: pages.find((p) => p.is_home) ?? null,
        recentPages: pages.filter((p) => !p.is_home).slice(0, 4),
        hasProducts: products.length > 0,
        hasPages: pages.length > 0,
      };
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 15,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const ui = useMemo(() => {
    const store = data?.store;
    const products = data?.products ?? [];
    const pages = data?.pages ?? [];

    const hasPhone = Boolean(store?.whatsapp_number?.trim());
    const hasCurrency = Boolean(resolveCurrency(store)?.trim());
    const hasProducts = products.length > 0;
    const hasHomePage = pages.some((p) => p.is_home);

    const doneCount = [hasPhone, hasCurrency, hasProducts, hasHomePage].filter(Boolean).length;
    const totalCount = 4;
    const progress = Math.round((doneCount / totalCount) * 100);
    const showTutorial = !hasPhone || !hasCurrency || !hasProducts || !hasHomePage;

    return {
      hasPhone,
      hasCurrency,
      hasProducts,
      hasHomePage,
      doneCount,
      totalCount,
      progress,
      showTutorial,
      isNew: !hasPhone && !hasCurrency && !hasProducts && !hasHomePage,
      currency: resolveCurrency(store),
      storeUrl: store?.slug ? `${store.slug}.storely.app` : '---',
      productCount: products.length,
      pageCount: pages.length,
      activeCount: data?.activeProducts?.length ?? 0,
      pausedCount: data?.pausedProducts?.length ?? 0,
    };
  }, [data]);

  const steps = useMemo<StepItem[]>(() => {
    if (!data) return [];

    return [
      {
        id: 'phone',
        title: t('dashboard_step_phone_title'),
        desc: t('dashboard_step_phone_desc'),
        done: ui.hasPhone,
        icon: Phone,
        actionLabel: t('dashboard_step_phone_action'),
        onClick: () => navigate('/admin/configuracoes'),
      },
      {
        id: 'currency',
        title: t('dashboard_step_currency_title'),
        desc: t('dashboard_step_currency_desc'),
        done: ui.hasCurrency,
        icon: Wallet,
        actionLabel: t('dashboard_step_currency_action'),
        onClick: () => navigate('/admin/produtos'),
      },
      {
        id: 'product',
        title: t('dashboard_step_product_title'),
        desc: t('dashboard_step_product_desc'),
        done: ui.hasProducts,
        icon: Package,
        actionLabel: t('dashboard_step_product_action'),
        onClick: () => navigate('/admin/produtos'),
      },
      {
        id: 'page',
        title: t('dashboard_step_page_title'),
        desc: t('dashboard_step_page_desc'),
        done: ui.hasHomePage,
        icon: Home,
        actionLabel: t('dashboard_step_page_action'),
        onClick: () => navigate('/admin/paginas'),
      },
    ];
  }, [data, navigate, t, ui.hasPhone, ui.hasCurrency, ui.hasProducts, ui.hasHomePage]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-6">
        <div className="flex flex-col items-center gap-4">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-blue-600/15 border-t-blue-600" />
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-gray-400">
            {t('loading_engine')}
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] p-4 md:p-8">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-red-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-gray-900">
            {t('dashboard_error_title')}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {t('dashboard_error_desc')}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-2xl bg-gray-900 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-white hover:bg-blue-600"
          >
            {t('dashboard_error_action')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-4 text-gray-900 md:p-6 xl:p-8">
      <div className="mx-auto max-w-[1380px] space-y-6">
        {/* Top */}
        <section className="overflow-hidden rounded-[2.2rem] border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 gap-6 p-5 md:p-7 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.4rem] border border-gray-200 bg-gray-50">
                  {data.store.logo_url ? (
                    <img
                      src={data.store.logo_url}
                      alt="Store logo"
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <Store size={24} className="text-blue-600" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-2xl font-black tracking-tight md:text-3xl">
                      {data.store.name || t('dashboard_store_default_name')}
                    </h1>

                    {isFetching && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700">
                        <Sparkles size={12} />
                        {t('dashboard_syncing')}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 max-w-2xl text-sm text-gray-500">
                    {ui.showTutorial
                      ? ui.isNew
                        ? t('dashboard_welcome_new')
                        : t('dashboard_welcome_incomplete')
                      : t('dashboard_welcome_ready')}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-gray-600">
                      <Phone size={12} />
                      {data.store.whatsapp_number || t('no_contact')}
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-gray-600">
                      <Wallet size={12} />
                      {ui.currency || t('dashboard_currency_missing')}
                    </span>

                    <span className="inline-flex max-w-[240px] items-center gap-2 truncate rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-gray-600">
                      <Globe size={12} />
                      {ui.storeUrl}
                    </span>
                  </div>

                  {ui.showTutorial && (
                    <div className="mt-5 max-w-[360px]">
                      <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        <span>{t('dashboard_progress_label')}</span>
                        <span>
                          {ui.doneCount}/{ui.totalCount}
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
                          style={{ width: `${ui.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="xl:col-span-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
                <StatCard
                  label={t('dashboard_stat_products')}
                  value={ui.productCount}
                  icon={Package}
                />
                <StatCard
                  label={t('status_active')}
                  value={ui.activeCount}
                  icon={Sparkles}
                />
                <StatCard
                  label={t('dashboard_stat_pages')}
                  value={ui.pageCount}
                  icon={Layout}
                />
                <StatCard
                  label={t('dashboard_stat_setup')}
                  value={`${ui.progress}%`}
                  icon={BarChart3}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Always visible quick actions */}
        <section className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                {t('dashboard_quick_label')}
              </p>
              <h2 className="mt-2 text-xl font-black tracking-tight text-gray-900">
                {t('dashboard_quick_title')}
              </h2>
            </div>

            <p className="text-sm text-gray-500">
              {t('dashboard_quick_hint')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <ActionCard
              title={t('action_new_product')}
              desc={t('action_new_product_sub')}
              icon={Package}
              onClick={() => navigate('/admin/produtos')}
              primary
            />
            <ActionCard
              title={t('action_create_page')}
              desc={t('action_create_page_sub')}
              icon={Layout}
              onClick={() => navigate('/admin/paginas')}
            />
            <ActionCard
              title={t('dashboard_quick_settings_title')}
              desc={t('dashboard_quick_settings_desc')}
              icon={Settings2}
              onClick={() => navigate('/admin/configuracoes')}
            />
          </div>
        </section>

        {/* Tutorial only when needed */}
        {ui.showTutorial && (
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                    {t('dashboard_setup_label')}
                  </p>
                  <h2 className="mt-2 text-xl font-black tracking-tight text-gray-900">
                    {t('dashboard_setup_title')}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {t('dashboard_setup_desc')}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {steps.map((item) => (
                    <SetupStepCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </div>

            <div className="xl:col-span-4">
              <div className="rounded-[2rem] bg-gray-900 p-5 text-white shadow-sm md:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
                  {t('dashboard_next_label')}
                </p>
                <h2 className="mt-2 text-xl font-black tracking-tight">
                  {t('dashboard_setup_focus_title')}
                </h2>
                <p className="mt-2 text-sm text-white/75">
                  {t('dashboard_setup_focus_desc')}
                </p>

                {steps.find((item) => !item.done) && (
                  <button
                    onClick={() => steps.find((item) => !item.done)?.onClick()}
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-[11px] font-black uppercase tracking-wider text-gray-900 transition-colors hover:bg-blue-50"
                  >
                    {steps.find((item) => !item.done)?.actionLabel}
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Main content */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8 space-y-6">
            <div className="rounded-[2rem] border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 p-5 md:p-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                    {t('section_catalog')}
                  </p>
                  <h2 className="mt-2 text-xl font-black tracking-tight text-gray-900">
                    {t('dashboard_products_title')}
                  </h2>
                </div>

                <button
                  onClick={() => navigate('/admin/produtos')}
                  className="rounded-2xl bg-gray-900 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-white transition-colors hover:bg-blue-600"
                >
                  {t('manage_inventory')}
                </button>
              </div>

              <div className="p-5 md:p-6">
                {data.activeProducts.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {data.activeProducts.slice(0, 6).map((prod) => (
                      <ProductRow
                        key={prod.id}
                        product={prod}
                        onClick={() => navigate(`/admin/produtos/${prod.id}`)}
                        fallbackCurrency={ui.currency}
                        activeLabel={t('status_active')}
                        pausedLabel={t('section_paused')}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-gray-200 bg-[#fafafa] px-6 py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-blue-50 text-blue-600">
                      <Sparkles size={30} />
                    </div>
                    <h3 className="mt-4 text-lg font-black tracking-tight text-gray-900">
                      {t('empty_products_title')}
                    </h3>
                    <p className="mt-2 max-w-md text-sm text-gray-500">
                      {t('empty_products_desc')}
                    </p>
                    <button
                      onClick={() => navigate('/admin/produtos')}
                      className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-[11px] font-black uppercase tracking-wider text-white hover:bg-blue-600"
                    >
                      <Plus size={14} />
                      {t('btn_start_catalog')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {data.pausedProducts.length > 0 && (
              <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                      {t('section_paused')}
                    </p>
                    <h2 className="mt-2 text-lg font-black tracking-tight text-gray-900">
                      {t('dashboard_paused_title')}
                    </h2>
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-gray-500">
                    {data.pausedProducts.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {data.pausedProducts.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => navigate(`/admin/produtos/${prod.id}`)}
                      className="flex items-center gap-3 rounded-[1.25rem] border border-gray-200 bg-white p-3 text-left transition-all hover:border-orange-200 hover:bg-gray-50"
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-gray-100 grayscale opacity-60">
                        {prod.image_url || prod.main_image ? (
                          <img
                            src={prod.image_url || prod.main_image || ''}
                            alt={prod.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package size={14} className="text-gray-300" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-black uppercase tracking-tight text-gray-600">
                          {prod.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="xl:col-span-4 space-y-6">
            <div className="rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm md:p-6 xl:sticky xl:top-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                    {t('section_estatisticas_larga')}
                  </p>
                  <h2 className="mt-2 text-xl font-black tracking-tight text-gray-900">
                    {t('dashboard_pages_title')}
                  </h2>
                </div>
                <Layers size={18} className="text-blue-600" />
              </div>

              <div className="space-y-3">
                {data.homePage && (
                  <PageRow
                    page={data.homePage}
                    onClick={() => navigate(`/admin/editor/${data.homePage!.id}`)}
                    homeLabel={t('page_home')}
                    pageLabel={t('dashboard_page_label')}
                  />
                )}

                {data.recentPages.map((page) => (
                  <PageRow
                    key={page.id}
                    page={page}
                    onClick={() => navigate(`/admin/editor/${page.id}`)}
                    homeLabel={t('page_home')}
                    pageLabel={t('dashboard_page_label')}
                  />
                ))}

                {!data.homePage && data.recentPages.length === 0 && (
                  <div className="flex flex-col items-center rounded-[1.75rem] border border-dashed border-gray-200 bg-[#fafafa] px-5 py-10 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-emerald-50 text-emerald-600">
                      <Layout size={26} />
                    </div>
                    <h3 className="mt-4 text-base font-black tracking-tight text-gray-900">
                      {t('empty_pages_title')}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {t('empty_pages_desc')}
                    </p>
                    <button
                      onClick={() => navigate('/admin/paginas')}
                      className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-[11px] font-black uppercase tracking-wider text-white hover:bg-emerald-700"
                    >
                      <Plus size={14} />
                      {t('modal_library_subtitle')}
                    </button>
                  </div>
                )}
              </div>

              {data.hasPages && (
                <button
                  onClick={() => navigate('/admin/paginas')}
                  className="mt-5 w-full rounded-2xl bg-gray-900 py-3 text-[11px] font-black uppercase tracking-wider text-white transition-colors hover:bg-blue-600"
                >
                  {t('launch_sitemap')}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-1">
              {[
                {
                  icon: Mail,
                  label: t('footer_master_node'),
                  val: data.owner_email || '---',
                },
                {
                  icon: Calendar,
                  label: t('footer_uptime'),
                  val: data.createdAt
                    ? `${t('uptime_active')} ${formatDistanceToNow(new Date(data.createdAt), {
                        locale: language === 'pt' ? pt : undefined,
                      })}`
                    : '---',
                },
                {
                  icon: Fingerprint,
                  label: t('footer_store_key'),
                  val: `#${data.store.id?.split('-')[0] || '---'}`,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-[1.75rem] border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-500">
                      <item.icon size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        {item.label}
                      </p>
                      <p className="mt-2 truncate text-sm font-bold text-gray-800">
                        {item.val}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default memo(Dashboard);