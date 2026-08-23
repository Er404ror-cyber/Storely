import { memo, useCallback, useState, useRef, useEffect } from 'react';
import Select from 'react-select';
import type { StylesConfig, FilterOptionOption } from 'react-select';
import { Coins, Loader2, Save, Check, AlertCircle } from 'lucide-react';
import type { TranslateFn } from '../../../types/TextTypes';

interface CurrencyOption {
  value: string;
  label: string;
  search: string;
  flag: string;
  country: string;
}

interface CurrencySectionProps {
  backendCurrency: string;
  isCurrencyEditing: boolean;
  selectedCurrencyOption: CurrencyOption | null;
  currencyOptions: CurrencyOption[];
  hasCurrencyChanges: boolean;
  saveCurrencyPending: boolean;
  geoCurrencySuggestion: { currency: string } | null;
  setIsCurrencyEditing: (val: boolean) => void;
  setSelectedCurrency: (val: string) => void;
  setIsDirtyCurrency: (val: boolean) => void;
  handleCurrencyChange: (val: CurrencyOption | null) => void;
  filterCurrencyOption?: (option: FilterOptionOption<CurrencyOption>, rawInput: string) => boolean;
  handleSaveCurrency: () => void;
  t: TranslateFn;
}

const removeAccents = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Label mais compacta no dropdown
const CurrencyOptionLabel = memo(({ option }: { option: CurrencyOption }) => (
  <div className="flex items-center gap-2.5 min-w-0 py-0.5">
    <span className="text-[22px] leading-none shrink-0 drop-shadow-sm transform-gpu">{option.flag}</span>
    <div className="flex flex-col min-w-0 justify-center">
      <span className="truncate font-black text-[13px] text-slate-800 leading-tight">
        {option.label}
      </span>
      {option.country && (
        <span className="truncate font-bold text-[8px] text-slate-400 uppercase tracking-widest mt-0.5">
          {option.country}
        </span>
      )}
    </div>
  </div>
));
CurrencyOptionLabel.displayName = 'CurrencyOptionLabel';

// SELECT COMPACTO: Altura 48px e padding reduzido.
const SELECT_STYLES: StylesConfig<CurrencyOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: 48,
    borderRadius: 16,
    border: 'none',
    backgroundColor: state.isFocused ? '#ffffff' : '#f8fafc',
    boxShadow: state.isFocused 
      ? '0 0 0 3px rgba(239, 246, 255, 1), 0 8px 20px -5px rgba(0,0,0,0.05)' 
      : 'inset 0 2px 4px rgba(0,0,0,0.02)',
    cursor: 'text',
    transition: 'all 200ms ease',
  }),
  valueContainer: (base) => ({ ...base, padding: '2px 12px' }),
  // IMPORTANTE: fontSize '16px' no input evita o zoom forçado no iOS Safari!
  input: (base) => ({ ...base, margin: 0, padding: 0, color: '#334155', fontSize: '16px', fontWeight: 600 }), 
  placeholder: (base) => ({ ...base, color: '#94a3b8', fontSize: '13px', fontWeight: 600 }),
  singleValue: (base) => ({ ...base, color: '#334155', fontSize: '14px', fontWeight: 800 }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (base) => ({ 
    ...base, 
    zIndex: 9999, 
    borderRadius: 20, 
    overflow: 'hidden', 
    border: 'none', 
    boxShadow: '0 16px 32px -8px rgba(0,0,0,0.12)', 
    marginTop: 6 
  }),
  menuList: (base) => ({ ...base, padding: 6, maxHeight: 200 }),
  option: (base, state) => ({
    ...base,
    borderRadius: 12,
    backgroundColor: state.isSelected ? '#eff6ff' : state.isFocused ? '#f8fafc' : '#ffffff',
    cursor: 'pointer',
    padding: '8px 12px',
    transition: 'background-color 150ms ease',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, color: '#cbd5e1', padding: '0 12px' }),
};

export const CurrencySection = memo(({
  backendCurrency,
  isCurrencyEditing,
  selectedCurrencyOption,
  currencyOptions,
  hasCurrencyChanges,
  saveCurrencyPending,
  geoCurrencySuggestion,
  setIsCurrencyEditing,
  setSelectedCurrency,
  setIsDirtyCurrency,
  handleCurrencyChange,
  handleSaveCurrency,
  t,
}: CurrencySectionProps) => {

  const [isCooldown, setIsCooldown] = useState(false);
  const cooldownTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
    };
  }, []);

  const formatCurrencyOptionLabel = useCallback((option: CurrencyOption) => (
    <CurrencyOptionLabel option={option} />
  ), []);

  const optimizedSearchFilter = useCallback((option: FilterOptionOption<CurrencyOption>, rawInput: string) => {
    if (!rawInput) return true;
    const input = removeAccents(rawInput.toLowerCase().trim());
    const data = option.data;
    
    return (
      removeAccents(data.label.toLowerCase()).includes(input) ||
      removeAccents(data.country.toLowerCase()).includes(input) ||
      (data.search && removeAccents(data.search.toLowerCase()).includes(input)) ||
      data.value.toLowerCase().includes(input)
    );
  }, []);

  const onSafeSave = useCallback(() => {
    if (saveCurrencyPending || isCooldown || !hasCurrencyChanges) return;
    setIsCooldown(true);
    handleSaveCurrency();
    cooldownTimer.current = setTimeout(() => setIsCooldown(false), 2000);
  }, [saveCurrencyPending, isCooldown, hasCurrencyChanges, handleSaveCurrency]);

  const ambientFlag = selectedCurrencyOption?.flag || (backendCurrency && currencyOptions.find(c => c.value === backendCurrency)?.flag) || '🌍';

  return (
    <section className="relative w-full max-w-full overflow-hidden rounded-[24px] bg-white p-4 sm:p-6 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.06)]">
      
      {/* Luz ambiente colorida menor */}
      <div className="absolute -bottom-6 -right-6 z-0 pointer-events-none select-none opacity-[0.04] blur-xl transform-gpu">
        <span className="text-[120px] leading-none">{ambientFlag}</span>
      </div>

      <div className="relative z-10 w-full min-w-0">
        
        {/* CABEÇALHO COMPACTO */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-slate-50 text-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]">
            <Coins size={18} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              {t('currency_section_title')}
            </h2>
            <span className={`text-[9px] font-black uppercase tracking-[0.1em] mt-0.5 ${backendCurrency ? 'text-emerald-500' : 'text-amber-500'}`}>
  {backendCurrency 
    ? t('setup_configured', { defaultValue: 'Configurada' }) 
    : t('setup_action_needed', { defaultValue: 'Ação Necessária' })}
</span>
          </div>
        </div>

        {!isCurrencyEditing && backendCurrency ? (
          /* ESTADO SALVO COMPACTO */
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full rounded-[20px] bg-slate-50/60 p-3 sm:p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)]">
            
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="text-[38px] sm:text-[42px] leading-none drop-shadow-md shrink-0 transform-gpu">
                {selectedCurrencyOption?.flag || '🌍'}
              </div>
              
              <div className="flex flex-col justify-center min-w-0 flex-1">
                <span className="truncate text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                  {selectedCurrencyOption?.label || backendCurrency}
                </span>
                
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] text-emerald-600 shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
                    <Check size={10} strokeWidth={3} /> {t('currency_saved_text')}
                  </span>
                  {selectedCurrencyOption?.country && (
                    <span className="truncate text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      {selectedCurrencyOption.country}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Botão de Editar mais baixo (h-10) */}
            <button
              onClick={() => {
                setSelectedCurrency(backendCurrency);
                setIsDirtyCurrency(false);
                setIsCurrencyEditing(true);
              }}
              className="w-full sm:w-auto shrink-0 inline-flex h-10 items-center justify-center rounded-[12px] bg-white px-6 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_6px_16px_rgba(37,99,235,0.1)] active:scale-95"
            >
              {t('btn_edit')}
            </button>
          </div>
        ) : (
          /* ESTADO DE EDIÇÃO COMPACTO */
          <div className="flex flex-col w-full min-w-0">
            <p className="text-[11px] sm:text-[12px] text-slate-500 font-medium leading-relaxed mb-4">
              {t('currency_section_help_text')}
            </p>

            <div className="space-y-3 w-full min-w-0">
              {(!backendCurrency && geoCurrencySuggestion?.currency) && (
                <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50/80 px-3 py-2 text-[11px] text-blue-800 w-full min-w-0 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]">
                  <span className="shrink-0 drop-shadow-sm">💡 {t('currency_suggested_prefix')}</span>
                  <span className="font-black text-blue-900 tracking-wide truncate">
                    {geoCurrencySuggestion.currency.toUpperCase()}
                  </span>
                </div>
              )}

              {!backendCurrency && (
                <div className="inline-flex items-center gap-2 rounded-xl bg-rose-50/80 px-3 py-2 text-[11px] text-rose-700 w-full min-w-0">
                  <AlertCircle size={14} className="shrink-0 text-rose-500" />
                  <span className="font-black uppercase tracking-widest text-[9px] sm:text-[10px] truncate">
                    {t('currency_must_save_notice')}
                  </span>
                </div>
              )}

              <Select<CurrencyOption, false>
                options={currencyOptions}
                styles={SELECT_STYLES}
                value={selectedCurrencyOption}
                onChange={handleCurrencyChange}
                filterOption={optimizedSearchFilter}
                formatOptionLabel={formatCurrencyOptionLabel}
                placeholder={t('currency_placeholder')}
                isSearchable
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                menuPosition="fixed"
              />

              {/* Botões Lado-a-Lado mais baixos (h-11) */}
              <div className="flex flex-row gap-2.5 pt-1 w-full">
                {backendCurrency && (
                  <button
                    onClick={() => {
                      setSelectedCurrency(backendCurrency);
                      setIsDirtyCurrency(false);
                      setIsCurrencyEditing(false);
                    }}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-[14px] bg-slate-50 px-3 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 active:scale-95"
                  >
                    {t('btn_cancel')}
                  </button>
                )}

                <button
                  onClick={onSafeSave}
                  disabled={!hasCurrencyChanges || saveCurrencyPending || isCooldown}
                  className="inline-flex h-11 flex-[1.5] items-center justify-center gap-2 rounded-[14px] bg-emerald-500 px-4 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[0_6px_20px_-5px_rgba(16,185,129,0.4)] transition-all hover:bg-emerald-400 hover:shadow-[0_10px_25px_-5px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 disabled:opacity-50 disabled:shadow-none disabled:transform-none active:scale-95"
                >
                  {(saveCurrencyPending || isCooldown) ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {t('save_currency')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

CurrencySection.displayName = 'CurrencySection';