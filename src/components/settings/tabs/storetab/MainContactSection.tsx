import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ChevronDown, Search, Phone, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumber,
} from 'react-phone-number-input';
import type { Country } from 'react-phone-number-input';
import ptLabels from 'react-phone-number-input/locale/pt.json';
import enLabels from 'react-phone-number-input/locale/en.json';
import { CountryFlag } from './CountryFlag';
import { getUserCountry } from '../../../../utils/mzn';

interface MainContactSectionProps {
  store: any;
  t: any;
  language: string;
  updateFieldMutation: any;
}

// 💡 Função utilitária de remoção de acentos otimizada para performance
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function MainContactSection({ store, t, language, updateFieldMutation }: MainContactSectionProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const countryLabels = useMemo(() => (language === 'pt' ? ptLabels : enLabels), [language]);

  const [isEditingMain, setIsEditingMain] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    const detected = getUserCountry();
    return (detected && detected.length === 2 ? detected : 'MZ') as Country;
  });

  const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);

  // Lista estática base obtida uma única vez para evitar chamadas de função repetidas
  const allCountriesList = useMemo(() => getCountries(), []);

  // 💡 Filtro otimizado: limpa a query de busca uma única vez antes do loop
  const filteredCountries = useMemo(() => {
    const query = removeAccents(searchQuery.toLowerCase().trim());
    if (!query) return allCountriesList;
    
    return allCountriesList.filter((c) => {
      const labelRaw = String(countryLabels[c as keyof typeof countryLabels] || c);
      const labelClean = removeAccents(labelRaw.toLowerCase());
      const codeClean = getCountryCallingCode(c);
      const isoClean = c.toLowerCase();
      
      return labelClean.includes(query) || codeClean.includes(query) || isoClean.includes(query);
    });
  }, [searchQuery, countryLabels, allCountriesList]);

  const isPhoneValid = useMemo(() => {
    if (!phoneNumber) return false;
    try {
      return isValidPhoneNumber(`+${getCountryCallingCode(selectedCountry)}${phoneNumber}`);
    } catch {
      return false;
    }
  }, [phoneNumber, selectedCountry]);

  const feedbackMessage = useMemo(() => {
    if (!phoneNumber) {
      return language === 'pt' 
        ? 'Insira o número sem o código do país à frente.' 
        : 'Enter the number without the country code upfront.';
    }
    if (!isPhoneValid && hasInteracted) {
      return language === 'pt'
        ? 'O número introduzido parece incorreto para o país selecionado.'
        : 'The number entered appears incorrect for the selected country.';
    }
    if (isPhoneValid) {
      return language === 'pt'
        ? 'Número válido e pronto para ser guardado!'
        : 'Valid number and ready to be saved!';
    }
    return '';
  }, [phoneNumber, isPhoneValid, hasInteracted, language]);

  useEffect(() => {
    if (store?.whatsapp_number) {
      const rawNumber = String(store.whatsapp_number).replace(/\D/g, '');
      try {
        const parsed = parsePhoneNumber(`+${rawNumber}`);
        if (parsed?.country) {
          setSelectedCountry(parsed.country as Country);
          setPhoneNumber(parsed.nationalNumber);
          return;
        }
      } catch { /* fallback */ }
      
      const currentCountryFallback = getUserCountry() || 'MZ';
      const currentCode = getCountryCallingCode(currentCountryFallback as Country);
      setPhoneNumber(rawNumber.startsWith(currentCode) ? rawNumber.slice(currentCode.length) : rawNumber);
      setSelectedCountry(currentCountryFallback as Country);
    } else {
      setPhoneNumber('');
      const detected = getUserCountry();
      if (detected && detected.length === 2) {
        setSelectedCountry(detected as Country);
      }
    }
    setHasInteracted(false);
  }, [store?.whatsapp_number]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountrySelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveMain = useCallback(() => {
    if (!isPhoneValid) return;
    updateFieldMutation.mutate({
      field: 'whatsapp_number',
      value: `${getCountryCallingCode(selectedCountry)}${phoneNumber}`,
    });
    setIsEditingMain(false);
  }, [isPhoneValid, selectedCountry, phoneNumber, updateFieldMutation]);

  const toggleSelector = useCallback(() => {
    setIsCountrySelectorOpen((prev) => !prev);
  }, []);

  const selectCountryAction = useCallback((country: Country) => {
    setSelectedCountry(country);
    setIsCountrySelectorOpen(false);
    setSearchQuery('');
  }, []);

  return (
    <div className="w-full flex flex-col justify-start space-y-3 h-full select-none">
      <div
        onClick={() => setIsEditingMain(!isEditingMain)}
        className={`group flex w-full items-center justify-between rounded-2xl border p-5 text-left transition-all cursor-pointer min-h-[82px] ${
          store?.whatsapp_number 
            ? 'border-slate-100 bg-slate-50/40 hover:border-indigo-100 hover:bg-indigo-50/20' 
            : 'border-amber-200 bg-amber-50/20 hover:border-amber-300 hover:bg-amber-50/40'
        }`}
      >
        <div className="min-w-0 flex-1 pr-3">
          <div className="mb-1.5 flex items-center gap-2 flex-wrap">
            {store?.whatsapp_number ? (
              <Phone size={14} className="text-indigo-600 shrink-0" />
            ) : (
              <AlertCircle size={14} className="text-amber-600 shrink-0 animate-bounce" />
            )}
            <span className={`text-[10px] font-black uppercase tracking-widest ${store?.whatsapp_number ? 'text-slate-400' : 'text-amber-800'}`}>
              {t('store_phone_required_label') || 'Contacto WhatsApp'}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest shrink-0 ${store?.whatsapp_number ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-600 text-white'}`}>
              {store?.whatsapp_number ? (language === 'pt' ? 'Ativo' : 'Active') : (language === 'pt' ? 'Em Falta!' : 'Missing!')}
            </span>
          </div>

          {store?.whatsapp_number ? (
            <div className="flex items-center gap-2 mt-1">
              <CountryFlag country={selectedCountry} />
              <p className="truncate text-lg font-black italic tracking-tighter text-slate-800">
                +{store.whatsapp_number}
              </p>
            </div>
          ) : (
            <div className="mt-1">
              <p className="text-xs font-bold text-amber-800">
                {language === 'pt' ? 'Nenhum contacto associado' : 'No contact connected'}
              </p>
            </div>
          )}
        </div>
        <div className="shrink-0 rounded-xl bg-white p-2.5 shadow-sm border border-slate-100 group-hover:border-indigo-200 group-hover:text-indigo-600 text-slate-400 transition-colors">
          <ChevronDown size={14} className={`transition-transform duration-200 ${isEditingMain ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isEditingMain && (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/30 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-auto" ref={dropdownRef}>
              {/* 💡 text-base (16px) previne zoom nativo em iOS/Android */}
              <button
                type="button"
                onClick={toggleSelector}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 sm:w-auto min-w-[110px] text-base font-black sm:text-xs"
              >
                <div className="flex items-center gap-2">
                  <CountryFlag country={selectedCountry} />
                  <span>+{getCountryCallingCode(selectedCountry)}</span>
                </div>
                <ChevronDown size={12} className="text-slate-400" />
              </button>

              {isCountrySelectorOpen && (
                <div className="absolute left-0 top-full z-[999] mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:w-64">
                  <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 p-2">
                    <Search size={12} className="text-slate-400 shrink-0" />
                    {/* 💡 text-base (16px) impede zoom no input de busca */}
                    <input
                      autoFocus
                      type="text"
                      placeholder={t('search_country') || 'Procurar...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent text-base font-black uppercase outline-none text-slate-700 sm:text-[10px]"
                    />
                  </div>
                  <div className="custom-scrollbar max-h-44 overflow-y-auto p-1 overscroll-contain">
                    {filteredCountries.map((country) => (
                      <button
                        key={country}
                        type="button"
                        onClick={() => selectCountryAction(country)}
                        className={`flex w-full items-center justify-between rounded-lg p-2 transition-all text-base sm:text-xs ${selectedCountry === country ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <CountryFlag country={country} />
                          <span className="truncate text-base font-black uppercase sm:text-[10px]">
                            {countryLabels[country as keyof typeof countryLabels] || country}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-400 sm:text-[9px]">+{getCountryCallingCode(country)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 💡 text-base (16px) impede zoom ao digitar o número de telefone */}
            <input
              type="text"
              inputMode="numeric"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value.replace(/\D/g, ''));
                setHasInteracted(true);
              }}
              placeholder={t('phone_number') || 'Número'}
              className={`w-full flex-1 rounded-xl border bg-white px-3 py-2.5 text-base font-black italic tracking-tighter outline-none transition-colors ${
                hasInteracted && !isPhoneValid && phoneNumber ? 'border-red-300 focus:border-red-400 bg-red-50/10' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
          </div>

          {feedbackMessage && (
            <div className={`flex items-start gap-1.5 text-[10px] font-semibold ${
              hasInteracted && !isPhoneValid && phoneNumber ? 'text-red-600' : isPhoneValid ? 'text-emerald-600' : 'text-slate-500'
            }`}>
              {hasInteracted && !isPhoneValid && phoneNumber ? (
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
              ) : isPhoneValid ? (
                <CheckCircle2 size={12} className="shrink-0 mt-0.5" />
              ) : null}
              <span>{feedbackMessage}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditingMain(false)}
              className="rounded-lg bg-white border border-slate-200 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50"
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              disabled={!isPhoneValid || updateFieldMutation.isPending}
              onClick={handleSaveMain}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white shadow-sm hover:bg-indigo-700 disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              {updateFieldMutation.isPending ? <Loader2 size={10} className="animate-spin" /> : (t('save') || 'Guardar')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}