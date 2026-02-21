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
  Edit, Smartphone, Package, X, 
  AlertCircle, Tag,
  Power
} from 'lucide-react';

import { useAdminStore } from '../hooks/useAdminStore';
import { supabase } from '../lib/supabase';
import { useTranslate } from '../context/LanguageContext';
import { ProductDetails } from './ProdutcsDetails';
import toast from 'react-hot-toast';

// Sub-componente memoizado para evitar re-renders pesados de imagens
const ProductImage = memo(({ src, alt }: { src: string, alt: string }) => (
  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 shadow-sm">
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-full object-cover" 
      loading="lazy" 
      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
    />
  </div>
));

export function ProductsList() {
  const { t, language } = useTranslate();
  const { data: store } = useAdminStore();
  const queryClient = useQueryClient();
  
  const countryLabels = language === 'pt' ? ptLabels : enLabels;
  
  // Estados de UI
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<any>('MZ');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSavingWpp, setIsSavingWpp] = useState(false);

  const flagData = flags[selectedCountry as keyof typeof flags];
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

  // Validação de Telefone em Tempo Real
  const isPhoneValid = useMemo(() => {
    if (!phoneNumber) return true;
    try {
      const ddi = getCountryCallingCode(selectedCountry);
      return isValidPhoneNumber(`+${ddi}${phoneNumber}`);
    } catch {
      return false;
    }
  }, [phoneNumber, selectedCountry]);

  // Verificar se houve mudança para mostrar botão salvar
  const hasWppChanges = useMemo(() => {
    const ddi = getCountryCallingCode(selectedCountry);
    const currentFull = `${ddi}${phoneNumber}`.replace(/\D/g, '');
    const savedFull = (store?.whatsapp_number || '').replace(/\D/g, '');
    return currentFull !== savedFull && phoneNumber.length > 5;
  }, [phoneNumber, selectedCountry, store]);


  const saveWppMutation = useMutation({
    mutationFn: async () => {
      setIsSavingWpp(true);
      const ddi = getCountryCallingCode(selectedCountry);
      const fullNumber = `${ddi}${phoneNumber}`.replace(/\D/g, '');
      
      const { error } = await supabase
        .from('stores')
        .update({ whatsapp_number: fullNumber })
        .eq('id', store?.id);
        
      if (error) throw error;
    },
 onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['admin-store'] });
  toast.success(t('whatsapp_success'));
  setIsSavingWpp(false);
},
onError: (error: Error) => {
  // Agora o TypeScript sabe que 'error' tem a propriedade 'message'
  toast.error(`${t('save_error')}: ${error.message}`);
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

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !status })
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t('product_status_success'));
    },
    onError: () => {
      toast.error(t('product_status_error'));
    }
  });

  const filteredProducts = products?.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-blue-600" size={32} />
      <span className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Carregando Inventário...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-600 font-sans antialiased pb-20">
      
      {/* NAVBAR SUPERIOR FIXA */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100] h-16 flex items-center px-4 lg:px-10">
        <div className="max-w-[1600px] w-full mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg shadow-slate-200">
              <Package size={18} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">{t('inventory_title')}</h1>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{store?.name}</p>
            </div>
          </div>

          <button 
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> 
            <span className="hidden sm:inline">{t('btn_new_product')}</span>
          </button>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-4 lg:p-10 space-y-8">
        
        {/* WIDGETS DE GESTÃO RÁPIDA */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* GESTÃO DE WHATSAPP COM VALIDAÇÃO */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row overflow-hidden">
            <div className="p-6 md:w-1/3 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center">
               <div className="flex items-center gap-2 mb-2">
                 <Smartphone size={16} className={`${!isPhoneValid && phoneNumber ? 'text-red-500' : 'text-blue-600'}`} />
                 <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t('wpp_section_title')}</h3>
               </div>
               <p className="text-[10px] text-slate-400 font-medium leading-tight">{t('wpp_section_desc')}</p>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-center">
              <div className={`relative flex items-center bg-white border-2 rounded-xl transition-all ${
                !isPhoneValid && phoneNumber ? 'border-red-200 ring-4 ring-red-50' : 
                hasWppChanges ? 'border-blue-400 ring-4 ring-blue-50' : 'border-slate-100'
              }`}>
                <div className="flex items-center gap-2 px-4 border-r border-slate-100 relative py-3 group">
                <div className="w-5 h-3.5 rounded-sm overflow-hidden shadow-sm group-hover:scale-110 transition-transform bg-slate-100">
  {flagData ? (
    <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: flagData.toString() }} /> 
  ) : (
    <div className="w-full h-full bg-slate-200" />
  )}
</div>
                  <span className="text-xs font-black text-slate-900">+{getCountryCallingCode(selectedCountry)}</span>
                  <select 
                    value={selectedCountry} 
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  >
                    {getCountries().map(c => <option key={c} value={c}>{countryLabels[c]}</option>)}
                  </select>
                </div>
                <input 
                  type="text" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="bg-transparent px-4 py-3 text-sm font-bold outline-none flex-1 text-slate-900"
                  placeholder={t('placeholder_whatsapp')}
                />
                {hasWppChanges && isPhoneValid && (
                  <button 
                    onClick={() => saveWppMutation.mutate()}
                    className="absolute right-2 p-2 bg-slate-900 text-white rounded-lg hover:bg-blue-600 transition-all shadow-md active:scale-90"
                  >
                    {isSavingWpp ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  </button>
                )}
              </div>
              {!isPhoneValid && phoneNumber && (
                <div className="mt-2 flex items-center gap-1 text-red-500 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle size={12} />
                  <span className="text-[10px] font-black uppercase tracking-tight">{t('error_invalid_phone') || 'Número Inválido'}</span>
                </div>
              )}
            </div>
          </div>

          {/* TOTAL PRODUTOS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('stat_total')}</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                <LayoutGrid size={18} />
              </div>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter relative z-10">{filteredProducts?.length || 0}</h2>
            <div className="absolute -right-4 -bottom-4 text-slate-50 opacity-10 group-hover:text-blue-50 transition-colors">
               <Package size={100} />
            </div>
          </div>
        </div>

        {/* TABELA DE PRODUTOS PROFISSIONAL */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder={t('search_placeholder')}
                className="w-full bg-slate-50/50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-blue-300 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[9px] uppercase font-black tracking-[0.15em] border-b border-slate-100">
                  <th className="px-6 py-4">{t('product')}</th>
                  <th className="px-6 py-4">{t('price')}</th>
                  <th className="px-6 py-4 text-center">{t('status')}</th>
                  <th className="px-6 py-4 text-right">{t('actions')}</th>
                  <th className="px-6 py-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts?.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <ProductImage src={p.main_image} alt={p.name} />
                        <div>
                          <p className="text-sm font-bold text-slate-900 line-clamp-1">{p.name}</p>
                          <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase">
                            <Tag size={10} className="text-blue-400" /> {p.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-slate-900">
                        <span className="text-[10px] mr-1 opacity-50 font-bold">{p.currency}</span>
                        {p.price.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tight ${
                          p.is_active ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                          {p.is_active ? t('status_active') : t('status_paused')}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className='flex justify-center gap-2'>

                    <button 
                    onClick={() => toggleMutation.mutate({ id: p.id, status: p.is_active })}
                    className={`p-2 rounded-lg transition-colors ${p.is_active ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}
                    title={p.is_active ? "Desativar" : "Ativar"}
                  >
                    <Power size={18} />
                  </button>
                  </div>

                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* BOTÃO VER PRODUTO */}
                        <Link 
                          to={`/admin/produtos/${p.id}`} >
                        <button 

                          title={t('view_product')}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-[10px] font-black uppercase"
                        >
                          <Edit size={14} />
                          <span className="hidden md:inline">{t('view_product') || 'Ver'}</span>
                        </button>
                        </Link>

                      </div>
                    </td>
                   
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredProducts?.length === 0 && (
            <div className="py-20 text-center space-y-3">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                 <Search size={32} />
               </div>
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('no_products_found')}</p>
            </div>
          )}
        </div>
      </main>

      {/* MODAL DE CRIAÇÃO (Full Screen) */}
      {isAdding && (
        <div className="fixed inset-0 bg-white z-[150] overflow-y-auto animate-in slide-in-from-bottom duration-300">
          <div className="sticky top-0 bg-white border-b border-slate-100 px-6 h-16 flex items-center justify-between z-10">
             <div className="flex items-center gap-2">
                <Plus size={16} className="text-blue-600" strokeWidth={3} />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">{t('btn_new_product')}</span>
             </div>
             <button 
               onClick={() => setIsAdding(false)} 
               className="h-10 w-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-all group"
             >
                <X size={20} className="text-slate-400 group-hover:text-slate-900" />
             </button>
          </div>
          <div className="max-w-5xl mx-auto">
             <ProductDetails isCreating={true} onClose={() => setIsAdding(false)} />
          </div>
        </div>
      )}

    </div>
  );
}