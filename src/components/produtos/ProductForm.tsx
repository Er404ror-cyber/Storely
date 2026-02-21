import { memo, useMemo, useCallback } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import Select from 'react-select';
import type { StylesConfig } from 'react-select'; 
import currencyCodes from 'currency-codes';
import { 
  X, UploadCloud, AlignLeft, ImagePlus, Star, Edit3, ExternalLink, 
  Coins
} from 'lucide-react';

// --- TIPOS ---
// Altere a interface no ProductForm.tsx para incluir todos os campos
interface FormData {
  name: string;
  category: string;
  currency: string;
  price: string;
  unit: string;
  full_description: string;
  main_image: string; // Adicionado
  gallery: string[];  // Adicionado
}

interface ProductFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  existingCategories?: string[];
  onFileSelect: (e: ChangeEvent<HTMLInputElement>, index: number) => void;
  uploadErrors: (string | null)[];
  setUploadErrors: (errors: string[]) => void; 
  previews: string[];
  removePhoto: (index: number) => void;
  fileSizes: number[];
}

interface CurrencyOption {
  value: string;
  label: string;
}

const LIMITS = {
  name: 45,
  category: 25,
  description: 600,
  maxFileSize: 1024 * 1024, // 1MB
  maxBreaks: 4
};

const SELECT_STYLES: StylesConfig<CurrencyOption, false> = {
  control: (base) => ({
    ...base,
    borderRadius: '1.25rem',
    border: 'none',
    backgroundColor: '#f8fafc',
    padding: '8px',
    fontSize: '14px',
    fontWeight: '900',
    boxShadow: 'none',
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '13px',
    fontWeight: '600',
    backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : 'white',
    color: state.isSelected ? 'white' : '#1e293b',
  })
};

export const ProductForm = memo(({ 
  formData, setFormData, onFileSelect, 
   previews, removePhoto, fileSizes,
  existingCategories = [] 
}: ProductFormProps) => {

  const currencyOptions = useMemo(() => 
    currencyCodes.codes().map(code => ({
      value: code,
      label: `${code} - ${currencyCodes.code(code)?.currency}`
    })), []);

  const recentCats = useMemo(() => existingCategories.slice(0, 3), [existingCategories]);

  const handleDescriptionChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const breaks = (value.match(/\n/g) || []).length;
    if (breaks <= LIMITS.maxBreaks) {
      setFormData({ ...formData, full_description: value });
    }
  }, [formData, setFormData]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      const breaks = (formData.full_description.match(/\n/g) || []).length;
      if (breaks >= LIMITS.maxBreaks) e.preventDefault();
    }
  }, [formData.full_description]);

  const pending = useMemo(() => {
    const list = [];
    if (!formData.name.trim()) list.push("Nome");
    if (!formData.price || formData.price === '0') list.push("Preço");
    if (!formData.category.trim()) list.push("Categoria");
    if (!previews[0]) list.push("Capa");
    const hasSizeIssue = previews.some((p, i) => p && fileSizes[i] > LIMITS.maxFileSize);
    if (hasSizeIssue) list.push("Reduzir Fotos");
    return list;
  }, [formData, previews, fileSizes]);

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${['B', 'KB', 'MB'][i]}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8 animate-in fade-in duration-500">
      
      {/* SEÇÃO GALERIA */}
      <section className="bg-slate-50 p-6 md:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-2">
          <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <ImagePlus size={16} className="text-blue-600"/> Galeria de Fotos
          </h3>
          <div className="bg-white px-4 py-2 rounded-full border border-slate-200">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Limite: 1MB por foto</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[0, 1, 2, 3].map((i) => {
            const currentSize = fileSizes[i] || 0;
            const isTooLarge = previews[i] && currentSize > LIMITS.maxFileSize;
            const isFirst = i === 0;

            return (
              <div key={i} className="flex flex-col gap-2">
                <div className={`relative aspect-square rounded-[2.2rem] overflow-hidden border-2 transition-all duration-300 
                  ${previews[i] ? (isFirst ? 'border-blue-500 ring-4 ring-blue-50' : 'border-white shadow-sm') : 'border-dashed border-slate-200 bg-white/50'}
                  ${isTooLarge ? 'border-red-500 bg-red-50' : 'bg-white'}`}>
                  
                  {previews[i] ? (
                    <div className="w-full h-full group">
                      <img src={previews[i]} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 ">
                        <label className="p-2 bg-white rounded-xl text-blue-600 cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-xl">
                          <Edit3 size={18} />
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileSelect(e, i)} />
                        </label>
                        <button type="button" onClick={() => removePhoto(i)} className="p-2 bg-white rounded-xl text-red-500 hover:scale-110 active:scale-95 transition-all shadow-xl">
                          <X size={18} />
                        </button>
                      </div>
                      
                      {isFirst && (
                        <div className="absolute top-3 left-3 bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                          <Star size={10} fill="currentColor" /> CAPA
                        </div>
                      )}
                      
                      <div className={`absolute bottom-3 left-3 px-2 py-1 rounded-md  ${isTooLarge ? 'bg-red-600' : 'bg-black/60'}`}>
                        <p className="text-[8px] font-black text-white uppercase">{formatSize(currentSize)}</p>
                      </div>
                    </div>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-colors">
                      <UploadCloud size={24} className="text-slate-300 mb-1" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{isFirst ? 'Capa' : 'Adicionar'}</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileSelect(e, i)} />
                    </label>
                  )}
                </div>

                {/* LINK PARA COMPRIMIR */}
                {isTooLarge && (
                  <a 
                    href="https://tinypng.com" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-center gap-1.5 bg-red-100 text-red-600 py-2 rounded-xl text-[8px] font-black uppercase hover:bg-red-200 transition-colors"
                  >
                    Comprimir <ExternalLink size={10} />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FORMULÁRIO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="md:col-span-2 space-y-2">
          <div className="flex justify-between px-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome *</label>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded ${formData.name.length >= LIMITS.name ? 'bg-red-500 text-white' : 'text-slate-300'}`}>
              {formData.name.length} / {LIMITS.name}
            </span>
          </div>
          <input 
            className="w-full p-6 rounded-[1.8rem] font-bold text-xl outline-none border-2 border-transparent bg-slate-50 focus:border-blue-500 focus:bg-white transition-all shadow-inner"
            value={formData.name} 
            maxLength={LIMITS.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="O que estás a vender?"
          />
        </div>

        {/* Preço */}
        <div className="md:col-span-2">
          <div className={`bg-white border-2 p-5 rounded-[2rem] transition-all shadow-sm ${formData.price && formData.price !== '0' ? 'border-green-100' : 'border-slate-100'}`}>
            <div className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-12 flex items-center gap-2 px-1">
                <Coins size={16} className="text-blue-600" />
                <h4 className="text-slate-900 font-black text-[11px] uppercase tracking-wider">Preço de Venda *</h4>
              </div>
              <div className="col-span-5 md:col-span-4 space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-2">Moeda</label>
                <Select
                  options={currencyOptions}
                  styles={SELECT_STYLES}
                  value={currencyOptions.find(opt => opt.value === formData.currency)}
                  
                  onChange={(val) => val && setFormData({ ...formData, currency: val.value })}
                />
              </div>
              <div className="col-span-7 md:col-span-8 space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-2">Valor</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-300">{formData.currency}</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-blue-500 focus:bg-white h-14 pl-16 pr-6 rounded-2xl font-black text-xl outline-none transition-all"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value.replace(/\D/g, '') })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Categoria *</label>
          <input 
            className="w-full p-5 rounded-2xl font-bold bg-slate-50 border-2 border-transparent focus:border-blue-500 outline-none transition-all shadow-inner"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            placeholder="Ex: Mobília"
          />
          <div className="flex flex-wrap gap-2">
            {recentCats.map(cat => (
              <button key={cat} type="button" onClick={() => setFormData({ ...formData, category: cat })} className="text-[9px] font-black text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                + {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Unidade *</label>
          <select 
            className="w-full bg-slate-50 p-5 h-[62px] rounded-2xl font-bold border-2 border-transparent focus:border-blue-500 outline-none appearance-none cursor-pointer shadow-inner"
            value={formData.unit}
            onChange={e => setFormData({ ...formData, unit: e.target.value })}
          >
            <option value="un">Unidade</option>
            <option value="par">Par</option>
            <option value="kg">Quilograma</option>
            <option value="hora">Por Hora</option>
          </select>
        </div>

        <div className="md:col-span-2 space-y-3">
          <div className="flex justify-between px-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <AlignLeft size={14} className="text-blue-500"/> Descrição
            </label>
            <span className="text-[9px] font-black text-slate-300">{formData.full_description.length}/{LIMITS.description}</span>
          </div>
          <textarea
            className="w-full p-8 rounded-[2.5rem] min-h-[200px] font-medium text-slate-700 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all resize-none shadow-inner"
            value={formData.full_description}
            onChange={handleDescriptionChange}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      {/* BARRA DE PENDÊNCIAS */}
      {pending.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-fit min-w-[300px] bg-slate-900/95  px-6 py-3 rounded-full shadow-2xl flex items-center justify-between gap-6 z-50 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
              Pendente: <span className="text-slate-400 ml-1 font-bold">{pending.join(" • ")}</span>
            </p>
          </div>
          <div className="h-6 w-6 bg-white/10 rounded-full flex items-center justify-center border border-white/5">
            <span className="text-white font-black text-[10px]">{pending.length}</span>
          </div>
        </div>
      )}
    </div>
  );
});

ProductForm.displayName = 'ProductForm';