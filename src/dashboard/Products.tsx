import { useState, useEffect, useMemo, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import 'react-phone-number-input/style.css';
import { 
  getCountries, 
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumber 
} from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';

import enLabels from 'react-phone-number-input/locale/en.json';
import ptLabels from 'react-phone-number-input/locale/pt.json';

import { 
  Plus, Loader2, LayoutGrid, Save, Search, 
  Edit, AlertCircle, CheckCircle2, Smartphone, 
  Package, Filter, ArrowUpRight, X
} from 'lucide-react';

import { useAdminStore } from '../hooks/useAdminStore';
import { supabase } from '../lib/supabase';
import { useTranslate } from '../context/LanguageContext';
import { ProductDetails } from './ProdutcsDetails';

const ProductImage = memo(({ src, alt }: { src: string, alt: string }) => (
  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
    <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
  </div>
));

export function ProductsList() {
  const { t, language } = useTranslate();
  const { data: store } = useAdminStore();
  const queryClient = useQueryClient();
  
  const countryLabels = language === 'pt' ? ptLabels : enLabels;
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<any>('MZ');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSavingWpp, setIsSavingWpp] = useState(false);

  const CountryFlag = flags[selectedCountry as keyof typeof flags];

  useEffect(() => {
    if (store?.whatsapp_number) {
      const raw = store.whatsapp_number.startsWith('+') ? store.whatsapp_number : `+${store.whatsapp_number}`;
      const parsed = parsePhoneNumber(raw);
      if (parsed) {
        setSelectedCountry(parsed.country);
        setPhoneNumber(parsed.nationalNumber);
      }
    }
  }, [store]);

  const hasChanges = useMemo(() => {
    const ddi = getCountryCallingCode(selectedCountry);
    const currentFull = `${ddi}${phoneNumber}`.replace(/\D/g, '');
    const savedFull = (store?.whatsapp_number || '').replace(/\D/g, '');
    return currentFull !== savedFull && phoneNumber.length > 5;
  }, [phoneNumber, selectedCountry, store]);

  const isPhoneValid = useMemo(() => {
    if (!phoneNumber) return false;
    const ddi = getCountryCallingCode(selectedCountry);
    return isValidPhoneNumber(`+${ddi}${phoneNumber}`);
  }, [phoneNumber, selectedCountry]);

  const saveWppMutation = useMutation({
    mutationFn: async () => {
      setIsSavingWpp(true);
      const ddi = getCountryCallingCode(selectedCountry);
      const fullNumber = `${ddi}${phoneNumber}`.replace(/\D/g, '');
      const { error } = await supabase.from('stores').update({ whatsapp_number: fullNumber }).eq('id', store?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-store'] });
      setIsSavingWpp(false);
    }
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', store?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('store_id', store?.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!store?.id
  });

  const filteredProducts = products?.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={24} /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-600 font-sans antialiased">
      
      {/* HEADER FIXO PROFISSIONAL */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100] h-16 flex items-center px-4 lg:px-10">
        <div className="max-w-[1600px] w-full mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg text-white shadow-sm">
              <Package size={18} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">{t('inventory_title')}</h1>
              <p className="text-[10px] text-blue-600 font-bold">{store?.name}</p>
            </div>
          </div>

          {/* BOTÃO CRIAR NOVO - AGORA VISÍVEL */}
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> 
            <span className="hidden sm:inline">{t('btn_new_product')}</span>
          </button>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-4 lg:p-10 space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* WHATSAPP MANAGEMENT - DESIGN OTIMIZADO */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row">
            <div className="p-6 sm:w-1/3 bg-slate-50/50 border-b sm:border-b-0 sm:border-r border-slate-100 flex flex-col justify-center">
               <div className="flex items-center gap-2 mb-1">
                 <Smartphone size={16} className="text-blue-600" />
                 <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Canal de Vendas</h3>
               </div>
               <p className="text-[10px] text-slate-400 font-medium leading-tight">Os clientes entrarão em contacto por este número.</p>
            </div>
            
            <div className="p-6 flex-1 flex items-center">
              <div className={`relative flex-1 flex items-center bg-white border-2 rounded-xl transition-all ${hasChanges ? 'border-blue-100 ring-4 ring-blue-50' : 'border-slate-100'}`}>
                {/* Seletor de País */}
                <div className="flex items-center gap-2 px-4 border-r border-slate-100 relative group py-3">
                  <div className="w-5 h-3.5 rounded-sm overflow-hidden shadow-sm"><CountryFlag /></div>
                  <span className="text-xs font-black text-slate-900">+{getCountryCallingCode(selectedCountry)}</span>
                  <select 
                    value={selectedCountry} 
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  >
                    {getCountries().map(c => <option key={c} value={c}>{countryLabels[c]}</option>)}
                  </select>
                </div>
                
                {/* Input de Número */}
                <input 
                  type="text" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="bg-transparent px-4 py-3 text-sm font-bold outline-none flex-1 text-slate-900 placeholder:text-slate-300"
                  placeholder="9xxxxxxx"
                />

                {/* BOTÃO SAVE DENTRO DO INPUT (LOCALIZAÇÃO MELHORADA) */}
                {hasChanges && (
                  <button 
                    onClick={() => saveWppMutation.mutate()}
                    disabled={!isPhoneValid || isSavingWpp}
                    className={`absolute right-2 p-2 rounded-lg transition-all ${isPhoneValid ? 'bg-slate-900 text-white hover:bg-blue-600' : 'bg-slate-100 text-slate-300'}`}
                    title="Salvar alterações"
                  >
                    {isSavingWpp ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* TOTAL STATS COMPACTO */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('stat_total')}</p>
              <h2 className="text-3xl font-black text-slate-900 leading-none">{filteredProducts?.length || 0}</h2>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <LayoutGrid size={24} />
            </div>
          </div>
        </div>

        {/* ÁREA DE BUSCA E TABELA */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder={t('search_placeholder')}
                className="w-full bg-slate-50/50 border border-slate-100 pl-10 pr-4 py-2.5 rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* TABLE DESKTOP */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-[9px] uppercase font-black tracking-widest border-b border-slate-50">
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Preço</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts?.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <ProductImage src={p.main_image} alt={p.name} />
                        <span className="text-sm font-bold text-slate-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase">{p.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                          p.is_active ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${p.is_active ? 'bg-green-600' : 'bg-slate-400'}`}></span>
                          {p.is_active ? t('status_active') : t('status_paused')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-slate-900">{p.currency} {p.price.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/admin/produtos/${p.id}`} className="p-2 inline-flex text-slate-400 hover:text-blue-600 transition-colors">
                         <ArrowUpRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CARDS MOBILE */}
          <div className="md:hidden divide-y divide-slate-50">
            {filteredProducts?.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between active:bg-slate-50">
                <div className="flex items-center gap-4">
                  <ProductImage src={p.main_image} alt={p.name} />
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight mb-0.5">{p.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{p.currency} {p.price.toLocaleString()}</span>
                  </div>
                </div>
                <Link to={`/admin/produtos/${p.id}`} className="p-3 bg-slate-50 rounded-xl text-slate-400">
                  <Edit size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* MODAL DE CRIAÇÃO (Full Screen / Mobile Friendly) */}
      {isAdding && (
        <div className="fixed inset-0 bg-white z-[150] overflow-y-auto animate-in slide-in-from-bottom duration-300">
          <div className="sticky top-0 bg-white border-b border-slate-100 px-6 h-16 flex items-center justify-between z-10">
             <span className="text-xs font-black uppercase tracking-widest text-slate-400">Novo Produto</span>
             <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} className="text-slate-900" />
             </button>
          </div>
          <ProductDetails isCreating={true} onClose={() => setIsAdding(false)} />
        </div>
      )}

    </div>
  );
}