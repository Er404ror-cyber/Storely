import { memo, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  type LucideIcon, ArrowRight, Layout, Package, Play, Sparkles, Plus, 
  Calendar, Fingerprint, Mail, ExternalLink, Store, Check, 
  Palette, TrendingUp, MessageCircle, Instagram, Users, Megaphone,
  Share2, Rocket
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { Product, Page, StepItem } from '../../types/dashboard';

// --- ELEMENTOS PEQUENOS ---
export const StatCard = memo(function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  bgColor, 
  iconBgColor, 
  iconColor, 
  trendText, 
  trendColor 
}: { 
  label: string; 
  value: string | number; 
  icon: LucideIcon; 
  bgColor: string; 
  iconBgColor: string; 
  iconColor: string; 
  trendText: string; 
  trendColor: string; 
}) {
  return (
    <div 
      className={`rounded-3xl p-4 sm:p-5 border border-white flex flex-col justify-between ${bgColor}`} 
      style={{ contain: 'content' }}
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl mb-3 ${iconBgColor} ${iconColor}`}>
        <Icon size={20} className="opacity-90" />
      </div>
      <div>
        <p className="text-[11px] font-black tracking-wide text-[#5C5370]">{label}</p>
        <p className="text-2xl font-black tracking-tight text-[#2D263B] mt-0.5">{value}</p>
        <p className={`text-[9px] font-black tracking-wider uppercase mt-1.5 ${trendColor}`}>{trendText}</p>
      </div>
    </div>
  );
});

export const SetupStepCard = memo(function SetupStepCard({ 
  item, 
  onNavigate 
}: { 
  item: StepItem; 
  onNavigate: (route: string) => void; 
}) {
  const Icon = item.icon;
  return (
    <div 
      className="flex items-center justify-between bg-[#FAF8FC] p-3.5 sm:p-4 rounded-2xl border border-white" 
      style={{ contain: 'content' }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center bg-[#E5D9F4] text-[#9175E6]">
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1 pr-2">
          <h4 className="text-xs sm:text-[13px] font-black text-[#2D263B] truncate">{item.title}</h4>
          <p className="text-[10px] font-bold text-[#867B9E] line-clamp-2 leading-tight mt-0.5">{item.desc}</p>
        </div>
      </div>
      <button 
        type="button"
        onClick={() => onNavigate(item.route)} 
        className="bg-white px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-[#9175E6] hover:bg-[#9175E6] hover:text-white transition-colors shrink-0 cursor-pointer active:opacity-80"
      >
        {item.actionLabel}
      </button>
    </div>
  );
});

export const ProductRow = memo(function ProductRow({ 
  product, 
  onNavigate, 
  fallbackCurrency 
}: { 
  product: Product; 
  onNavigate: (r: string) => void; 
  fallbackCurrency: string; 
}) {
  const image = product.image_url || product.main_image || '';
  return (
    <button 
      type="button"
      onClick={() => onNavigate(`/admin/produtos/${product.id}`)} 
      className="group flex w-full items-center gap-3 rounded-2xl bg-transparent p-2 text-left transition-colors hover:bg-white/50 cursor-pointer" 
      style={{ contain: 'content' }}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white border border-white">
        {image ? (
          <img 
            src={image} 
            alt={product.name} 
            className="h-full w-full object-cover" 
            loading="lazy" 
            decoding="async" 
          />
        ) : (
          <Package size={16} className="text-[#C4B7DF]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-xs sm:text-[13px] font-black text-[#2D263B]">{product.name}</h3>
        <p className="text-[10.5px] font-bold text-[#867B9E] mt-0.5">{product.price} {product.currency || fallbackCurrency || 'MZN'}</p>
      </div>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EFEAF6] text-[#9175E6]">
        <Play size={10} fill="currentColor" className="ml-0.5" />
      </div>
    </button>
  );
});

export const PageRow = memo(function PageRow({ 
  page, 
  onNavigate, 
  homeLabel, 
  subPageLabel 
}: { 
  page: Page; 
  onNavigate: (r: string) => void; 
  homeLabel: string; 
  subPageLabel: string; 
}) {
  return (
    <button 
      type="button"
      onClick={() => onNavigate(`/admin/editor/${page.id}`)} 
      className="group flex w-full items-center gap-3 rounded-2xl bg-white/40 p-2.5 text-left transition-colors hover:bg-white/70 cursor-pointer" 
      style={{ contain: 'content' }}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${page.is_home ? 'bg-white text-[#A07A3E]' : 'bg-[#F2ECE1] text-[#B89B6F]'}`}>
        <Layout size={15} strokeWidth={2.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[8.5px] font-black uppercase tracking-wider text-[#A07A3E]/70">{page.is_home ? homeLabel : subPageLabel}</p>
        <h3 className="truncate text-xs font-black text-[#604925]">{page.title}</h3>
      </div>
      <ArrowRight size={13} className="text-[#A07A3E]/50 group-hover:text-[#A07A3E] transition-colors" />
    </button>
  );
});

// --- HERO BANNER (ORGANIZADO E SEM CORTES NO MOBILE) ---
export const HeroBanner = memo(function HeroBanner({ 
  storeName, 
  storeSlug, 
  progress, 
  t, 
  onNavigate 
}: { 
  storeName: string; 
  storeSlug: string; 
  progress: number; 
  t: (k: any, variables?: Record<string, any>) => string;
    onNavigate: (r: string) => void; 
}) {
  const [copiedFallback, setCopiedFallback] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const storeUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://storelyy.vercel.app';
    return `${origin}/${storeSlug || ''}`;
  }, [storeSlug]);

  const heroTips = useMemo(() => ['tip_hero_1', 'tip_hero_2', 'tip_hero_3', 'tip_hero_4'], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % heroTips.length);
    }, 6500);

    return () => {
      clearInterval(interval);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, [heroTips.length]);

  const handleShare = useCallback(async () => {
    const shareTitle = storeName || t('share_default_title') || 'Loja Online';
    const rawShareMessage = t('share_store_message') || 'Confira os nossos produtos e novidades na nossa loja oficial {name}:';
    const shareMessage = rawShareMessage.replace('{name}', storeName ? `(${storeName})` : '').trim();

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `${shareMessage}\n\n`,
          url: storeUrl,
        });
      } catch {
        // Ignora cancelamento
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(storeUrl).catch(() => {});
      setCopiedFallback(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedFallback(false), 2000);
    }
  }, [storeName, storeUrl, t]);

  return (
    <section 
      className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-[#DFD5F5] to-[#EBE4F9] p-4 sm:p-7 border border-white"
      style={{ contain: 'content' }}
    >
      <div className="relative z-10 max-w-xl space-y-3.5 sm:space-y-4">
        
        {/* Título e Subtítulo */}
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-[#2D263B] leading-tight flex items-center gap-1.5">
            <span>{t('dashboard_welcome_title')?.replace('{name}', storeName || 'Parceiro') || `Olá, ${storeName || 'Parceiro'}!`}</span>
            <span>☀️</span>
          </h2>
          <p className="text-[11px] sm:text-xs font-bold text-[#796C92] mt-1 leading-relaxed">
            {progress < 100 
              ? (t('dashboard_welcome_desc_pending') || 'Prepare o seu catálogo e comece a vender!') 
              : (t('dashboard_welcome_desc_ready') || 'A sua loja está online e pronta para receber pedidos.')}
          </p>
        </div>

        {/* Grade de Botões de Ação (Organizada em 2x2 no mobile) */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          {/* Gerir Artigos */}
          <button 
            type="button"
            onClick={() => onNavigate('/admin/produtos')} 
            className="flex items-center justify-center gap-1.5 rounded-xl sm:rounded-full bg-[#9A81E9] py-2.5 px-3 sm:px-5 text-xs font-black tracking-wide text-white hover:bg-[#886CE4] active:scale-95 transition-transform cursor-pointer"
          >
            <Play size={13} fill="currentColor" className="shrink-0" />
            <span className="truncate">{t('btn_manage_products') || 'Gerir Artigos'}</span>
          </button>
          
          {/* Divulgar & Vender */}
          <button
            type="button"
            onClick={() => onNavigate('/admin/guide')}
            className="flex items-center justify-center gap-1.5 rounded-xl sm:rounded-full bg-[#2D263B] py-2.5 px-3 sm:px-4 text-xs font-black tracking-wide text-white hover:bg-black active:scale-95 transition-transform cursor-pointer"
          >
            <Rocket size={13} className="text-amber-400 shrink-0" />
            <span className="truncate">{t('guide_badge') || 'Divulgar & Vender'}</span>
          </button>
          
          {/* Ver Loja */}
          <button 
            type="button"
            onClick={() => window.open(storeUrl, '_blank', 'noopener,noreferrer')} 
            className="flex items-center justify-center gap-1.5 rounded-xl sm:rounded-full bg-white/80 py-2.5 px-3 sm:px-4 text-xs font-black tracking-wide text-[#5C5370] hover:text-[#2D263B] hover:bg-white active:scale-95 transition-transform cursor-pointer border border-white"
          >
            <ExternalLink size={13} className="shrink-0" />
            <span className="truncate">{t('btn_view_store') || 'Ver Loja'}</span>
          </button>
           
          {/* Partilhar */}
          <button 
            type="button"
            onClick={handleShare} 
            className="flex items-center justify-center gap-1.5 rounded-xl sm:rounded-full bg-white py-2.5 px-3 sm:px-4 text-xs font-black tracking-wide text-[#8862DF] hover:bg-[#8862DF] hover:text-white active:scale-95 transition-all cursor-pointer border border-[#E9E0F8]"
          >
            {copiedFallback ? <Check size={13} strokeWidth={3} className="text-emerald-600 shrink-0" /> : <Share2 size={13} strokeWidth={2.5} className="shrink-0" />}
            <span className="truncate">{copiedFallback ? (t('copied_label') || 'Copiado!') : (t('btn_share_store') || 'Partilhar')}</span>
          </button>
        </div>

        {/* Ticker de Dicas (Sem cortes de texto) */}
        <div className="flex items-start sm:items-center gap-2.5 bg-white/70 p-2.5 rounded-2xl border border-white/90">
          <div className="flex items-center gap-1 bg-[#8862DF] text-white px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 mt-0.5 sm:mt-0">
            <MessageCircle size={11} className="shrink-0" />
            <span>{t('tip_hero_title') || 'DICA'}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <p 
              key={tipIndex}
              className="text-[11px] font-bold text-[#4F4660] leading-snug break-words"
            >
              {t(heroTips[tipIndex]) || 'Copie o link da sua loja e coloque no Status do WhatsApp!'}
            </p>
          </div>
        </div>

      </div>

      <div className="absolute right-[-25px] bottom-[-30px] opacity-10 md:opacity-90 pointer-events-none select-none">
        <Store size={150} className="text-[#C8B8EF]" />
      </div>
    </section>
  );
});

HeroBanner.displayName = 'HeroBanner';

// --- RECOMENDAÇÕES (TEXTOS COMPLETOS E LEGÍVEIS NO MOBILE) ---
export const StorelyRecommendations = memo(function StorelyRecommendations({ t }: { t: (k: string) => string }) {
  const allTips = useMemo(() => [
    { id: 'whatsapp', icon: MessageCircle, color: 'text-[#20A068]', bg: 'bg-[#E8F8F2]', titleKey: 'tips_rec_whatsapp_title', descKey: 'tips_rec_whatsapp_desc' },
    { id: 'social', icon: Instagram, color: 'text-[#E1306C]', bg: 'bg-[#FCECF1]', titleKey: 'tips_rec_social_title', descKey: 'tips_rec_social_desc' },
    { id: 'groups', icon: Users, color: 'text-[#4267B2]', bg: 'bg-[#EAF0FA]', titleKey: 'tips_rec_groups_title', descKey: 'tips_rec_groups_desc' },
    { id: 'clarity', icon: TrendingUp, color: 'text-[#F29C38]', bg: 'bg-[#FFF4E5]', titleKey: 'tips_rec_clarity_title', descKey: 'tips_rec_clarity_desc' },
    { id: 'visual', icon: Palette, color: 'text-[#9175E6]', bg: 'bg-[#EFEAF6]', titleKey: 'tips_rec_visual_title', descKey: 'tips_rec_visual_desc' },
    { id: 'promo', icon: Megaphone, color: 'text-[#E53E3E]', bg: 'bg-[#FDE8E8]', titleKey: 'tips_rec_promo_title', descKey: 'tips_rec_promo_desc' },
  ], []);

  const randomTips = useMemo(() => {
    return [...allTips].sort(() => 0.5 - Math.random()).slice(0, 3);
  }, [allTips]);

  return (
    <section className="w-full space-y-3" style={{ contain: 'content' }}>
      <div className="flex items-center gap-2 px-1">
        <Sparkles size={17} className="text-[#9175E6] shrink-0" />
        <h3 className="text-sm sm:text-[15px] font-black text-[#2D263B]">
          {t('tips_section_title') || 'Como vender mais todos os dias'}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {randomTips.map((tip) => (
          <div 
            key={tip.id} 
            className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-100 flex items-start gap-3"
            style={{ contain: 'paint' }}
          >
            <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center mt-0.5 ${tip.bg} ${tip.color}`}>
              <tip.icon size={15} strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h4 className="text-xs sm:text-[13px] font-black text-[#2D263B] leading-tight break-words">
                {t(tip.titleKey)}
              </h4>
              <p className="text-[11px] font-medium text-[#736888] leading-snug break-words">
                {t(tip.descKey)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

StorelyRecommendations.displayName = 'StorelyRecommendations';

// --- CREDENCIAIS DO SISTEMA ---
export const SystemNodeDetails = memo(function SystemNodeDetails({ 
  email, 
  storeId, 
  createdAt, 
  lang, 
  t 
}: { 
  email: string; 
  storeId: string; 
  createdAt?: string | null; 
  lang: string; 
  t: (key: any, variables?: Record<string, any>) => string;
}) {
  const formattedDate = useMemo(() => {
    if (!createdAt) return t('node_recent') || 'Recente';
    try {
      return formatDistanceToNow(new Date(createdAt), { locale: lang === 'pt' ? pt : undefined });
    } catch {
      return t('node_recent') || 'Recente';
    }
  }, [createdAt, lang, t]);

  return (
    <section 
      className="w-full rounded-3xl bg-white p-4 sm:p-6 md:p-7 border border-gray-100 space-y-3 sm:space-y-4"
      style={{ contain: 'content' }}
    >
      <h3 className="text-sm sm:text-[15px] font-black text-[#2D263B]">
        {t('node_details_title') || 'Credenciais do Sistema'}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="flex items-center gap-3 bg-[#F8F4FD] p-3 rounded-2xl border border-white">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-[#D8C7F5] flex items-center justify-center text-[#8862DF]">
            <Mail size={15} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-wider">{t('node_master_email') || 'Gestor'}</p>
            <p className="text-xs font-black text-[#2D263B] truncate">{email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#F2F7FD] p-3 rounded-2xl border border-white">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-[#B9D5F6] flex items-center justify-center text-[#5194DF]">
            <Fingerprint size={15} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-wider">{t('node_store_id') || 'ID da Loja'}</p>
            <p className="text-xs font-black text-[#2D263B] truncate">#{storeId?.split('-')[0] || 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#EDFBF4] p-3 rounded-2xl border border-white">
          <div className="w-9 h-9 shrink-0 rounded-xl bg-[#C1EAD5] flex items-center justify-center text-[#32A873]">
            <Calendar size={15} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-wider">{t('node_activity') || 'Criação'}</p>
            <p className="text-xs font-black text-[#2D263B] truncate">{formattedDate}</p>
          </div>
        </div>
      </div>
    </section>
  );
});

SystemNodeDetails.displayName = 'SystemNodeDetails';

// --- CTA BANNER ---
export const ActionBanner = memo(function ActionBanner({ 
  onNavigate, 
  t 
}: { 
  onNavigate: (r: string) => void; 
  t: (k: any, variables?: Record<string, any>) => string; 
}) {
  return (
    <section 
      className="rounded-3xl bg-gradient-to-r from-[#B99AEE] to-[#D5C2F6] p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left"
      style={{ contain: 'content' }}
    >
      <div className="flex flex-col sm:flex-row items-center gap-3 min-w-0">
        <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center bg-[#FFCE54] rounded-full text-white">
          <Sparkles size={20} fill="currentColor" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-black text-white truncate">{t('cta_ready_scale') || 'Escalar o seu Negócio?'}</h3>
          <p className="text-[11px] font-bold text-white/90 truncate">{t('cta_add_products') || 'Insira novos artigos e atualize o stock em segundos.'}</p>
        </div>
      </div>
      <button 
        type="button"
        onClick={() => onNavigate('/admin/produtos')} 
        className="bg-white text-[#B99AEE] px-6 py-2.5 rounded-full text-[10.5px] font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-transform flex items-center justify-center gap-1.5 w-full sm:w-auto shrink-0 cursor-pointer"
      >
        <Plus size={15} /> 
        <span>{t('btn_new_product') || 'Novo Produto'}</span>
      </button>
    </section>
  );
});

ActionBanner.displayName = 'ActionBanner';