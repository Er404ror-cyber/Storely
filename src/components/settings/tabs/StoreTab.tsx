import { useState, useMemo, useEffect, useRef, memo, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Smartphone , AlignLeft, 
  Loader2, X, ChevronDown, Search, Upload, Check, ExternalLink
} from 'lucide-react';
import { 
  getCountries, 
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumber,
  type Country 
} from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';

import { useTranslate } from '../../../context/LanguageContext';
import { supabase } from '../../../lib/supabase';
import { notify } from '../../../utils/toast';
import { SectionInfo } from '../AdminSettingsComponents';

import ptLabels from 'react-phone-number-input/locale/pt.json';
import enLabels from 'react-phone-number-input/locale/en.json';
import { getUserCountry } from '../../../utils/mzn';

const CLOUD_NAME = "dcffpnzxn"; 
const UPLOAD_PRESET = "logo_preset"; 
const DESC_LIMIT = 200; 
const MAX_FILE_SIZE = 1024 * 1024; // 1MB

const CountryFlag = memo(({ country }: { country: Country }) => {
  const FlagComponent = flags[country];
  if (!FlagComponent) return <div className="w-5 h-3.5 bg-slate-200 rounded-[2px]" />;
  return (
    <div className="w-5 h-3.5 overflow-hidden rounded-[2px] shadow-sm border border-black/5 shrink-0">
      <FlagComponent title={country} />
    </div>
  );
});

export function StoreTab({ store }: { store: any }) {
    const { t, language } = useTranslate();
    const queryClient = useQueryClient();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Controle para evitar loop de sincronização
    const isInitialLoad = useRef(true);
    
    const countryLabels = useMemo(() => (language === 'pt' ? ptLabels : enLabels), [language]);
  
    const [isEditingWpp, setIsEditingWpp] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    
    // 1. INICIALIZAÇÃO ÚNICA: O lazy initializer () => ... garante que só rode no nascimento do componente
    const [selectedCountry, setSelectedCountry] = useState<Country>(() => getUserCountry() as Country);
    
    const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [descValue, setDescValue] = useState(store?.description || '');
  
    useEffect(() => { setDescValue(store?.description || ''); }, [store?.description]);
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsCountrySelectorOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  
    // 2. SINCRONIZAÇÃO CONTROLADA: Só roda quando o store carrega pela primeira vez
    useEffect(() => {
      if (store?.whatsapp_number && isInitialLoad.current) {
        try {
          const parsed = parsePhoneNumber(`+${store.whatsapp_number}`);
          if (parsed && parsed.country) {
            setSelectedCountry(parsed.country as Country);
            setPhoneNumber(parsed.nationalNumber);
            isInitialLoad.current = false; // Bloqueia futuras execuções deste efeito
          }
        } catch { 
          const code = getCountryCallingCode(selectedCountry);
          const raw = store.whatsapp_number.toString();
          setPhoneNumber(raw.startsWith(code) ? raw.slice(code.length) : raw);
          isInitialLoad.current = false;
        }
      }
    }, [store, selectedCountry]);
  
    const updateField = useMutation({
      mutationFn: async ({ field, value }: { field: string; value: any }) => {
        const { error } = await supabase.from("stores").update({ [field]: value }).eq("id", store?.id);
        if (error) throw error;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["admin-full-settings"] });
        notify.success(t('save_success'));
        if (variables.field === 'whatsapp_number') setIsEditingWpp(false);
        if (variables.field === 'description') setIsEditingDesc(false);
      }
    });
  
    const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !store?.id) return;
  
      if (file.size > MAX_FILE_SIZE) {
        notify.error(t('file_too_large'));
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
  
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("folder", "logos");
  
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await response.json();
        
        if (data.secure_url) {
          const optimizedUrl = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto:best,w_800,c_limit/');
          const bustUrl = `${optimizedUrl}?t=${Date.now()}`;
          updateField.mutate({ field: 'logo_url', value: bustUrl });
        }
      } catch (err) {
        console.error("Upload error:", err);
        notify.error("Erro no upload");
      } finally {
        setIsUploading(false);
      }
    }, [store?.id, t, updateField]);
  
    const filteredCountries = useMemo(() => {
      const query = searchQuery.toLowerCase().trim();
      const all = getCountries();
      return query ? all.filter(c => (countryLabels[c as keyof typeof countryLabels] || c).toLowerCase().includes(query) || getCountryCallingCode(c).includes(query)) : all;
    }, [searchQuery, countryLabels]);
  
    const isPhoneValid = useMemo(() => {
      if (!phoneNumber) return false;
      try { 
        return isValidPhoneNumber(`+${getCountryCallingCode(selectedCountry)}${phoneNumber}`); 
      } catch { return false; }
    }, [phoneNumber, selectedCountry]);

    
  return (
    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-left-4 duration-500 pb-10">
      <SectionInfo title={t('section_presence_title')} subtitle={t('section_presence_subtitle')} />
      
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-xl divide-y divide-slate-50 overflow-visible">
        
     {/* LOGO SECTION */}
<div className="px-6 md:px-10 py-8">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
    <div className="flex items-center gap-5">
      <div className="relative group">
        <div className="h-20 md:h-24 min-w-[64px] md:min-w-[96px] max-w-[250px] md:max-w-[200px] rounded-[1.5rem] md:rounded-[2rem] bg-white border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden  shadow-inner  transition-all duration-300">
          {isUploading ? (
            <Loader2 className="animate-spin text-indigo-600" size={24} />
          ) : (
            <img 
              src={store?.logo_url || "/img/Mascote4.png"} 
              // Usamos h-full e w-auto para o aspecto ser natural
              className="h-20 md:h-24 w-auto max-w-[180px] md:max-w-[150px] object-contain object-left transition-transform duration-300 group-hover:scale-105" key={store?.logo_url || "/img/Mascote4.png"} 
              alt="Logo"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/img/Mascote4.png";
              }}
            />
          )}
        </div>
        
        {!isUploading && (
          <div 
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[1.5rem] md:rounded-[2rem] cursor-pointer" 
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="text-white" size={20} />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t('branding')}</p>
        <h4 className="text-base font-black text-slate-800 uppercase italic tracking-tighter">{t('logotype')}</h4>
        <div className="flex flex-col gap-1">
          <p className={`text-[9px] font-bold uppercase ${isUploading ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`}>
            {isUploading ? t('upload_cleaning') : t('upload_ready')}
          </p>
          <a 
            href="https://tinypng.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[9px] text-indigo-600 font-bold flex items-center gap-1 hover:underline uppercase tracking-tighter"
          >
            {t('compress_link')} <ExternalLink size={8} />
          </a>
        </div>
      </div>
    </div>
    
    <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
    <button 
      onClick={() => fileInputRef.current?.click()} 
      disabled={isUploading} 
      className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
    >
      {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14}/>} 
      {isUploading ? t('upload_cleaning') : t('change_image')}
    </button>
  </div>
</div>

        {/* WHATSAPP SECTION */}
        <div className="px-6 md:px-10 py-8 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5 flex-1">
              <div className={`p-4 rounded-2xl hidden md:block transition-all ${isEditingWpp ? 'bg-indigo-600 text-white rotate-3 shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-400'}`}>
                <Smartphone size={20} />
              </div>
              <div className="flex-1 w-full">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-2">{t('sales_whatsapp')}</p>
                {isEditingWpp ? (
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                        <button onClick={() => setIsCountrySelectorOpen(!isCountrySelectorOpen)} className="w-full flex items-center justify-between sm:justify-start gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-2"><CountryFlag country={selectedCountry} /><span className="text-sm font-black">+{getCountryCallingCode(selectedCountry)}</span></div>
                          <ChevronDown size={14} className={`text-slate-400 transition-transform ${isCountrySelectorOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isCountrySelectorOpen && (
                          <div className="absolute top-full left-0 mt-2 w-full sm:w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[9999] overflow-hidden animate-in fade-in zoom-in-95 origin-top-left">
                            <div className="p-3 border-b border-slate-50 bg-slate-50 flex items-center gap-2"><Search size={14} className="text-slate-400" /><input autoFocus type="text" placeholder={t('search_country')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent text-[11px] font-bold outline-none w-full uppercase" /></div>
                            <div className="max-h-52 overflow-y-auto p-1 custom-scrollbar">
                              {filteredCountries.map((c) => (
                                <button key={c} onClick={() => { setSelectedCountry(c); setIsCountrySelectorOpen(false); setSearchQuery(''); }} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedCountry === c ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-700'}`}>
                                  <div className="flex items-center gap-3"><CountryFlag country={c} /><span className="text-[10px] font-black uppercase truncate w-32">{countryLabels[c as keyof typeof countryLabels] || c}</span></div>
                                  <span className="text-[10px] font-bold opacity-40">+{getCountryCallingCode(c)}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <input autoFocus type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} className={`w-full sm:w-48 bg-transparent text-xl font-black italic tracking-tighter outline-none border-b-2 py-1 transition-colors ${!isPhoneValid && phoneNumber ? 'border-red-400' : 'border-indigo-600'}`} />
                    </div>
                    {!isPhoneValid && phoneNumber && (
                      <p className="text-[10px] font-bold text-red-500 uppercase">{t('invalid_phone')}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3"><CountryFlag country={selectedCountry} /><p className="font-black text-slate-800 text-lg md:text-2xl italic tracking-tighter">{store?.whatsapp_number ? `+${store.whatsapp_number}` : t('not_defined')}</p></div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              {isEditingWpp ? (
                <div className="flex items-center gap-2 w-full">
                  <button onClick={() => setIsEditingWpp(false)} className="flex-1 p-3 text-slate-400 hover:text-red-500 transition-colors"><X size={20} className="mx-auto" /></button>
                  <button disabled={!isPhoneValid || updateField.isPending} onClick={() => updateField.mutate({ field: 'whatsapp_number', value: `${getCountryCallingCode(selectedCountry)}${phoneNumber}` })} className="flex-[3] bg-indigo-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50">{updateField.isPending ? <Loader2 size={12} className="animate-spin mx-auto" /> : t('save')}</button>
                </div>
              ) : <button onClick={() => setIsEditingWpp(true)} className="w-full md:w-auto bg-slate-100 text-slate-600 px-8 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all">{t('edit')}</button>}
            </div>
          </div>
        </div>

        {/* DESCRIPTION FIELD */}
        <div className="px-6 md:px-10 py-8 bg-slate-50/30 rounded-b-[2rem] md:rounded-b-[3rem]">
          <div className="flex flex-col md:flex-row gap-6">
            <div className={`p-4 rounded-2xl hidden md:block self-start transition-all ${isEditingDesc ? 'bg-indigo-600 text-white rotate-3 shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}><AlignLeft size={20} /></div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t('short_description')}</p>
                {isEditingDesc && <span className={`text-[10px] font-black ${descValue.length >= DESC_LIMIT ? 'text-red-500' : 'text-indigo-600'}`}>{descValue.length}/{DESC_LIMIT}</span>}
              </div>
              {isEditingDesc ? (
                <div className="space-y-4">
                  <textarea autoFocus value={descValue} onChange={(e) => setDescValue(e.target.value.slice(0, DESC_LIMIT))} rows={3} className="w-full bg-white border-2 border-indigo-100 rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none focus:border-indigo-600 transition-all resize-none shadow-inner" placeholder={t('description_textarea_placeholder')} />
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => { setIsEditingDesc(false); setDescValue(store?.description || ''); }} className="p-3 text-slate-400 hover:text-red-500 transition-colors"><X size={20} /></button>
                    <button onClick={() => updateField.mutate({ field: 'description', value: descValue })} disabled={updateField.isPending} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg active:scale-95">{updateField.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />} {t('save')}</button>
                  </div>
                </div>
              ) : (
                <div onClick={() => setIsEditingDesc(true)} className="group cursor-pointer p-4 bg-white/50 border border-dashed border-slate-200 rounded-2xl hover:border-indigo-300 hover:bg-white transition-all">
                  <p className={`text-sm italic tracking-tight ${store?.description ? 'text-slate-600 font-bold' : 'text-slate-300 font-medium'}`}>{store?.description || t('description_placeholder')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}