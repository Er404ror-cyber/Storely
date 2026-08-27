import { memo } from 'react';
import { Sparkles, ArrowUpRight, ShoppingBag, Store, Smartphone, Loader2, Check, Copy, MessageCircle, Send, Facebook, Twitter, FileText } from 'lucide-react';

interface Props {
  storeName: string;
  logoUrl?: string;
  activeUrl: string;
  selectedLinkType: 'products' | 'store';
  onSelectLinkType: (type: 'products' | 'store') => void;
  copiedLink: boolean;
  onCopyLink: () => void;
  isSharing: boolean;
  onNativeShare: () => void;
  onShareWhatsApp: () => void;
  onShareTelegram: () => void;
  onShareFacebook: () => void;
  onShareTwitter: () => void;
  onOpenLetterModal: () => void;
  t: (k: string) => string;
}

export const GrowthHero = memo(function GrowthHero({
  storeName,
  logoUrl,
  activeUrl,
  selectedLinkType,
  onSelectLinkType,
  copiedLink,
  onCopyLink,
  isSharing,
  onNativeShare,
  onShareWhatsApp,
  onShareTelegram,
  onShareFacebook,
  onShareTwitter,
  onOpenLetterModal,
  t
}: Props) {
  return (
    <section 
      className="w-full rounded-3xl p-4.5 sm:p-7 bg-white border border-zinc-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-5"
      style={{ contain: 'paint' }}
    >
      {/* Topo com Logo e Botão de PDF */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3.5 min-w-0">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="w-12 h-12 rounded-2xl object-cover border border-zinc-200 shadow-2xs shrink-0 bg-zinc-50" />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
              {storeName ? storeName.charAt(0).toUpperCase() : 'S'}
            </div>
          )}
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
              <Sparkles size={11} className="text-indigo-600 shrink-0" />
              <span className="truncate">{t('guide_badge') || 'Divulgação Rápida'}</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-zinc-900 truncate tracking-tight mt-0.5">
              {storeName || t('guide_title') || 'Como Atrair Clientes e Vender'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenLetterModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-200/80 active:scale-95 cursor-pointer shadow-2xs"
          >
            <FileText size={14} />
            <span>Gerar Carta / PDF</span>
          </button>

          <a
            href={activeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 text-xs font-bold transition-all border border-zinc-200/80 active:scale-95"
          >
            <span>{t('guide_preview_btn') || 'Ver Loja'}</span>
            <ArrowUpRight size={14} className="text-indigo-600" />
          </a>
        </div>
      </div>

      {/* Seletor de Rota */}
      <div className="p-1 rounded-2xl bg-zinc-100/90 border border-zinc-200/70 flex items-center gap-1">
        <button
          type="button"
          onClick={() => onSelectLinkType('products')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer truncate ${
            selectedLinkType === 'products'
              ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200/60'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <ShoppingBag size={14} className="shrink-0 text-emerald-600" />
          <span className="truncate">{t('guide_tab_products') || 'Catálogo de Produtos'}</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-bold hidden sm:inline border border-emerald-200/50">
            /products
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectLinkType('store')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer truncate ${
            selectedLinkType === 'store'
              ? 'bg-white text-indigo-800 shadow-xs border border-indigo-200/60'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Store size={14} className="shrink-0 text-indigo-600" />
          <span className="truncate">{t('guide_tab_store') || 'Página da Loja'}</span>
        </button>
      </div>

      {/* Ação Principal no Telemóvel */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-2 rounded-2xl bg-zinc-50 border border-zinc-200 shadow-inner">
        <button
          type="button"
          disabled={isSharing}
          onClick={onNativeShare}
          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
        >
          {isSharing ? <Loader2 size={16} className="animate-spin text-white" /> : <Smartphone size={16} className="text-white" />}
          <span>{t('guide_native_share_btn') || 'Partilhar com Foto & Mensagem'}</span>
        </button>

        <button
          type="button"
          onClick={onCopyLink}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition-all active:scale-95 border border-zinc-200 shadow-2xs cursor-pointer shrink-0"
        >
          {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-zinc-500" />}
          <span>{copiedLink ? (t('guide_copied') || 'Copiado!') : (t('guide_copy_btn') || 'Copiar Link')}</span>
        </button>
      </div>

      {/* Disparo nas Redes */}
      <div className="space-y-2 pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">
          {t('guide_social_broadcast') || 'Disparar Agora nos Aplicativos'}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button type="button" onClick={onShareWhatsApp} className="p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 flex items-center justify-center gap-2 text-emerald-800 text-xs font-bold cursor-pointer">
            <MessageCircle size={16} className="text-emerald-600 shrink-0" />
            <span className="truncate">{t('guide_share_whatsapp') || 'WhatsApp'}</span>
          </button>
          <button type="button" onClick={onShareTelegram} className="p-3 rounded-2xl bg-sky-50/70 hover:bg-sky-100/70 border border-sky-200/80 flex items-center justify-center gap-2 text-sky-800 text-xs font-bold cursor-pointer">
            <Send size={16} className="text-sky-600 shrink-0" />
            <span className="truncate">{t('guide_share_telegram') || 'Telegram'}</span>
          </button>
          <button type="button" onClick={onShareFacebook} className="p-3 rounded-2xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 flex items-center justify-center gap-2 text-blue-800 text-xs font-bold cursor-pointer">
            <Facebook size={16} className="text-blue-600 shrink-0" />
            <span className="truncate">{t('guide_share_facebook') || 'Facebook'}</span>
          </button>
          <button type="button" onClick={onShareTwitter} className="p-3 rounded-2xl bg-zinc-100/80 hover:bg-zinc-200/70 border border-zinc-200 flex items-center justify-center gap-2 text-zinc-800 text-xs font-bold cursor-pointer">
            <Twitter size={16} className="text-zinc-700 shrink-0" />
            <span className="truncate">{t('guide_share_x') || 'Twitter / X'}</span>
          </button>
        </div>
      </div>
    </section>
  );
});