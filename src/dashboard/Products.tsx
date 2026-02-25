import { useState, useEffect, useMemo, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import 'react-phone-number-input/style.css';
import { 
  getCountries, 
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumber,
  type Country 
} from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';

import enLabels from 'react-phone-number-input/locale/en.json';
import ptLabels from 'react-phone-number-input/locale/pt.json';

import { 
  Plus, Loader2, LayoutGrid, Save, Search, 
  Edit, Smartphone, Package, X, 
  Tag, Power, AlertCircle 
} from 'lucide-react';

import { supabase } from '../lib/supabase';
import { useTranslate } from '../context/LanguageContext';
import { ProductDetails } from './ProdutcsDetails';
import toast from 'react-hot-toast';

// Definição de interface para evitar o erro de 'any'
interface Store {
  id: string;
  name: string;
  whatsapp_number: string | number | null;
  user_id: string;
}

const FlagComponent = memo(({ country }: { country: Country }) => {
  const Flag = flags[country as keyof typeof flags];
  return Flag ? <Flag title={country} /> : <div className="w-full h-full bg-slate-200" />;
});

const ProductImage = memo(({ src, alt }: { src: string, alt: string }) => (
  <div className="w-14 h-14 md:w-12 md:h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 shadow-sm">
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-full object-cover" 
      loading="lazy" 
      onError={(e) => (e.currentTarget.src = 'https://antoniogaspar.pt/wp-content/uploads/2023/06/ag-blog-featured-img.svg')}
    />
  </div>
));

export function ProductsList() {
  const { t, language } = useTranslate();
  const queryClient = useQueryClient();
  const countryLabels = language === 'pt' ? ptLabels : enLabels;
  
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  const { data: store, isLoading: isLoadingStore } = useQuery<Store>({
    queryKey: ['admin-store'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      return data as Store;
    },
    staleTime: 1000 * 60 * 5, 
  });

  useEffect(() => {
    if (store && phoneNumber === null) {
      const numStr = (store.whatsapp_number || '').toString();
      const raw = numStr.startsWith('+') ? numStr : `+${numStr}`;
      const savedCountry = localStorage.getItem('@app:countryCode') as Country;

      try {
        const parsed = parsePhoneNumber(raw);
        if (parsed?.country) {
          setSelectedCountry(savedCountry || parsed.country);
          setPhoneNumber(parsed.nationalNumber);
        } else {
          setSelectedCountry(savedCountry || 'MZ');
          setPhoneNumber(numStr.replace(/\D/g, ''));
        }
      } catch {
        setSelectedCountry(savedCountry || 'MZ');
        setPhoneNumber(numStr.replace(/\D/g, ''));
      }
    }
  }, [store, phoneNumber]);

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    localStorage.setItem('@app:countryCode', country); 
  };

  const saveWppMutation = useMutation({
    mutationFn: async (fullNumber: string) => {
      const { error } = await supabase
        .from('stores')
        .update({ whatsapp_number: fullNumber })
        .eq('id', store?.id);
      if (error) throw error;
      return fullNumber;
    },
    onMutate: async (fullNumber) => {
      await queryClient.cancelQueries({ queryKey: ['admin-store'] });
      const previousStore = queryClient.getQueryData<Store>(['admin-store']);
      
      queryClient.setQueryData<Store>(['admin-store'], (old) => old ? ({
        ...old,
        whatsapp_number: fullNumber,
      }) : undefined);

      return { previousStore };
    },
    onError: (_err, _newNumber, context) => {
      if (context?.previousStore) {
        queryClient.setQueryData(['admin-store'], context.previousStore);
      }
      toast.error('Erro ao salvar número.');
    },
    onSuccess: () => toast.success(t('whatsapp_success')),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin-store'] })
  });

  const handleSaveWpp = () => {
    if (!selectedCountry || !phoneNumber) return;
    const ddi = getCountryCallingCode(selectedCountry);
    const fullNumber = `${ddi}${phoneNumber}`.replace(/\D/g, '');
    saveWppMutation.mutate(fullNumber);
  };

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', store?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', store?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!store?.id,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: boolean }) => {
      const { error } = await supabase.from('products').update({ is_active: !status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const isPhoneValid = useMemo(() => {
    if (!phoneNumber || !selectedCountry) return true;
    try {
      const ddi = getCountryCallingCode(selectedCountry);
      return isValidPhoneNumber(`+${ddi}${phoneNumber}`);
    } catch { return false; }
  }, [phoneNumber, selectedCountry]);

  const hasWppChanges = useMemo(() => {
    if (phoneNumber === null || !store || !selectedCountry) return false;
    const ddi = getCountryCallingCode(selectedCountry);
    const currentFull = `${ddi}${phoneNumber}`.replace(/\D/g, '');
    const savedFull = store.whatsapp_number?.toString().replace(/\D/g, '') || '';
    return currentFull !== savedFull && phoneNumber.length > 5;
  }, [phoneNumber, selectedCountry, store]); 

  // Busca Inteligente: Filtra por nome, preço ou categoria
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const term = searchTerm.toLowerCase().trim();
    if (!term) return products;

    return products.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.category?.toLowerCase().includes(term) ||
      p.price.toString().includes(term)
    );
  }, [products, searchTerm]);

  if (isLoadingStore || phoneNumber === null) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-600 font-sans antialiased pb-20">
      
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100] h-16 flex items-center px-4 lg:px-10">
        <div className="max-w-[1600px] w-full mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg">
              <Package size={18} />
            </div>
            <div>
              <h1 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tight leading-none">{t('inventory_title')}</h1>
              <p className="text-[9px] md:text-[10px] text-blue-600 font-bold uppercase tracking-widest">{store?.name}</p>
            </div>
          </div>
          <button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-black uppercase transition-all shadow-lg active:scale-95">
            <Plus size={16} strokeWidth={3} /> 
            <span className="hidden sm:inline">{t('btn_new_product')}</span>
          </button>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-4 lg:p-10 space-y-8">
        
        {/* WHATSAPP WIDGET */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row overflow-hidden">
            <div className="p-6 md:w-1/3 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center">
               <div className="flex items-center gap-2 mb-2">
                 <Smartphone size={16} className={`${!isPhoneValid ? 'text-red-500' : 'text-blue-600'}`} />
                 <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{t('wpp_section_title')}</h3>
               </div>
               <p className="text-[10px] text-slate-400 font-medium leading-tight">{t('wpp_section_desc')}</p>
            </div>
            
            <div className="p-4 md:p-6 flex-1 flex flex-col justify-center">
              <div className="flex flex-col w-full">
                <div className={`relative flex items-center bg-white border-2 rounded-xl transition-all ${
                  !isPhoneValid ? 'border-red-200 ring-4 ring-red-50' : 
                  hasWppChanges ? 'border-blue-400 ring-4 ring-blue-50' : 'border-slate-100'
                }`}>
                  <div className="flex items-center gap-2 px-4 border-r border-slate-100 relative py-3 group">
                    <div className="w-6 h-4 overflow-hidden rounded-sm shadow-sm bg-slate-200">
                      <FlagComponent country={selectedCountry!} />
                    </div>
                    <span className="text-xs font-black text-slate-900">+{getCountryCallingCode(selectedCountry!)}</span>
                    <select 
                      value={selectedCountry!} 
                      onChange={(e) => handleCountryChange(e.target.value as Country)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    >
                      {getCountries().map(c => <option key={c} value={c}>{countryLabels[c] || c}</option>)}
                    </select>
                  </div>
                  <input 
                    type="text" 
                    value={phoneNumber || ''} 
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="bg-transparent px-4 py-3 text-sm font-bold outline-none flex-1 text-slate-900 w-full"
                    placeholder={t('placeholder_whatsapp')}
                  />
                  {hasWppChanges && isPhoneValid && (
                    <button 
                      onClick={handleSaveWpp}
                      className="absolute right-2 p-2 bg-slate-900 text-white rounded-lg hover:bg-blue-600 transition-all shadow-md active:scale-90"
                      disabled={saveWppMutation.isPending}
                    >
                      {saveWppMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
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
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('stat_total')}</span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
              {isLoadingProducts ? '...' : (filteredProducts.length)}
            </h2>
            <LayoutGrid className="absolute -right-4 -bottom-4 text-slate-100" size={100} />
          </div>
        </div>

        {/* LISTAGEM DE PRODUTOS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 md:p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder={t('placeholder_search')}

                className="w-full bg-slate-50/50 border border-slate-200 pl-10 pr-4 py-3 rounded-xl text-xs font-bold outline-none focus:bg-white transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="p-2 md:p-0">
            <div className="flex flex-col md:divide-y md:divide-slate-100 gap-2 md:gap-0">
              <div className="hidden md:flex bg-slate-50/50 text-slate-400 text-[9px] uppercase font-black tracking-widest border-b border-slate-100 px-6 py-4">
                <div className="flex-[2]">{t('product')}</div>
                <div className="flex-1">{t('price')}</div>
                <div className="flex-1 text-center">{t('status')}</div>
                <div className="flex-1 text-right">{t('actions')}</div>
              </div>

              {filteredProducts.map((p) => (
                <div 
                  key={p.id} 
                  style={{ contentVisibility: 'auto', containIntrinsicSize: '80px' }}
                  className="flex flex-col md:flex-row md:items-center bg-white border border-slate-100 md:border-none rounded-2xl md:rounded-none p-4 md:px-6 md:py-4 hover:bg-slate-50/50 transition-colors gap-4 md:gap-0 shadow-sm md:shadow-none"
                >
                  <div className="flex-[2] flex items-center gap-4">
                    <ProductImage src={p.main_image} alt={p.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-sm font-bold text-slate-900 truncate">{p.name}</p>
                      <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase mt-1">
                        <Tag size={10} className="text-blue-400" /> {p.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:contents pt-3 border-t border-slate-100 md:border-none md:pt-0">
                    <div className="flex-1">
                      <span className="text-sm md:text-sm font-black text-slate-900 flex items-baseline gap-1">
                        <span className="text-[10px] opacity-50 font-bold">{p.currency}</span>
                        {p.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex-1 flex justify-center md:justify-center">
                      <button 
                        onClick={() => toggleMutation.mutate({ id: p.id, status: p.is_active })}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 md:py-1.5 w-full md:w-auto rounded-xl md:rounded-full text-[10px] font-black uppercase tracking-tight transition-all ${
                          p.is_active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <Power size={12} /> {p.is_active ? t('status_active') : t('status_paused')}
                      </button>
                    </div>

                    <div className="flex-1 flex justify-end">
                      <Link 
                        to={`/admin/produtos/${p.id}`} 
                        className="inline-flex items-center justify-center gap-2 p-3 md:px-3 md:py-2 bg-blue-50 text-blue-600 rounded-xl md:rounded-lg hover:bg-blue-600 hover:text-white transition-all text-[10px] font-black uppercase"
                      >
                        <Edit className="w-4 h-4 md:w-3.5 md:h-3.5" /> <span className="hidden md:inline">{t('view_product')}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredProducts.length === 0 && (
                <div className="p-10 text-center text-slate-400 text-sm font-bold">
                  Nenhum produto encontrado.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL FULL SCREEN */}
      {isAdding && (
        <div className="fixed inset-0 bg-white z-[150] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 h-16 flex items-center justify-between z-10">
             <div className="flex items-center gap-2">
                <Plus size={16} className="text-blue-600" strokeWidth={3} />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Novo Produto</span>
             </div>
             <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} className="text-slate-400" />
             </button>
          </div>
          <ProductDetails isCreating={true} onClose={() => setIsAdding(false)} />
        </div>
      )}
    </div>
  );
}