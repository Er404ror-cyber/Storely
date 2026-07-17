import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import type { PortfolioContent, SectionProps } from '../../../types/PortfolioTypes';
import { PortfolioLayout1 } from '../../Portfolio/PortfolioLayout1';
import { PortfolioLayout2 } from '../../Portfolio/PortfolioLayout2';
import { PortfolioLayout4 } from '../../Portfolio/PortfolioLayout4';

import { PLATFORMS } from '../../Portfolio/PortfolioShared';
import { getUserCountry } from '../../../utils/mzn';
import { useTranslate } from '../../../context/LanguageContext';
import { X, Search, Image as ImageIcon, Globe, Link as LinkIcon, AlertCircle, CloudUpload } from 'lucide-react';
import { useAdminStoreData } from '../../../hooks/useAdminStoreData';

const ISO_COUNTRIES = ["AF","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BA","BW","BR","IO","VG","BN","BG","BF","BI","CV","KH","CM","CA","KY","CF","TD","CL","CN","CX","CC","CO","KM","CD","CG","CK","CR","HR","CU","CW","CY","CZ","CI","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","SZ","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HN","HK","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MO","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","MK","RO","RU","RW","RE","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SX","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","US","UM","VI","UY","UZ","VU","VA","VE","VN","WF","EH","YE","ZM","ZW"];

const getFlagEmoji = (countryCode: string) => {
  if (!countryCode) return '🌍';
  const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};


// Remove acentos e normaliza para busca perfeita
const normalizeText = (text: string) => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export const PortfolioHero: React.FC<SectionProps> = ({ content, style, onUpdate }) => {
  const { t } = useTranslate();
  const isEditor = !!onUpdate;
  const c = content || {} as PortfolioContent;
  const theme = style?.theme || 'dark';
  const cols = style?.cols || '1';
  const fontSize = style?.fontSize || 'base';

  const { store } = useAdminStoreData();

  const [activeTab, setActiveTab] = useState<'none' | 'photo' | 'country' | 'social'>('none');
  const [countrySearch, setCountrySearch] = useState('');

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const countryList = useMemo(() => {
    try {
      const displayNames = new Intl.DisplayNames([t('current_lang') || 'pt'], { type: 'region' });
      return ISO_COUNTRIES.map(code => ({
        code: code.toLowerCase(),
        name: displayNames.of(code) || code
      })).sort((a, b) => a.name.localeCompare(b.name));
    } catch {
      return ISO_COUNTRIES.map(code => ({ code: code.toLowerCase(), name: code }));
    }
  }, [t]);

  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countryList;
    const searchNorm = normalizeText(countrySearch);
    return countryList.filter(c => normalizeText(c.name).includes(searchNorm));
  }, [countryList, countrySearch]);

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

  const socials = useMemo(() => c.socials || [
    { id: '1', platform: 'whatsapp', url: '' },
    { id: '2', platform: 'linkedin', url: '' }
  ], [c.socials]);

  const currentCountry = c.countryCode || 'mz'; 
  const displayImage = c.playerImageUrl || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop&bg=transparent';

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-[#0B0C10]' : 'bg-[#F9FAFB]';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const cardBg = isDark ? 'bg-[#151720]/80 border-white/5 shadow-lg' : 'bg-white border-gray-100 shadow-md';
  const cardBgHighlight = isDark ? 'bg-[#1E3A8A]/30 border-blue-500/20 shadow-blue-900/20' : 'bg-blue-50 border-blue-200 shadow-sm';
  const editableClass = isEditor ? `outline-none transition-colors cursor-text block max-w-full truncate ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'} rounded px-1 -mx-1` : "block max-w-full truncate";

  const handleTextEdit = useCallback((key: string) => (e: React.FormEvent<HTMLElement>) => {
    if (onUpdate) onUpdate(key, e.currentTarget.textContent || '');
  }, [onUpdate]);

  const handleKeyDown = useCallback((maxLength: number) => (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') e.preventDefault();
    if ((e.currentTarget.textContent || '').length >= maxLength && e.key.length === 1 && !e.ctrlKey && !e.metaKey) e.preventDefault();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0] && onUpdate) {
      const file = e.target.files[0];
      if (file.size > 1024 * 1024) {
        setFileError('compress');
        setActiveTab('photo');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate('playerImageUrl', reader.result as string);
        setPendingFile(file);
        setActiveTab('photo');
      };
      reader.readAsDataURL(file);
    }
  }, [onUpdate]);

  const handleCloudUpload = useCallback(async () => {
    if (!pendingFile || !onUpdate) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', pendingFile);
    formData.append('upload_preset', 'ProfileHero'); 
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dcffpnzxn/image/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.secure_url) {
        onUpdate('playerImageUrl', data.secure_url);
        setPendingFile(null); 
        setActiveTab('none');
      }
    } catch {
      alert(t('error_upload') || 'Erro no upload.');
    } finally {
      setIsUploading(false);
    }
  }, [pendingFile, onUpdate, t]);
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'photo': return t('common_photo') || 'Foto';
      case 'country': return t('common_country') || 'País';
      case 'social': return t('common_links') || 'Links';
      default: return tab;
    }
  };
  const handleCountrySelect = useCallback((code: string) => {
    if (onUpdate) {
      onUpdate('countryCode', code);
      setActiveTab('none');
    }
  }, [onUpdate]);

  const RenderStats: React.FC<{ isVertical?: boolean }> = ({ isVertical = false }) => {
    const statsData = [
      { lKey: 's1Label', vKey: 's1Val', dLabel: t('portfolio_projects') || 'Projetos', dVal: '+45' },
      { lKey: 's2Label', vKey: 's2Val', dLabel: t('portfolio_specialty') || 'Especialidade', dVal: 'Full-Stack', highlight: true },
      { lKey: 's3Label', vKey: 's3Val', dLabel: t('portfolio_experience') || 'Experiência', dVal: '6 Anos' },
    ];
    return (
      <div className={`grid gap-3 md:gap-4 z-30 relative w-full ${isVertical ? 'grid-cols-2 lg:grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
        {statsData.map((s, idx) => (
          <div key={idx} className={`${s.highlight ? cardBgHighlight : cardBg} border rounded-2xl p-4 md:p-5 text-center flex flex-col justify-center transition-transform hover:-translate-y-1 w-full overflow-hidden will-change-[transform] ${isVertical && idx === 2 ? 'col-span-2 lg:col-span-1' : ''}`}>
            <p className={`text-[10px] font-bold tracking-widest ${s.highlight ? 'text-blue-500' : (isDark ? 'text-gray-400' : 'text-gray-500')} mb-1 uppercase ${editableClass}`} contentEditable={isEditor} suppressContentEditableWarning onKeyDown={handleKeyDown(18)} onBlur={handleTextEdit(s.lKey)}>
            {(c[s.lKey as keyof typeof c] as string) || s.dLabel}
            </p>
            <h3 className={`text-2xl md:text-3xl ${s.highlight ? 'font-bold' : 'font-medium'} ${editableClass}`} contentEditable={isEditor} suppressContentEditableWarning onKeyDown={handleKeyDown(15)} onBlur={handleTextEdit(s.vKey)}>
            {(c[s.vKey as keyof typeof c] as string) || s.dVal}
            </h3>
          </div>
        ))}
      </div>
    );
  };

  const RenderSocialsAndFlag: React.FC = () => (
    <div className="flex flex-wrap items-center gap-4 mt-3 md:mt-4">
      {socials.filter(s => PLATFORMS[s.platform]).map((s) => {
        const platformDef = PLATFORMS[s.platform];
        const isWhatsApp = s.platform === 'whatsapp';
        const finalUrl = isWhatsApp ? store?.whatsapp_number : s.url;

        if (!isEditor && (!finalUrl || String(finalUrl).trim() === '')) return null;

        const href = !isEditor && finalUrl ? platformDef.getUrl(finalUrl) : undefined;
        
        return (
          <a key={s.id} href={href} target={href ? "_blank" : undefined} rel="noreferrer" title={platformDef.name} className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-transform hover:scale-110 flex items-center justify-center will-change-[transform] ${!href ? 'cursor-default opacity-50' : ''}`}>
            {platformDef.icon}
          </a>
        );
      })}
      
      <div className="ml-1 shrink-0 flex items-center justify-center text-2xl select-none" title={t('common_country') || 'País'}>
        {getFlagEmoji(currentCountry)}
      </div>
    </div>
  );

  const layoutProps = { c, isEditor, isDark, fontSize, displayImage, editableClass, handleTextEdit, handleKeyDown, RenderStats, RenderSocialsAndFlag };

  return (
    <div className={`relative w-full overflow-hidden flex flex-col font-sans ${bgColor} ${textColor}`} style={{ contentVisibility: 'auto', containIntrinsicSize: '800px', isolation: 'isolate' }}>
      
      {/* 📱 MENU LATERAL FLUTUANTE (Dock) - Fica no espaço deste componente (absolute) e abre p/ esquerda */}
      {isEditor && (
        <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-[60] flex flex-row-reverse items-center gap-2 will-change-[transform,opacity]">
          
          <input type="file" accept="image/*" ref={imageInputRef} onChange={handleFileSelect} className="hidden" />

          {/* DOCK LATERAL VERTICAL */}
          <div className="flex flex-col gap-2 bg-[#111318]/90 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-2xl">
            <button onClick={() => setActiveTab(activeTab === 'photo' ? 'none' : 'photo')} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95 ${activeTab === 'photo' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/10'}`}>
              <ImageIcon size={18} />
            </button>
            <button onClick={() => setActiveTab(activeTab === 'country' ? 'none' : 'country')} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95 ${activeTab === 'country' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/10'}`}>
              <Globe size={18} />
            </button>
            <button onClick={() => setActiveTab(activeTab === 'social' ? 'none' : 'social')} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95 ${activeTab === 'social' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/10'}`}>
              <LinkIcon size={18} />
            </button>
          </div>

          {/* PAINEL EXPANSIVO (Abre para a esquerda) */}
          {activeTab !== 'none' && (
            <div className="w-[75vw] max-w-[280px] sm:max-w-[320px] bg-[#1A1C23]/95 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/10 flex flex-col gap-2 overflow-hidden animate-in slide-in-from-right-2 fade-in duration-200">
              
              <div className="flex justify-between items-center mb-1 px-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{getTabTitle(activeTab)}</span>
                <button onClick={() => setActiveTab('none')} className="text-gray-500 hover:text-white transition-colors p-1 bg-white/5 rounded-full"><X size={14}/></button>
              </div>

              {activeTab === 'photo' && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button onClick={() => imageInputRef.current?.click()} className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-[11px] font-bold transition-colors active:scale-95 flex justify-center items-center gap-1.5">
                      <ImageIcon size={14} /> {t('portfolio_change_photo') || 'Alterar'}
                    </button>
                    {pendingFile && (
                      <button onClick={handleCloudUpload} disabled={isUploading} className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-[11px] font-bold transition-colors active:scale-95 flex justify-center items-center gap-1.5">
                        <CloudUpload size={14} className={isUploading ? 'animate-bounce' : ''} />
                        {isUploading ? '⌛...' : (t('portfolio_save_cloud') || 'Salvar')}
                      </button>
                    )}
                  </div>
                  {fileError === 'compress' && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2 mt-1 text-center">
                      <p className="text-[10px] text-red-400 mb-1.5">{t('portfolio_photo_limit') || 'Foto > 1MB. Fica lento!'}</p>
                      <a href="https://squoosh.app/" target="_blank" rel="noreferrer" className="text-[10px] font-bold text-white bg-red-600 px-3 py-1 rounded-lg">Squoosh.app</a>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'country' && (
                <div className="flex flex-col gap-2 max-h-[35vh]">
                  <div className="relative">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    {/* 📱 Anti-Zoom iOS Safari: text-[16px] obriga o iOS a não dar zoom, e md:text-[11px] ajusta no desktop */}
                    <input 
                      type="text" placeholder={t('common_search') || 'Pesquisar país...'} 
                      value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-[16px] md:text-[11px] text-white outline-none focus:border-blue-500 leading-tight"
                    />
                  </div>
                  <div className="flex flex-col gap-1 overflow-y-auto overscroll-contain pr-1">
                  {filteredCountries.map(country => (
  <button 
    key={country.code} 
    onClick={() => handleCountrySelect(country.code)} 
    className={`flex items-center gap-3 p-2 rounded-lg text-left transition-colors active:scale-95 ${
      currentCountry === country.code 
        ? 'bg-blue-600/30 text-blue-400' 
        : 'hover:bg-white/5 text-gray-300'
    }`}
  >
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
                    <div key={s.id} className="bg-black/30 border border-white/10 rounded-xl p-2.5 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        {/* 📱 Anti-Zoom iOS Safari */}
                        <select 
                          value={s.platform} 
                          onChange={(e) => onUpdate && onUpdate('socials', socials.map(x => x.id === s.id ? { ...x, platform: e.target.value, url: e.target.value === 'whatsapp' ? (store?.whatsapp_number || '') : '' } : x))} 
                          className="bg-transparent text-[16px] md:text-[11px] font-bold text-white outline-none cursor-pointer leading-tight"
                        >
                          {Object.entries(PLATFORMS).map(([key, p]) => (
                            <option key={key} value={key} className="bg-gray-900">{p.name}</option>
                          ))}
                        </select>
                        <button onClick={() => onUpdate && onUpdate('socials', socials.filter(x => x.id !== s.id))} className="text-gray-500 hover:text-red-400 p-1 bg-white/5 rounded-md"><X size={12}/></button>
                      </div>

                      {s.platform === 'whatsapp' ? (
                        <div className="mt-0.5">
                          {store?.whatsapp_number ? (
                            <div className="text-[10px] font-mono text-green-400 bg-green-500/10 py-1.5 px-2 rounded-md border border-green-500/20">{store.whatsapp_number}</div>
                          ) : (
                            <div className="flex items-start gap-1 text-[9px] text-amber-400 bg-amber-500/10 py-1.5 px-2 rounded-md border border-amber-500/20 leading-tight">
                              <AlertCircle size={10} className="shrink-0 mt-0.5" />
                              <span>{t('portfolio_go_settings_wa') || 'Configure o nº nas Definições.'}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <input 
                          value={s.url} onChange={(e) => onUpdate && onUpdate('socials', socials.map(x => x.id === s.id ? { ...x, url: e.target.value } : x))} 
                          className="w-full bg-black/40 border border-gray-700/50 rounded-lg px-2.5 py-1.5 text-[16px] md:text-[10px] text-white outline-none focus:border-blue-500 leading-tight" 
                          placeholder={t('portfolio_user_or_url') || "Usuário ou URL"} 
                        />
                      )}
                    </div>
                  ))}
                  {socials.length < 4 && (
                    <button onClick={() => onUpdate && onUpdate('socials', [...socials, { id: Date.now().toString(), platform: 'github', url: '' }])} className="w-full py-2 border border-dashed border-gray-600/50 rounded-xl text-gray-400 text-[10px] font-bold hover:text-white hover:bg-white/5 active:scale-95 transition-all mt-1">
                      + {t('common_add') || 'Adicionar'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TEXTO DE FUNDO ARTÍSTICO */}
      <div className="absolute top-[20%] lg:top-[25%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none flex justify-center overflow-hidden opacity-20 md:opacity-30 -rotate-3 w-full max-w-[100vw] will-change-[transform]">
        <span className="text-[clamp(3.5rem,8vw,12rem)] font-black tracking-[0.2em] md:tracking-[0.4em] leading-none whitespace-nowrap uppercase" style={{ fontFamily: '"Permanent Marker", cursive, sans-serif', WebkitTextStroke: isDark ? '2px rgba(255,255,255,0.1)' : '2px rgba(0,0,0,0.08)', color: 'transparent' }}>
          {c.backgroundText || t('portfolio_default_bg') || 'PORTFOLIO'}
        </span>
      </div>

      {cols === '1' && <PortfolioLayout1 {...layoutProps} />}
      {cols === '2' && <PortfolioLayout2 {...layoutProps} />}
      {cols === '4' && <PortfolioLayout4 {...layoutProps} />}
      
    </div>
  );
};