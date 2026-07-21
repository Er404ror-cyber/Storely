import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import type { PortfolioContent, SectionProps } from '../../../types/PortfolioTypes';
import { PortfolioLayout1 } from '../../Portfolio/PortfolioLayout1';
import { PortfolioLayout2 } from '../../Portfolio/PortfolioLayout2';
import { PortfolioLayout4 } from '../../Portfolio/PortfolioLayout4';

import { getUserCountry } from '../../../utils/mzn';
import { useTranslate } from '../../../context/LanguageContext';
import { useAdminStoreData } from '../../../hooks/useAdminStoreData';
import { X, Search, Image as ImageIcon, Globe, Link as LinkIcon, AlertCircle, CloudUpload } from 'lucide-react';

import { 
  PLATFORMS, ISO_COUNTRIES, COUNTRY_ALIASES, getFlagEmoji, normalizeText, ContentEditableField 
} from '../../Portfolio/PortfolioShared';

// ============================================================================
// COMPONENTE DO PAINEL LATERAL (Performance Máxima: Zero Transparência, Zero Blur)
// ============================================================================
const PortfolioEditorDock: React.FC<{ c: PortfolioContent, onUpdate: any, t: any, store: any }> = React.memo(({ c, onUpdate, t, store }) => {
  const [activeTab, setActiveTab] = useState<'none' | 'photo' | 'country' | 'social'>('none');
  const [countrySearch, setCountrySearch] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const countryList = useMemo(() => {
    let displayNames: Intl.DisplayNames;
    try { displayNames = new Intl.DisplayNames([t('current_lang') || 'pt'], { type: 'region' }); }
    catch { displayNames = { of: (code: string) => code } as any; }

    return ISO_COUNTRIES.map(code => {
      const lowerCode = code.toLowerCase();
      const name = displayNames.of(code) || code;
      const searchTerms = normalizeText(`${lowerCode} ${name} ${COUNTRY_ALIASES[lowerCode] || ''}`);
      return { code: lowerCode, name, searchTerms };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [t]);

  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countryList;
    const searchNorm = normalizeText(countrySearch);
    return countryList.filter(country => country.searchTerms.includes(searchNorm));
  }, [countryList, countrySearch]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0] && onUpdate) {
      const file = e.target.files[0];
      if (file.size > 1024 * 1024) { setFileError('compress'); setActiveTab('photo'); return; }
      const reader = new FileReader();
      reader.onloadend = () => { onUpdate('playerImageUrl', reader.result as string); setPendingFile(file); setActiveTab('photo'); };
      reader.readAsDataURL(file);
    }
  }, [onUpdate]);

  const handleCloudUpload = useCallback(async () => {
    if (!pendingFile || !onUpdate) return;
    setIsUploading(true);
    const formData = new FormData(); formData.append('file', pendingFile); formData.append('upload_preset', 'ProfileHero'); 
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dcffpnzxn/image/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.secure_url) { onUpdate('playerImageUrl', data.secure_url); setPendingFile(null); setActiveTab('none'); }
    } catch { alert(t('error_upload') || 'Erro no upload.'); } finally { setIsUploading(false); }
  }, [pendingFile, onUpdate, t]);

  const handleCountrySelect = useCallback((code: string) => { onUpdate('countryCode', code); setActiveTab('none'); }, [onUpdate]);
  
  const getTabTitle = useCallback((tab: string) => {
    switch (tab) { case 'photo': return t('common_photo') || 'Foto'; case 'country': return t('common_country') || 'País'; case 'social': return t('common_links') || 'Links'; default: return tab; }
  }, [t]);

  const defaultSocials = useMemo(() => [{ id: '1', platform: 'whatsapp', url: '' }, { id: '2', platform: 'linkedin', url: '' }], []);
  const socials = c.socials || defaultSocials;
  const currentCountry = c.countryCode || 'mz';

  return (
    <div className="absolute z-[60] flex flex-col md:items-end gap-2 right-3 top-1/2 -translate-y-1/2 md:top-8 md:right-8 md:translate-y-0 pointer-events-none">
      <input type="file" accept="image/*" ref={imageInputRef} onChange={handleFileSelect} className="hidden" />

      {/* DOCK LATERAL - Cor 100% Sólida. Sem transparência, Sem blur. Custo GPU: 0 */}
      <div className="flex flex-col md:flex-row-reverse gap-2 bg-[#111318] p-1.5 rounded-full shadow-xl pointer-events-auto border border-gray-800">
        <button onClick={() => setActiveTab(activeTab === 'photo' ? 'none' : 'photo')} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95 touch-manipulation ${activeTab === 'photo' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}><ImageIcon size={18} /></button>
        <button onClick={() => setActiveTab(activeTab === 'country' ? 'none' : 'country')} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95 touch-manipulation ${activeTab === 'country' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}><Globe size={18} /></button>
        <button onClick={() => setActiveTab(activeTab === 'social' ? 'none' : 'social')} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95 touch-manipulation ${activeTab === 'social' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}><LinkIcon size={18} /></button>
      </div>

      {/* PAINEL EXPANSIVO - Cor 100% Sólida */}
      {activeTab !== 'none' && (
        <div className="w-[75vw] max-w-[280px] sm:max-w-[320px] bg-[#1A1C23] rounded-2xl p-3 shadow-2xl border border-gray-800 flex flex-col gap-2 overflow-hidden pointer-events-auto">
          <div className="flex justify-between items-center mb-1 px-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{getTabTitle(activeTab)}</span>
            <button onClick={() => setActiveTab('none')} className="text-gray-500 hover:text-white transition-colors p-1 bg-white/5 rounded-full touch-manipulation"><X size={14}/></button>
          </div>

          {activeTab === 'photo' && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button onClick={() => imageInputRef.current?.click()} className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-[11px] font-bold transition-colors active:scale-95 flex justify-center items-center gap-1.5 touch-manipulation"><ImageIcon size={14} /> {t('portfolio_change_photo') || 'Alterar'}</button>
                {pendingFile && <button onClick={handleCloudUpload} disabled={isUploading} className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-[11px] font-bold transition-colors active:scale-95 flex justify-center items-center gap-1.5 touch-manipulation"><CloudUpload size={14} className={isUploading ? 'animate-bounce' : ''} /> {isUploading ? '⌛...' : (t('portfolio_save_cloud') || 'Salvar')}</button>}
              </div>
              {fileError === 'compress' && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2 mt-1 text-center"><p className="text-[10px] text-red-400 mb-1.5">{t('portfolio_photo_limit') || 'Foto > 1MB. Fica lento!'}</p><a href="https://squoosh.app/" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-white bg-red-600 px-3 py-1 rounded-lg touch-manipulation">Squoosh.app</a></div>}
            </div>
          )}

          {activeTab === 'country' && (
            <div className="flex flex-col gap-2 max-h-[35vh]">
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" placeholder={t('common_search') || 'Pesquisar país...'} value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded-xl pl-8 pr-3 py-2 text-[16px] md:text-xs text-white outline-none focus:border-blue-500 leading-tight touch-manipulation" />
              </div>
              <div className="flex flex-col gap-1 overflow-y-auto overscroll-contain pr-1">
                {filteredCountries.map(country => (
                  <button key={country.code} onClick={() => handleCountrySelect(country.code)} className={`flex items-center gap-3 p-2 rounded-lg text-left transition-colors active:scale-95 touch-manipulation ${currentCountry === country.code ? 'bg-blue-600/30 text-blue-400' : 'hover:bg-white/5 text-gray-300'}`}>
                    <span className="text-base leading-none">{getFlagEmoji(country.code)}</span>
                    <span className="text-[11px] font-semibold truncate">{country.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto overscroll-contain pr-1">
              {socials.map((s) => (
                <div key={s.id} className="bg-black/30 border border-gray-800 rounded-xl p-2.5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <select value={s.platform} onChange={(e) => onUpdate('socials', socials.map(x => x.id === s.id ? { ...x, platform: e.target.value, url: e.target.value === 'whatsapp' ? (store?.whatsapp_number || '') : '' } : x))} className="bg-transparent text-[16px] md:text-xs font-bold text-white outline-none cursor-pointer leading-tight touch-manipulation">
                      {Object.entries(PLATFORMS).map(([key, p]) => ( <option key={key} value={key} className="bg-gray-900">{p.name}</option> ))}
                    </select>
                    <button onClick={() => onUpdate('socials', socials.filter(x => x.id !== s.id))} className="text-gray-500 hover:text-red-400 p-1 bg-white/5 rounded-md touch-manipulation"><X size={12}/></button>
                  </div>
                  {s.platform === 'whatsapp' ? (
                    <div className="mt-0.5">
                      {store?.whatsapp_number ? ( <div className="text-[10px] font-mono text-green-400 bg-green-500/10 py-1.5 px-2 rounded-md border border-green-500/20">{store.whatsapp_number}</div> ) : ( <div className="flex items-start gap-1 text-[9px] text-amber-400 bg-amber-500/10 py-1.5 px-2 rounded-md border border-amber-500/20 leading-tight"><AlertCircle size={10} className="shrink-0 mt-0.5" /><span>{t('portfolio_go_settings_wa') || 'Configure o nº nas Definições.'}</span></div> )}
                    </div>
                  ) : ( <input value={s.url} onChange={(e) => onUpdate('socials', socials.map(x => x.id === s.id ? { ...x, url: e.target.value } : x))} className="w-full bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-[16px] md:text-xs text-white outline-none focus:border-blue-500 leading-tight touch-manipulation" placeholder={t('portfolio_user_or_url') || "Usuário ou URL"} /> )}
                </div>
              ))}
              {socials.length < 4 && <button onClick={() => onUpdate('socials', [...socials, { id: Date.now().toString(), platform: 'github', url: '' }])} className="w-full py-2 border border-dashed border-gray-600/50 rounded-xl text-gray-400 text-[10px] font-bold hover:text-white hover:bg-gray-800 active:scale-95 transition-colors mt-1 touch-manipulation">+ {t('common_add') || 'Adicionar'}</button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
});


// ============================================================================
// COMPONENTE PRINCIPAL MÃE
// ============================================================================
export const PortfolioHero: React.FC<SectionProps> = ({ content, style, onUpdate }) => {
  const { t } = useTranslate();
  const { store } = useAdminStoreData();
  const isEditor = !!onUpdate;
  
  const c = useMemo(() => content || ({} as PortfolioContent), [content]);
  
  const theme = style?.theme || 'dark';
  const cols = style?.cols || '1';
  const fontSize = style?.fontSize || 'base';

  useEffect(() => {
    if (isEditor && !c.countryCode && onUpdate) {
      try {
        const detectedGeo = getUserCountry().toLowerCase();
        onUpdate('countryCode', ISO_COUNTRIES.map(i => i.toLowerCase()).includes(detectedGeo) ? detectedGeo : 'mz');
      } catch {
        onUpdate('countryCode', 'mz');
      }
    }
  }, [c.countryCode, isEditor, onUpdate]);

  const defaultSocials = useMemo(() => [
    { id: '1', platform: 'whatsapp', url: '' }, 
    { id: '2', platform: 'linkedin', url: '' }
  ], []);
  
  const socials = useMemo(() => c.socials || defaultSocials, [c.socials, defaultSocials]);
  const currentCountry = useMemo(() => c.countryCode || 'mz', [c.countryCode]); 
  const displayImage = useMemo(() => c.playerImageUrl || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop&bg=transparent', [c.playerImageUrl]);

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-[#0B0C10]' : 'bg-[#F9FAFB]';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const cardBg = isDark ? 'bg-[#151720]/80 border-white/5' : 'bg-white border-gray-100 shadow-sm';
  const cardBgHighlight = isDark ? 'bg-[#1E3A8A]/30 border-blue-500/20' : 'bg-blue-50 border-blue-200';
  
  const editableClass = useMemo(() => isEditor ? `outline-none transition-colors cursor-text block max-w-full truncate ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'} rounded px-1 -mx-1` : "block max-w-full truncate", [isEditor, isDark]);

  const handleTextEdit = useCallback((key: string) => (e: React.FormEvent<HTMLElement>) => {
    if (onUpdate) onUpdate(key, e.currentTarget.textContent || '');
  }, [onUpdate]);

  const handleKeyDown = useCallback((maxLength: number) => (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') e.preventDefault();
    if ((e.currentTarget.textContent || '').length >= maxLength && e.key.length === 1 && !e.ctrlKey && !e.metaKey) e.preventDefault();
  }, []);

  const latestScope = useRef({ c, isEditor, onUpdate, t, cardBg, cardBgHighlight, isDark, editableClass, socials, store, currentCountry });
  latestScope.current = { c, isEditor, onUpdate, t, cardBg, cardBgHighlight, isDark, editableClass, socials, store, currentCountry };

  const RenderStats: React.FC<{ isVertical?: boolean }> = useCallback(({ isVertical = false }) => {
    const scope = latestScope.current;
    
    // REDUÇÃO RIGOROSA DOS LIMITES MAXLENGTH (mLabel e mVal): 
    // Garante que o input bloqueia fisicamente a escrita antes de quebrar o layout.
    const statsData = [
      { lKey: 's1Label', vKey: 's1Val', dLabel: scope.t('portfolio_projects') || 'Projetos', dVal: '+45', mLabel: 12, mVal: 10 },
      { lKey: 's2Label', vKey: 's2Val', dLabel: scope.t('portfolio_specialty') || 'Especialidade', dVal: 'Full-Stack', highlight: true, mLabel: 14, mVal: 12 },
      { lKey: 's3Label', vKey: 's3Val', dLabel: scope.t('portfolio_experience') || 'Experiência', dVal: '6 Anos', mLabel: 12, mVal: 10 },
    ];
    
    return (
      <div className={`grid gap-3 md:gap-4 z-30 relative w-full ${isVertical ? 'grid-cols-2 lg:grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
        {statsData.map((s, idx) => (
          <div key={idx} className={`${s.highlight ? scope.cardBgHighlight : scope.cardBg} border rounded-2xl p-3 md:p-4 lg:p-5 text-center flex flex-col justify-center w-full overflow-hidden transition-colors duration-200 ${isVertical && idx === 2 ? 'col-span-2 lg:col-span-1' : ''}`}>
            <ContentEditableField tagName="p" value={scope.c[s.lKey as keyof typeof scope.c] as string} fallback={s.dLabel} className={`text-[9px] md:text-[10px] font-bold tracking-widest leading-tight truncate ${s.highlight ? 'text-blue-500' : (scope.isDark ? 'text-gray-400' : 'text-gray-500')} mb-1 uppercase ${scope.editableClass}`} isEditor={scope.isEditor} maxLength={s.mLabel} onUpdate={(val: string) => { if (scope.onUpdate) scope.onUpdate(s.lKey, val) }} />
            <ContentEditableField tagName="h3" value={scope.c[s.vKey as keyof typeof scope.c] as string} fallback={s.dVal} className={`text-lg md:text-xl lg:text-2xl ${s.highlight ? 'font-bold' : 'font-medium'} leading-none truncate ${scope.editableClass}`} isEditor={scope.isEditor} maxLength={s.mVal} onUpdate={(val: string) => { if (scope.onUpdate) scope.onUpdate(s.vKey, val) }} />
          </div>
        ))}
      </div>
    );
  }, []);

  const RenderSocialsAndFlag: React.FC = useCallback(() => {
    const scope = latestScope.current;
    return (
      <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-3 md:mt-4">
        {scope.socials.filter((s: any) => PLATFORMS[s.platform]).map((s: any) => {
          const platformDef = PLATFORMS[s.platform];
          const isWhatsApp = s.platform === 'whatsapp';
          const finalUrl = isWhatsApp ? scope.store?.whatsapp_number : s.url;
          if (!scope.isEditor && (!finalUrl || String(finalUrl).trim() === '')) return null;
          const href = !scope.isEditor && finalUrl ? platformDef.getUrl(finalUrl) : undefined;
          
          return (
            <a key={s.id} href={href} target={href ? "_blank" : undefined} rel="noreferrer" title={platformDef.name} className={`${scope.isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors flex items-center justify-center ${!href ? 'cursor-default opacity-50' : ''}`}>
              {platformDef.icon}
            </a>
          );
        })}
        <div className="ml-1 shrink-0 flex items-center justify-center text-xl md:text-2xl select-none" title={scope.t('common_country') || 'País'}>{getFlagEmoji(scope.currentCountry)}</div>
      </div>
    );
  }, []);

  const layoutProps = useMemo(() => ({ 
    c, isEditor, isDark, fontSize, displayImage, editableClass, handleTextEdit, handleKeyDown, RenderStats, RenderSocialsAndFlag, style 
  }), [c, isEditor, isDark, fontSize, displayImage, editableClass, handleTextEdit, handleKeyDown, RenderStats, RenderSocialsAndFlag, style]);

  return (
    <div className={`relative w-full overflow-hidden flex flex-col font-sans ${bgColor} ${textColor}`} style={{ contentVisibility: 'auto', containIntrinsicSize: '800px', isolation: 'isolate' }}>
      
      {isEditor && onUpdate && (
        <PortfolioEditorDock c={c} onUpdate={onUpdate} t={t} store={store} />
      )}

      <div className="absolute top-[20%] lg:top-[25%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none flex justify-center overflow-hidden opacity-10 md:opacity-15 -rotate-3 w-full max-w-[100vw]">
        <span className="text-[clamp(3.5rem,8vw,12rem)] font-black tracking-[0.2em] md:tracking-[0.4em] leading-none whitespace-nowrap uppercase text-gray-500" style={{ fontFamily: '"Permanent Marker", cursive, sans-serif' }}>
          {c.backgroundText || t('portfolio_default_bg') || 'PORTFOLIO'}
        </span>
      </div>

      {cols === '1' && <PortfolioLayout1 {...layoutProps} />}
      {cols === '2' && <PortfolioLayout2 {...layoutProps} />}
      {cols === '4' && <PortfolioLayout4 {...layoutProps} />}
      
    </div>
  );
};