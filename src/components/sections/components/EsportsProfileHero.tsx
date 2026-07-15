import React, { useRef, useState, useEffect } from 'react';
import type { PortfolioContent, SectionProps } from '../../../types/PortfolioTypes';
import { PortfolioLayout1 } from '../../Portfolio/PortfolioLayout1';
import { PortfolioLayout2 } from '../../Portfolio/PortfolioLayout2';
import { PortfolioLayout4 } from '../../Portfolio/PortfolioLayout4';

// 1. Importações limpas das constantes globais
import { COUNTRIES, PLATFORMS } from '../../Portfolio/PortfolioShared';

// 2. Importação do utilitário geográfico (ajuste o caminho se necessário)
import { getUserCountry } from '../../../utils/mzn';

export const PortfolioHero: React.FC<SectionProps> = ({ content, style, onUpdate }) => {
  const isEditor = !!onUpdate;
  const c = content || {} as PortfolioContent;
  const theme = style?.theme || 'dark';
  const cols = style?.cols || '1';
  const fontSize = style?.fontSize || 'base';

  const [activeMenu, setActiveMenu] = useState<'none' | 'socials' | 'country' | 'upload'>('none');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // 🌍 Detecção Geográfica: Só corre na 1ª montagem E se o país estiver vazio
  useEffect(() => {
    if (isEditor && !c.countryCode && onUpdate) {
      try {
        const detectedGeo = getUserCountry().toLowerCase();
        const countryExists = COUNTRIES.some(country => country.code === detectedGeo);
        const finalCode = countryExists ? detectedGeo : 'mz';
        
        onUpdate('countryCode', finalCode);
        onUpdate('flagUrl', `https://flagcdn.com/w40/${finalCode}.png`);
      } catch (error) {
        onUpdate('countryCode', 'mz');
        onUpdate('flagUrl', `https://flagcdn.com/w40/mz.png`);
      }
    }
  }, []); // <-- O array vazio garante que isto só acontece UMA vez ao abrir.

  const socials = c.socials || [
    { id: '1', platform: 'whatsapp', url: '' },
    { id: '2', platform: 'linkedin', url: '' }
  ];

  // Garante que usa o país que já está no backend se existir
  const currentCountry = c.countryCode || 'mz'; 
  const displayImage = c.playerImageUrl || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop&bg=transparent';
  const displayFlag = c.flagUrl || `https://flagcdn.com/w40/${currentCountry}.png`;

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-[#0B0C10]' : 'bg-[#F9FAFB]';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  
  const cardBg = isDark ? 'bg-[#151720]/80 border-white/5 shadow-lg' : 'bg-white border-gray-100 shadow-md';
  const cardBgHighlight = isDark ? 'bg-[#1E3A8A]/30 border-blue-500/20 shadow-blue-900/20' : 'bg-blue-50 border-blue-200 shadow-sm';
  const editableClass = isEditor ? `outline-none transition-colors cursor-text block max-w-full truncate ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'} rounded px-1 -mx-1` : "block max-w-full truncate";

  // --- AÇÕES ---
  const handleTextEdit = (key: string) => (e: React.FormEvent<HTMLDivElement>) => {
    if (onUpdate) onUpdate(key, e.currentTarget.textContent || '');
  };

  const handleKeyDown = (maxLength: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') e.preventDefault();
    if ((e.currentTarget.textContent || '').length >= maxLength && e.key.length === 1 && !e.ctrlKey && !e.metaKey) e.preventDefault();
  };

  const handleCountryChange = (code: string) => {
    if (onUpdate) {
      onUpdate('countryCode', code);
      onUpdate('flagUrl', `https://flagcdn.com/w40/${code}.png`);
      setActiveMenu('none');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0] && onUpdate) {
      const file = e.target.files[0];
      
      // Validação restrita de 1MB
      if (file.size > 1024 * 1024) {
        setFileError('compress');
        setActiveMenu('upload');
        return;
      }

      // Preview local instantâneo via Base64 para não perder em caso de recarregamento
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate('playerImageUrl', reader.result as string);
        setPendingFile(file);
        setActiveMenu('none');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloudUpload = async () => {
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
        setPendingFile(null); // Conclui o envio e limpa o pendente
      }
    } catch (error) {
      alert('Erro ao carregar para nuvem.');
    } finally {
      setIsUploading(false);
    }
  };

  const updateSocial = (id: string, field: 'platform' | 'url', val: string) => {
    if (onUpdate) onUpdate('socials', socials.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  // --- SUB-COMPONENTES PARA PASSAR AOS LAYOUTS ---
  const RenderStats: React.FC<{ isVertical?: boolean }> = ({ isVertical = false }) => {
    const statsData = [
      { lKey: 's1Label', vKey: 's1Val', dLabel: 'Projetos', dVal: '+45' },
      { lKey: 's2Label', vKey: 's2Val', dLabel: 'Especialidade', dVal: 'Full-Stack', highlight: true },
      { lKey: 's3Label', vKey: 's3Val', dLabel: 'Experiência', dVal: '6 Anos' },
    ];
    return (
      <div className={`grid gap-3 md:gap-4 z-30 relative w-full ${isVertical ? 'grid-cols-2 lg:grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
        {statsData.map((s, idx) => (
          <div key={idx} className={`${s.highlight ? cardBgHighlight : cardBg} border rounded-2xl p-4 md:p-5 text-center flex flex-col justify-center transition-transform hover:-translate-y-1 w-full overflow-hidden ${isVertical && idx === 2 ? 'col-span-2 lg:col-span-1' : ''}`}>
            <p className={`text-[10px] font-bold tracking-widest ${s.highlight ? 'text-blue-500' : (isDark ? 'text-gray-400' : 'text-gray-500')} mb-1 uppercase ${editableClass}`} contentEditable={isEditor} suppressContentEditableWarning onKeyDown={handleKeyDown(18)} onBlur={handleTextEdit(s.lKey)}>
            {(c[s.lKey] as string) || s.dLabel}
            </p>
            <h3 className={`text-2xl md:text-3xl ${s.highlight ? 'font-bold' : 'font-medium'} ${editableClass}`} contentEditable={isEditor} suppressContentEditableWarning onKeyDown={handleKeyDown(15)} onBlur={handleTextEdit(s.vKey)}>
            {(c[s.vKey] as string) || s.dVal}
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
        const href = isEditor || !s.url ? undefined : platformDef.getUrl(s.url);
        return (
          <a key={s.id} href={href} target="_blank" rel="noreferrer" title={platformDef.name} className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-transform hover:scale-110 flex items-center justify-center`}>
            {platformDef.icon}
          </a>
        );
      })}
      <div className={`w-8 h-5 ml-1 rounded-[3px] bg-cover bg-center shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-300'} shrink-0`} style={{ backgroundImage: `url(${displayFlag})` }} />
    </div>
  );

  const layoutProps = { c, isEditor, isDark, fontSize, displayImage, editableClass, handleTextEdit, handleKeyDown, RenderStats, RenderSocialsAndFlag };

  return (
    <div className={`relative w-full overflow-hidden flex flex-col font-sans ${bgColor} ${textColor}`}>
      
      {/* MENU EDITOR */}
      {isEditor && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center w-[95%] max-w-[420px]">
          <div className="flex items-center justify-center w-full gap-2 bg-[#1A1C23]/95 backdrop-blur-sm border border-gray-700 p-2 rounded-xl shadow-xl text-white">
            <input type="file" accept="image/*" ref={imageInputRef} onChange={handleFileSelect} className="hidden" />
            
            <button onClick={() => imageInputRef.current?.click()} className="flex-1 py-1.5 rounded-lg text-[10px] md:text-xs font-bold bg-blue-600 hover:bg-blue-500 transition-colors">
              📸 Foto
            </button>
            
            {/* Exibe o botão de subida para a cloud se houver uma imagem pendente */}
            {pendingFile && (
              <button onClick={handleCloudUpload} disabled={isUploading} className="flex-1 py-1.5 rounded-lg text-[10px] md:text-xs font-bold bg-green-600 hover:bg-green-500 transition-colors animate-pulse">
                {isUploading ? '⌛ Subindo...' : '☁️ Nuvem'}
              </button>
            )}

            <button onClick={() => setActiveMenu(activeMenu === 'country' ? 'none' : 'country')} className={`flex-1 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-colors ${activeMenu === 'country' ? 'bg-gray-600' : 'bg-gray-800 hover:bg-gray-700'}`}>
              🌍 País
            </button>
            <button onClick={() => setActiveMenu(activeMenu === 'socials' ? 'none' : 'socials')} className={`flex-1 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-colors ${activeMenu === 'socials' ? 'bg-gray-600' : 'bg-gray-800 hover:bg-gray-700'}`}>
              🌐 Links
            </button>
          </div>

          {/* ALERTA DE LIMITE DE TAMANHO DA FOTO */}
          {activeMenu === 'upload' && fileError === 'compress' && (
            <div className="w-full mt-2 bg-red-900/90 border border-red-500 rounded-xl p-3 shadow-lg text-center">
              <p className="text-xs text-red-200 mb-2 font-medium">A foto excedeu o limite de 1MB. Isso torna seu site muito pesado.</p>
              <a href="https://squoosh.app/" target="_blank" rel="noreferrer" className="inline-block bg-white text-red-900 px-4 py-1.5 rounded text-xs font-bold hover:bg-gray-200">
                Otimize grátis aqui e tente de novo
              </a>
            </div>
          )}

          {/* LISTA DE PAÍSES DINÂMICA */}
          {activeMenu === 'country' && (
            <div className="w-full mt-2 bg-[#1A1C23] border border-gray-700 rounded-xl p-3 shadow-lg grid grid-cols-2 gap-2">
              {COUNTRIES.map(country => (
                <button key={country.code} onClick={() => handleCountryChange(country.code)} className={`text-[10px] md:text-xs py-1.5 rounded-md font-medium ${currentCountry === country.code ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                  {country.name}
                </button>
              ))}
            </div>
          )}

          {/* LISTA DE REDES SOCIAIS OFICIAIS */}
          {activeMenu === 'socials' && (
            <div className="w-full mt-2 bg-[#1A1C23] border border-gray-700 rounded-xl p-3 shadow-lg flex flex-col gap-2">
              {socials.map((s) => (
                <div key={s.id} className="flex gap-2 items-center bg-gray-800 p-1.5 rounded-lg">
                  <select 
                    value={s.platform} 
                    onChange={(e) => updateSocial(s.id, 'platform', e.target.value)} 
                    className="w-[35%] bg-transparent border-b border-gray-600 outline-none text-[10px] font-bold text-white cursor-pointer"
                  >
                    {Object.entries(PLATFORMS).map(([key, p]) => (
                      <option key={key} value={key} className="bg-gray-900 text-white">{p.name}</option>
                    ))}
                  </select>
                  <input 
                    value={s.url} 
                    onChange={(e) => updateSocial(s.id, 'url', e.target.value)} 
                    className="w-[55%] bg-transparent border-b border-gray-600 outline-none text-[10px] text-white" 
                    placeholder={s.platform === 'whatsapp' ? 'Nº: 25884...' : 'Usuário ou URL'} 
                  />
                  <button onClick={() => onUpdate && onUpdate('socials', socials.filter(x => x.id !== s.id))} className="w-[10%] text-red-400 hover:text-red-300 text-xs text-center font-bold">✕</button>
                </div>
              ))}
              {socials.length < 3 && (
                <button onClick={() => onUpdate && onUpdate('socials', [...socials, { id: Date.now().toString(), platform: 'github', url: '' }])} className="w-full py-1.5 border border-dashed border-gray-600 rounded-lg text-gray-400 text-[10px] hover:text-white font-medium">
                  + Adicionar Link
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* TEXTO DE FUNDO ARTÍSTICO */}
      <div className="absolute top-[20%] lg:top-[25%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none flex justify-center overflow-hidden opacity-20 md:opacity-30 -rotate-3 w-full max-w-[100vw]">
        <span 
          className="text-[clamp(3.5rem,8vw,12rem)] font-black tracking-[0.2em] md:tracking-[0.4em] leading-none whitespace-nowrap uppercase" 
          style={{ 
            fontFamily: '"Permanent Marker", cursive, sans-serif',
            WebkitTextStroke: isDark ? '2px rgba(255,255,255,0.1)' : '2px rgba(0,0,0,0.08)',
            color: 'transparent'
          }}
        >
          {c.backgroundText || 'PORTFOLIO'}
        </span>
      </div>

      {cols === '1' && <PortfolioLayout1 {...layoutProps} />}
      {cols === '2' && <PortfolioLayout2 {...layoutProps} />}
      {cols === '4' && <PortfolioLayout4 {...layoutProps} />}
      
    </div>
  );
};