import { memo, useState, useEffect, useMemo } from 'react';
import { 
  type LucideIcon, ArrowRight, Layout, Package, Play, Sparkles, Plus, 
  Calendar, Fingerprint, Mail, ExternalLink, Store, Copy, Check, 
  Palette,  TrendingUp, MessageCircle, Instagram, Users, Megaphone
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { Product, Page, StepItem } from '../../types/dashboard';

// --- ELEMENTOS PEQUENOS ---
export const StatCard = memo(function StatCard({ label, value, icon: Icon, bgColor, iconBgColor, iconColor, trendText, trendColor }: { label: string; value: string | number; icon: LucideIcon; bgColor: string; iconBgColor: string; iconColor: string; trendText: string; trendColor: string; }) {
  return (
    <div className={`rounded-[2rem] p-5 shadow-sm border border-white flex flex-col justify-between ${bgColor}`} style={{ contain: 'content' }}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl mb-4 ${iconBgColor} ${iconColor}`}>
        <Icon size={22} className="opacity-90" />
      </div>
      <div>
        <p className="text-[11px] font-black tracking-wide text-[#5C5370]">{label}</p>
        <p className="text-2xl font-black tracking-tight text-[#2D263B] mt-0.5">{value}</p>
        <p className={`text-[9px] font-black tracking-wider uppercase mt-1.5 ${trendColor}`}>{trendText}</p>
      </div>
    </div>
  );
});

export const SetupStepCard = memo(function SetupStepCard({ item, onNavigate }: { item: StepItem, onNavigate: (route: string) => void }) {
  const Icon = item.icon;
  return (
    <div className="flex items-center justify-between bg-[#FAF8FC] p-4 rounded-[1.5rem] border border-white shadow-sm" style={{ contain: 'content' }}>
       <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center bg-[#E5D9F4] text-[#9175E6]"><Icon size={18} /></div>
          <div className="min-w-0 flex-1 pr-2">
            <h4 className="text-[13px] font-black text-[#2D263B] truncate">{item.title}</h4>
            <p className="text-[10px] font-bold text-[#867B9E] line-clamp-2 leading-tight mt-0.5">{item.desc}</p>
          </div>
       </div>
       <button onClick={() => onNavigate(item.route)} className="bg-white px-4 py-2 rounded-xl shadow-sm text-[10px] font-black uppercase tracking-wider text-[#9175E6] hover:bg-[#9175E6] hover:text-white transition-colors shrink-0">
         {item.actionLabel}
       </button>
    </div>
  );
});

export const ProductRow = memo(function ProductRow({ product, onNavigate, fallbackCurrency }: { product: Product; onNavigate: (r: string) => void; fallbackCurrency: string }) {
  const image = product.image_url || product.main_image || '';
  return (
    <button onClick={() => onNavigate(`/admin/produtos/${product.id}`)} className="group flex w-full items-center gap-4 rounded-2xl bg-transparent p-2 text-left transition-colors hover:bg-white/50" style={{ contain: 'content' }}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[1.2rem] bg-white border border-white">
        {image ? <img src={image} alt={product.name} className="h-full w-full object-cover" loading="lazy" /> : <Package size={18} className="text-[#C4B7DF]" />}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[13px] font-black text-[#2D263B]">{product.name}</h3>
        <p className="text-[11px] font-bold text-[#867B9E] mt-0.5">{product.price} {product.currency || fallbackCurrency || 'MZN'}</p>
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EFEAF6] text-[#9175E6] transition-transform group-hover:scale-110 transform-gpu"><Play size={12} fill="currentColor" className="ml-0.5" /></div>
    </button>
  );
});

export const PageRow = memo(function PageRow({ page, onNavigate, homeLabel, subPageLabel }: { page: Page; onNavigate: (r: string) => void; homeLabel: string; subPageLabel: string }) {
  return (
    <button onClick={() => onNavigate(`/admin/editor/${page.id}`)} className="group flex w-full items-center gap-3 rounded-2xl bg-white/40 p-2.5 text-left transition-colors hover:bg-white/70" style={{ contain: 'content' }}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] ${page.is_home ? 'bg-white text-[#A07A3E]' : 'bg-[#F2ECE1] text-[#B89B6F]'}`}><Layout size={16} strokeWidth={2.5} /></div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black uppercase tracking-wider text-[#A07A3E]/70">{page.is_home ? homeLabel : subPageLabel}</p>
        <h3 className="truncate text-[12px] font-black text-[#604925]">{page.title}</h3>
      </div>
      <ArrowRight size={14} className="text-[#A07A3E]/50 group-hover:text-[#A07A3E] transition-colors" />
    </button>
  );
});

// --- HERO BANNER (COM TIKER ESTILO TELEJORNAL) ---
export const HeroBanner = memo(function HeroBanner({ storeName, storeSlug, progress, t, onNavigate }: { storeName: string; storeSlug: string; progress: number; t: any; onNavigate: (r: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  
  const storeUrl = `${window.location.origin}/${storeSlug || ''}`;
  const heroTips = ['tip_hero_1', 'tip_hero_2', 'tip_hero_3', 'tip_hero_4'];

  // Roda as dicas a cada 6 segundos de forma otimizada
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % heroTips.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroTips.length]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-r from-[#DFD5F5] to-[#EBE4F9] p-5 sm:p-8 border-2 border-white">
      <div className="relative z-10 max-w-xl">
        <h2 className="text-xl sm:text-2xl font-black text-[#2D263B] leading-tight flex items-center gap-2">
          {t('dashboard_welcome_title')?.replace('{name}', storeName || 'Parceiro') || `Olá, ${storeName || 'Parceiro'}!`} ☀️
        </h2>
        <p className="text-[11px] sm:text-xs font-bold text-[#796C92] mt-1.5 mb-4">
          {progress < 100 ? (t('dashboard_welcome_desc_pending') || 'Prepare o seu catálogo e comece a vender!') : (t('dashboard_welcome_desc_ready') || 'A sua loja está online e pronta para receber pedidos.')}
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <button onClick={() => onNavigate('/admin/produtos')} className="inline-flex items-center gap-2 rounded-full bg-[#9A81E9] px-5 py-2.5 text-[11px] sm:text-[12px] font-black tracking-wide text-white transition-transform active:scale-95 shadow-sm">
            <Play size={14} fill="currentColor" /> {t('btn_manage_products') || 'Gerir Artigos'}
          </button>
          
          <div className="flex items-center bg-white/50 rounded-full border border-white/60  shadow-sm p-1">
             <button onClick={() => window.open(storeUrl, '_blank')} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[11px] sm:text-[12px] font-black tracking-wide text-[#5C5370] hover:text-[#2D263B] transition-colors">
               <ExternalLink size={14} /> {t('btn_view_store') || 'Ver Loja'}
             </button>
             <div className="w-[1px] h-4 bg-white/50 mx-1"></div>
             <button onClick={handleCopyLink} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#9175E6] shadow-sm active:scale-90 transition-transform" title="Copiar Link">
               {copied ? <Check size={12} strokeWidth={3} /> : <Copy size={12} strokeWidth={2.5} />}
             </button>
          </div>
        </div>

        {/* Estilo Telejornal (Ticker Inferior) Otimizado para Celulares Fracos */}
        <div className="mt-4 flex items-center gap-2 bg-white/40 px-3.5 py-2 rounded-xl border border-white/60  w-full max-w-full overflow-hidden shadow-xs">
          <div className="flex items-center gap-1 bg-[#8862DF] text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0 animate-pulse">
            <MessageCircle size={10} />
            <span>{t('tip_hero_title') || 'AO VIVO'}</span>
          </div>
          
          <div className="relative h-5 overflow-hidden w-full flex items-center">
            <div 
              key={tipIndex} 
              className="absolute w-full transform-gpu transition-all duration-500 ease-out will-change-transform animate-in fade-in slide-in-from-bottom-2"
            >
              <p className="text-[10px] sm:text-[11px] font-bold text-[#5C5370] truncate">
                {t(heroTips[tipIndex]) || 'Copie o link acima e coloque no Status do WhatsApp!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute right-[-30px] bottom-[-40px] sm:right-[-20px] md:right-10 md:bottom-0 opacity-10 sm:opacity-20 md:opacity-100 pointer-events-none select-none">
        <Store size={180} className="text-[#C8B8EF]" />
      </div>
    </section>
  );
});

// --- RECOMENDAÇÕES (DINÂMICAS E ALEATÓRIAS) ---
export const StorelyRecommendations = memo(function StorelyRecommendations({ t }: { t: any }) {
  const allTips = useMemo(() => [
    { id: 'whatsapp', icon: MessageCircle, color: 'text-[#20A068]', bg: 'bg-[#E8F8F2]', titleKey: 'tips_rec_whatsapp_title', descKey: 'tips_rec_whatsapp_desc' },
    { id: 'social', icon: Instagram, color: 'text-[#E1306C]', bg: 'bg-[#FCECF1]', titleKey: 'tips_rec_social_title', descKey: 'tips_rec_social_desc' },
    { id: 'groups', icon: Users, color: 'text-[#4267B2]', bg: 'bg-[#EAF0FA]', titleKey: 'tips_rec_groups_title', descKey: 'tips_rec_groups_desc' },
    { id: 'clarity', icon: TrendingUp, color: 'text-[#F29C38]', bg: 'bg-[#FFF4E5]', titleKey: 'tips_rec_clarity_title', descKey: 'tips_rec_clarity_desc' },
    { id: 'visual', icon: Palette, color: 'text-[#9175E6]', bg: 'bg-[#EFEAF6]', titleKey: 'tips_rec_visual_title', descKey: 'tips_rec_visual_desc' },
    { id: 'promo', icon: Megaphone, color: 'text-[#E53E3E]', bg: 'bg-[#FDE8E8]', titleKey: 'tips_rec_promo_title', descKey: 'tips_rec_promo_desc' },
  ], []);

  const randomTips = useMemo(() => {
    const shuffled = [...allTips].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [allTips]);

  return (
    <section className="w-full">
      <div className="flex items-center gap-2 mb-4 px-1">
        <Sparkles size={18} className="text-[#9175E6]" />
        <h3 className="text-[14px] sm:text-[15px] font-black text-[#2D263B]">{t('tips_section_title') || 'Como vender mais todos os dias'}</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {randomTips.map((tip) => (
          <div key={tip.id} className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-xs flex items-start gap-3 transform-gpu transition-transform active:scale-[0.98]">
            <div className={`w-9 h-9 shrink-0 rounded-[0.9rem] flex items-center justify-center mt-0.5 ${tip.bg} ${tip.color}`}>
              <tip.icon size={16} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h4 className="text-[12px] font-black text-[#2D263B] mb-0.5 truncate">{t(tip.titleKey)}</h4>
              <p className="text-[10px] font-bold text-[#867B9E] leading-relaxed line-clamp-2">
                {t(tip.descKey)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

export const SystemNodeDetails = memo(function SystemNodeDetails({ email, storeId, createdAt, lang, t }: { email: string; storeId: string; createdAt?: string | null; lang: string; t: any }) {
  return (
    <section className="w-full rounded-[2rem] sm:rounded-[2.5rem] bg-white p-5 sm:p-6 md:p-8 border border-gray-100">
       <h3 className="text-[14px] sm:text-[15px] font-black text-[#2D263B] mb-4 sm:mb-5">{t('node_details_title') || 'Credenciais do Sistema'}</h3>
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4 bg-[#F8F4FD] p-3 sm:p-4 rounded-[1.2rem] sm:rounded-[1.5rem] border border-white">
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-[#D8C7F5] flex items-center justify-center text-[#8862DF]"><Mail size={16} strokeWidth={2.5} /></div>
            <div className="min-w-0"><p className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-wider">{t('node_master_email') || 'Gestor'}</p><p className="text-[11px] sm:text-xs font-black text-[#2D263B] truncate">{email}</p></div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 bg-[#F2F7FD] p-3 sm:p-4 rounded-[1.2rem] sm:rounded-[1.5rem] border border-white">
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-[#B9D5F6] flex items-center justify-center text-[#5194DF]"><Fingerprint size={16} strokeWidth={2.5} /></div>
            <div className="min-w-0"><p className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-wider">{t('node_store_id') || 'ID da Loja'}</p><p className="text-[11px] sm:text-xs font-black text-[#2D263B] truncate">#{storeId?.split('-')[0] || 'N/A'}</p></div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 bg-[#EDFBF4] p-3 sm:p-4 rounded-[1.2rem] sm:rounded-[1.5rem] border border-white">
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-[#C1EAD5] flex items-center justify-center text-[#32A873]"><Calendar size={16} strokeWidth={2.5} /></div>
            <div className="min-w-0"><p className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-wider">{t('node_activity') || 'Criação'}</p><p className="text-[11px] sm:text-xs font-black text-[#2D263B] truncate">{createdAt ? formatDistanceToNow(new Date(createdAt), { locale: lang === 'pt' ? pt : undefined }) : (t('node_recent') || 'Recente')}</p></div>
          </div>
       </div>
    </section>
  );
});

export const ActionBanner = memo(function ActionBanner({ onNavigate, t }: { onNavigate: (r: string) => void; t: any }) {
  return (
    <section className="rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-r from-[#B99AEE] to-[#D5C2F6] px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
       <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 min-w-0">
         <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-[#FFCE54] rounded-full text-white"><Sparkles size={24} fill="currentColor" /></div>
         <div className="min-w-0">
           <h3 className="text-[15px] sm:text-[16px] font-black text-white truncate">{t('cta_ready_scale') || 'Escalar o seu Negócio?'}</h3>
           <p className="text-[11px] sm:text-[12px] font-bold text-white/90 truncate">{t('cta_add_products') || 'Insira novos artigos e atualize o stock em segundos.'}</p>
         </div>
       </div>
       <button onClick={() => onNavigate('/admin/produtos')} className="bg-white text-[#B99AEE] px-8 py-3.5 rounded-full text-[11px] font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-transform transform-gpu flex items-center justify-center gap-2 w-full sm:w-auto shrink-0">
         <Plus size={16} /> {t('btn_new_product') || 'Novo Produto'}
       </button>
    </section>
  );
});