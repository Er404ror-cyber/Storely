import { memo } from 'react';
import { 
  BadgeCheck, 
  Star, 
  Globe, 
  Navigation, 
  PhoneCall, 
  Share2, 
  ShoppingBag, 
  Plus, 
  ArrowLeft, 
  ChevronRight, 
  CheckCheck,
  MoreVertical,
  MapPin
} from 'lucide-react';

interface Props {
  mockupType: 'whatsapp' | 'tiktok' | 'google' | 'instagram';
  storeName: string;
  logoUrl?: string;
  activeUrl: string;
  onOpenApp: () => void;
  t: (k: string) => string;
}

export const GrowthMockupPhone = memo(function GrowthMockupPhone({
  mockupType,
  storeName,
  logoUrl,
  activeUrl,
  onOpenApp,
  t
}: Props) {
  const cleanUrl = activeUrl.replace(/^https?:\/\//, '');
  const initial = storeName?.charAt(0)?.toUpperCase() || 'S';
  const handleName = storeName?.toLowerCase().replace(/\s+/g, '') || 'minhaloja';

  return (
    <div 
      onClick={onOpenApp}
      role="button"
      tabIndex={0}
      className="w-full max-w-[290px] rounded-[2.2rem] bg-white p-2.5 border-[3px] border-zinc-900 text-zinc-800 font-sans text-xs space-y-2 cursor-pointer select-none"
      style={{ contain: 'content' }}
      title={t('guide_mockup_tap_to_open') || 'Tocar para abrir no aplicativo'}
    >
      {/* Barra de Status do Telemóvel */}
      <div className="flex justify-between items-center px-2 text-[9px] text-zinc-400 font-bold">
        <span>9:41</span>
        <div className="w-12 h-3.5 bg-zinc-900 rounded-full" />
        <span className="font-mono">5G</span>
      </div>

      {/* 1. WHATSAPP BUSINESS */}
      {mockupType === 'whatsapp' && (
        <div className="bg-[#EFEAE2] rounded-2xl border border-zinc-200 overflow-hidden" style={{ contain: 'paint' }}>
          {/* Header do Chat */}
          <div className="bg-[#008069] text-white p-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <ArrowLeft size={13} className="shrink-0" />
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="" 
                  loading="lazy"
                  decoding="async"
                  className="w-7 h-7 rounded-full object-cover shrink-0 bg-white border border-white/40" 
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-800 flex items-center justify-center font-black text-[10px] shrink-0">
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-bold text-[10.5px] truncate leading-tight flex items-center gap-1">
                  <span>{storeName || 'Loja Oficial'}</span>
                  <BadgeCheck size={11} className="text-emerald-300 shrink-0" />
                </div>
                <div className="text-[7.5px] text-emerald-100 truncate">
                  {t('guide_mockup_business_account') || 'Conta comercial oficial'}
                </div>
              </div>
            </div>
            <MoreVertical size={13} className="text-white/80 shrink-0" />
          </div>

          {/* Mensagem com Card de Catálogo */}
          <div className="p-2 space-y-1.5">
            <div className="bg-white rounded-xl rounded-tl-xs p-2 border border-zinc-200/80 space-y-1.5 max-w-[95%]">
              <p className="text-[8.5px] text-zinc-800 leading-snug">
                {t('guide_mockup_wa_welcome_msg') || 'Olá! Seja bem-vindo(a). Confira o nosso catálogo completo com fotos e preços:'}
              </p>
              
              <div className="bg-zinc-50 rounded-lg p-1.5 border border-zinc-200 flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <ShoppingBag size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-[8.5px] text-zinc-900 block truncate">
                    {t('guide_mockup_official_catalog_label') || 'Catálogo de Produtos'}
                  </span>
                  <span className="text-[7.5px] text-emerald-700 font-mono block truncate">
                    {cleanUrl}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5 border-t border-zinc-100">
                <span className="text-[8px] font-bold text-[#008069]">
                  {t('guide_mockup_wa_catalog_btn') || 'Ver Catálogo Completo'}
                </span>
                <div className="flex items-center gap-0.5 text-[7px] text-zinc-400">
                  <span>09:41</span>
                  <CheckCheck size={10} className="text-sky-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TIKTOK */}
      {mockupType === 'tiktok' && (
        <div className="bg-zinc-950 text-white rounded-2xl p-3 space-y-2 border border-zinc-800 text-center" style={{ contain: 'paint' }}>
          <div className="relative w-12 h-12 mx-auto">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="" 
                loading="lazy"
                decoding="async"
                className="w-12 h-12 rounded-full object-cover bg-zinc-900 border border-white/20" 
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center font-black text-sm border border-white/20">
                {initial}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-rose-500 rounded-full flex items-center justify-center text-white text-[8px] font-black">
              <Plus size={9} />
            </div>
          </div>

          <div>
            <div className="font-bold text-[10.5px] flex items-center justify-center gap-1">
              <span>@{handleName}</span>
              <BadgeCheck size={11} className="text-sky-400" />
            </div>
            <div className="text-[8px] text-zinc-400">{storeName || 'Loja Oficial'}</div>
          </div>

          <div className="flex justify-center gap-4 text-center text-[8.5px]">
            <div><strong className="block text-white font-black">124</strong>{t('guide_mockup_following') || 'A seguir'}</div>
            <div><strong className="block text-white font-black">2.8k</strong>{t('guide_mockup_followers') || 'Seguidores'}</div>
            <div><strong className="block text-white font-black">18.4k</strong>{t('guide_mockup_likes') || 'Gostos'}</div>
          </div>

          <div className="bg-zinc-900 py-1.5 px-2 rounded-xl text-rose-400 text-[8.5px] font-bold truncate border border-zinc-800 flex items-center justify-center gap-1">
            <span className="text-zinc-400">🔗</span>
            <span className="truncate">{cleanUrl}</span>
          </div>
        </div>
      )}

      {/* 3. GOOGLE MAPS */}
      {mockupType === 'google' && (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden" style={{ contain: 'paint' }}>
          {/* Ilustração Realista do Mapa no Topo */}
          <div className="h-16 bg-[#E8EAED] relative overflow-hidden flex items-end justify-between p-2 border-b border-zinc-200">
            {/* Linhas e rotas ilustrativas do mapa */}
            <svg className="absolute inset-0 w-full h-full opacity-35" preserveAspectRatio="none" viewBox="0 0 200 80">
              <path d="M-10,30 Q60,10 110,40 T210,20" fill="none" stroke="#FFFFFF" strokeWidth="8" />
              <path d="M40,-10 L80,90" fill="none" stroke="#FFFFFF" strokeWidth="6" />
              <path d="M120,-10 L160,90" fill="none" stroke="#FFFFFF" strokeWidth="5" />
              <circle cx="100" cy="35" r="16" fill="#4285F4" opacity="0.15" />
            </svg>

            {/* Pin do Mapa */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <MapPin size={18} className="text-red-500 fill-red-500 drop-shadow-xs" />
            </div>

            {/* Avatar do Negócio */}
            <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0 z-10">
              {logoUrl ? (
                <img src={logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-black text-blue-600 text-[11px]">{initial}</span>
              )}
            </div>

            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[7.5px] tracking-wide z-10">
              {t('guide_mockup_google_open_status') || 'ABERTO'}
            </span>
          </div>

          <div className="p-2.5 space-y-2">
            <div>
              <h4 className="font-black text-[11px] text-zinc-900 truncate leading-tight">
                {storeName || 'Loja Oficial'}
              </h4>
              <div className="flex items-center gap-1 text-[8.5px] mt-0.5">
                <span className="font-bold text-amber-600">5.0</span>
                <div className="flex text-amber-400">
                  <Star size={9} className="fill-amber-400" />
                  <Star size={9} className="fill-amber-400" />
                  <Star size={9} className="fill-amber-400" />
                  <Star size={9} className="fill-amber-400" />
                  <Star size={9} className="fill-amber-400" />
                </div>
                <span className="text-zinc-400">(48) · {t('guide_mockup_google_store_type') || 'Loja'}</span>
              </div>
            </div>

            {/* Botões de Ação do Google */}
            <div className="grid grid-cols-4 gap-1 py-1 border-y border-zinc-100 text-center">
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Globe size={12} />
                </div>
                <span className="text-[7.5px] font-bold text-blue-700">
                  {t('guide_mockup_google_tab_website') || 'Website'}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <Navigation size={11} />
                </div>
                <span className="text-[7.5px] font-medium text-zinc-600">
                  {t('guide_mockup_google_tab_directions') || 'Rotas'}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <PhoneCall size={11} />
                </div>
                <span className="text-[7.5px] font-medium text-zinc-600">
                  {t('guide_mockup_google_tab_call') || 'Ligar'}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <Share2 size={11} />
                </div>
                <span className="text-[7.5px] font-medium text-zinc-600">
                  {t('guide_mockup_google_tab_share') || 'Partilhar'}
                </span>
              </div>
            </div>

            <div className="text-[8.5px] text-zinc-600 flex items-center gap-1">
              <Globe size={10} className="text-blue-600 shrink-0" />
              <span className="text-blue-600 font-bold truncate underline">{cleanUrl}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. INSTAGRAM */}
      {mockupType === 'instagram' && (
        <div className="bg-zinc-50 p-2.5 rounded-2xl space-y-2 border border-zinc-200/80" style={{ contain: 'paint' }}>
          <div className="flex items-center justify-between gap-2">
            {/* Foto de Perfil com Anel de Stories */}
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-amber-400 via-rose-500 to-purple-600 p-0.5 shrink-0">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="" 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full rounded-full object-cover bg-white border border-white" 
                />
              ) : (
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-black text-[10px] text-zinc-900 border border-white">
                  {initial}
                </div>
              )}
            </div>

            <div className="flex gap-2.5 text-center text-[8.5px] shrink-0">
              <div><strong className="block text-zinc-900 font-black">12</strong>{t('guide_mockup_posts') || 'publicações'}</div>
              <div><strong className="block text-zinc-900 font-black">1.4k</strong>{t('guide_mockup_followers') || 'seguidores'}</div>
              <div><strong className="block text-zinc-900 font-black">230</strong>{t('guide_mockup_following') || 'a seguir'}</div>
            </div>
          </div>

          <div className="text-[9.5px] space-y-0.5 min-w-0">
            <div className="font-black text-zinc-900 flex items-center gap-1 truncate">
              <span className="truncate">{storeName || 'Loja Oficial'}</span>
              <BadgeCheck size={11} className="text-sky-500 shrink-0" />
            </div>
            <div className="text-zinc-500 text-[8.5px] truncate">
              {t('guide_mockup_official_tag') || 'Catálogo Oficial & Encomendas'}
            </div>
            <div className="text-indigo-600 font-bold truncate pt-0.5 text-[9px] flex items-center gap-1">
              <span>🔗</span>
              <span className="truncate">{cleanUrl}</span>
            </div>
          </div>

          <div className="w-full py-1 text-center bg-zinc-200 rounded-lg text-[8.5px] font-bold text-zinc-800">
            {t('guide_mockup_ig_edit_profile') || 'Editar Perfil'}
          </div>
        </div>
      )}

      {/* Rodapé interativo */}
      <div className="text-center text-[9px] text-indigo-600 font-bold flex items-center justify-center gap-0.5 pt-0.5 truncate">
        <span className="truncate">{t('guide_mockup_tap_to_open') || 'Tocar para abrir no aplicativo'}</span>
        <ChevronRight size={10} className="shrink-0" />
      </div>
    </div>
  );
});

GrowthMockupPhone.displayName = 'GrowthMockupPhone';