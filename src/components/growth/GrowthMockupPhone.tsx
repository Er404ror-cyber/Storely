import { memo } from 'react';
import { BadgeCheck, Star, Globe, Navigation, PhoneCall, Share2, ShoppingBag, Plus, ArrowLeft, ChevronRight } from 'lucide-react';

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
  return (
    <div 
      onClick={onOpenApp}
      className="w-full max-w-[300px] rounded-[2rem] bg-white p-3 shadow-lg border-2 border-zinc-800 text-zinc-800 font-sans text-xs space-y-2.5 cursor-pointer hover:border-indigo-600 transition-all overflow-hidden"
      title={t('guide_mockup_tap_to_open') || 'Tocar para abrir no aplicativo'}
    >
      <div className="flex justify-between items-center px-1 text-[9px] text-zinc-400 font-bold">
        <span>9:41</span>
        <div className="w-10 h-2 bg-zinc-800 rounded-full" />
        <span>5G</span>
      </div>

      {/* WHATSAPP */}
      {mockupType === 'whatsapp' && (
        <div className="bg-[#EFEAE2] rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
          <div className="bg-[#008069] text-white p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <ArrowLeft size={13} className="shrink-0" />
              {logoUrl ? (
                <img src={logoUrl} alt="" className="w-6 h-6 rounded-full object-cover shrink-0 border border-white/40" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-[9px] shrink-0">
                  {storeName?.charAt(0) || 'S'}
                </div>
              )}
              <div className="min-w-0">
                <div className="font-bold text-[10px] truncate leading-tight flex items-center gap-1">
                  <span>{storeName || t('guide_mockup_default_store') || 'Minha Loja'}</span>
                  <BadgeCheck size={10} className="text-emerald-300 shrink-0" />
                </div>
                <div className="text-[7.5px] text-emerald-100 truncate">{t('guide_mockup_business_account') || 'Conta Comercial Oficial'}</div>
              </div>
            </div>
          </div>

          <div className="p-2.5 space-y-2">
            <div className="bg-white rounded-xl rounded-tl-xs p-2 shadow-xs border border-zinc-200/80 space-y-1.5 max-w-[90%]">
              <div className="text-[8.5px] text-zinc-700 leading-snug">
                {t('guide_mockup_wa_welcome_msg') || 'Olá! Seja bem-vindo(a). Confira o nosso catálogo completo com fotos e preços:'}
              </div>
              <div className="bg-zinc-50 rounded-lg p-1.5 border border-zinc-200 flex items-center gap-2">
                <div className="w-9 h-9 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 font-bold">
                  <ShoppingBag size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-[8.5px] text-zinc-900 block truncate">{t('guide_mockup_official_catalog_label') || 'Catálogo Oficial'}</span>
                  <span className="text-[7.5px] text-emerald-600 font-mono block truncate">{activeUrl.replace(/^https?:\/\//, '')}</span>
                </div>
              </div>
              <div className="text-center pt-0.5">
                <span className="text-[8px] font-bold text-[#008069] block">
                  {t('guide_mockup_wa_catalog_btn') || 'Ver Catálogo Completo'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TIKTOK */}
      {mockupType === 'tiktok' && (
        <div className="bg-zinc-950 text-white rounded-2xl p-3 space-y-2.5 border border-zinc-800 shadow-2xs text-center">
          <div className="relative w-12 h-12 mx-auto">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="w-12 h-12 rounded-full object-cover border border-white/20" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center font-black text-sm border border-white/20">
                {storeName?.charAt(0) || 'S'}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-rose-500 rounded-full flex items-center justify-center text-white text-[8px] font-black">
              <Plus size={9} />
            </div>
          </div>
          <div>
            <div className="font-bold text-[10px] flex items-center justify-center gap-1">
              <span>@{storeName?.toLowerCase().replace(/\s+/g, '') || 'minhaloja'}</span>
              <BadgeCheck size={11} className="text-sky-400" />
            </div>
            <div className="text-[8px] text-zinc-400">{storeName || t('guide_mockup_official_store_label') || 'Loja Oficial'}</div>
          </div>
          <div className="flex justify-center gap-4 text-center text-[8.5px]">
            <div><strong className="block text-white font-black">124</strong>{t('guide_mockup_following') || 'a seguir'}</div>
            <div><strong className="block text-white font-black">2.8k</strong>{t('guide_mockup_followers') || 'seguidores'}</div>
            <div><strong className="block text-white font-black">18.4k</strong>{t('guide_mockup_likes') || 'curtidas'}</div>
          </div>
          <div className="bg-zinc-900/90 py-1.5 px-2 rounded-xl text-rose-400 text-[8.5px] font-bold truncate border border-zinc-800 flex items-center justify-center gap-1">
            <span className="text-zinc-400">🔗</span>
            <span className="truncate">{activeUrl.replace(/^https?:\/\//, '')}</span>
          </div>
        </div>
      )}

      {/* GOOGLE MAPS */}
      {mockupType === 'google' && (
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
          <div className="h-16 bg-gradient-to-r from-blue-100 via-sky-50 to-amber-50 relative p-2.5 flex items-end justify-between border-b border-zinc-100">
            <div className="w-7 h-7 rounded-xl bg-white shadow-md border border-zinc-200 flex items-center justify-center font-black text-blue-600 text-[11px]">
              {storeName?.charAt(0) || 'G'}
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[8px] tracking-wide">
              {t('guide_mockup_google_open_status') || 'ABERTO'}
            </span>
          </div>
          <div className="p-3 space-y-2.5">
            <div>
              <h4 className="font-black text-[11px] text-zinc-900 truncate leading-tight">{storeName || t('guide_mockup_google_default_title') || 'Sua Loja Oficial'}</h4>
              <div className="flex items-center gap-1 text-[9px] mt-0.5">
                <span className="font-bold text-amber-600">5.0</span>
                <div className="flex text-amber-400"><Star size={9} className="fill-amber-400" /></div>
                <span className="text-zinc-400">(48) · {t('guide_mockup_google_store_type') || 'Loja'}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1.5 py-1 border-y border-zinc-100 text-center">
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs"><Globe size={13} /></div>
                <span className="text-[8px] font-bold text-blue-700">{t('guide_mockup_google_tab_website') || 'Website'}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200"><Navigation size={12} /></div>
                <span className="text-[8px] font-medium text-zinc-600">{t('guide_mockup_google_tab_directions') || 'Rotas'}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200"><PhoneCall size={12} /></div>
                <span className="text-[8px] font-medium text-zinc-600">{t('guide_mockup_google_tab_call') || 'Ligar'}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200"><Share2 size={12} /></div>
                <span className="text-[8px] font-medium text-zinc-600">{t('guide_mockup_google_tab_share') || 'Partilhar'}</span>
              </div>
            </div>
            <div className="space-y-1 text-[9px] text-zinc-600">
              <div className="flex items-center gap-1.5">
                <Globe size={11} className="text-blue-600 shrink-0" />
                <span className="text-blue-600 font-bold truncate underline">{activeUrl.replace(/^https?:\/\//, '')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSTAGRAM */}
      {mockupType === 'instagram' && (
        <div className="bg-zinc-50 p-2.5 rounded-2xl space-y-2 border border-zinc-200/80 w-full min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-0.5 shrink-0">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-[10px] text-zinc-900">
                {storeName?.charAt(0) || 'S'}
              </div>
            </div>
            <div className="flex gap-2 text-center text-[8.5px] shrink-0">
              <div><strong className="block text-zinc-900 font-black">12</strong>{t('guide_mockup_posts') || 'posts'}</div>
              <div><strong className="block text-zinc-900 font-black">1.4k</strong>{t('guide_mockup_followers') || 'seguidores'}</div>
              <div><strong className="block text-zinc-900 font-black">230</strong>{t('guide_mockup_following') || 'a seguir'}</div>
            </div>
          </div>
          <div className="text-[10px] space-y-0.5 min-w-0 w-full">
            <div className="font-black text-zinc-900 flex items-center gap-1 truncate">
              <span className="truncate">{storeName || 'Storely Official'}</span>
              <BadgeCheck size={12} className="text-sky-500 shrink-0" />
            </div>
            <div className="text-zinc-500 text-[9px] truncate">{t('guide_mockup_official_tag') || 'Catálogo Oficial'}</div>
            <div className="text-indigo-600 font-bold truncate pt-0.5 block w-full overflow-hidden text-[9.5px]">
              🔗 {activeUrl.replace(/^https?:\/\//, '')}
            </div>
          </div>
          <div className="w-full py-1 text-center bg-zinc-200 rounded-lg text-[9px] font-bold text-zinc-700">
            {t('guide_mockup_ig_edit_profile') || 'Editar Perfil'}
          </div>
        </div>
      )}

      <div className="text-center text-[9px] text-indigo-600 font-bold flex items-center justify-center gap-0.5 pt-0.5 truncate">
        <span className="truncate">{t('guide_mockup_tap_to_open') || 'Tocar para abrir no aplicativo'}</span>
        <ChevronRight size={10} className="shrink-0" />
      </div>
    </div>
  );
});

GrowthMockupPhone.displayName = 'GrowthMockupPhone';