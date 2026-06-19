import { memo } from 'react';
import Select from 'react-select';
import type { StylesConfig, FilterOptionOption} from 'react-select';
import { Coins, Loader2, Save } from 'lucide-react';
import type { TranslateFn } from '../../../dashboard/Products';

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
  selectStyles: StylesConfig<CurrencyOption, false>;
  setIsCurrencyEditing: (val: boolean) => void;
  setSelectedCurrency: (val: string) => void;
  setIsDirtyCurrency: (val: boolean) => void;
  handleCurrencyChange: (val: CurrencyOption | null) => void;
  filterCurrencyOption: (option: FilterOptionOption<CurrencyOption>, rawInput: string) => boolean;
  formatCurrencyOptionLabel: (option: CurrencyOption) => React.ReactNode;
  handleSaveCurrency: () => void;
   t: TranslateFn;
}

export const CurrencySection = memo(({
  backendCurrency,
  isCurrencyEditing,
  selectedCurrencyOption,
  currencyOptions,
  hasCurrencyChanges,
  saveCurrencyPending,
  geoCurrencySuggestion,
  selectStyles,
  setIsCurrencyEditing,
  setSelectedCurrency,
  setIsDirtyCurrency,
  handleCurrencyChange,
  filterCurrencyOption,
  formatCurrencyOptionLabel,
  handleSaveCurrency,
  t,
}: CurrencySectionProps) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
            backendCurrency ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          <Coins size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
            {t('currency_section_title')}
          </p>

          {!isCurrencyEditing && backendCurrency ? (
            <>
              <div className="mt-1 flex items-center gap-2">
                <span className="shrink-0 text-sm">{selectedCurrencyOption?.flag || '🌍'}</span>
                <span className="truncate text-sm font-bold text-slate-900">
                  {selectedCurrencyOption?.label || backendCurrency}
                </span>
              </div>
              <div className="mt-1 flex min-w-0 items-center gap-2">
                <span className="inline-flex max-w-full items-center justify-center rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-700 break-words">
                  {t('currency_saved_text')}
                </span>
              </div>

              <button
                onClick={() => {
                  setSelectedCurrency(backendCurrency);
                  setIsDirtyCurrency(false);
                  setIsCurrencyEditing(true);
                }}
                className="mt-3 w-full inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-[11px] font-black uppercase tracking-[0.1em] text-slate-700 transition hover:bg-slate-50"
              >
                {t('btn_edit')}
              </button>
            </>
          ) : (
            <>
              <p className="mt-1 text-xs text-slate-500">
                {t('currency_section_help_text')}
              </p>

              {!backendCurrency && geoCurrencySuggestion?.currency ? (
                <p className="mt-1 text-[11px] text-slate-500">
                  {t('currency_suggested_prefix')}{' '}
                  <span className="font-black text-slate-900">
                    {geoCurrencySuggestion.currency.toUpperCase()}
                  </span>
                </p>
              ) : null}

              {!backendCurrency ? (
                <p className="mt-1 text-[11px] font-black text-red-600">
                  {t('currency_must_save_notice')}
                </p>
              ) : null}

              <div className="mt-3 space-y-2">
                <Select<CurrencyOption, false>
                  options={currencyOptions}
                  styles={selectStyles}
                  value={selectedCurrencyOption}
                  onChange={handleCurrencyChange}
                  filterOption={filterCurrencyOption}
                  formatOptionLabel={formatCurrencyOptionLabel}
                  placeholder={t('currency_placeholder')}
                  isSearchable
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  menuPosition="fixed"
                />

                <div className="flex gap-2">
                  {backendCurrency ? (
                    <button
                      onClick={() => {
                        setSelectedCurrency(backendCurrency);
                        setIsDirtyCurrency(false);
                        setIsCurrencyEditing(false);
                      }}
                      className="inline-flex h-10 border-slate-200 bg-white px-4 text-[11px] font-black uppercase tracking-[0.1em] text-slate-700 transition hover:bg-slate-50 flex-1 items-center justify-center rounded-xl"
                    >
                      {t('btn_cancel')}
                    </button>
                  ) : null}

                  <button
                    onClick={handleSaveCurrency}
                    disabled={!hasCurrencyChanges || saveCurrencyPending}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-[11px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-blue-600 disabled:opacity-50"
                  >
                    {saveCurrencyPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {t('save_currency')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
});

CurrencySection.displayName = 'CurrencySection';