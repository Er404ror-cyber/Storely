import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft, Edit3, Loader2, Plus, Minus, 
  ArrowRight, Check, MousePointer2 
} from 'lucide-react';
import { useAdminStore } from '../hooks/useAdminStore';
import { supabase } from '../lib/supabase';
import { uploadToCloudinary } from '../utils/cloud';
import { ProductForm } from '../components/produtos/ProductForm';
import { toast } from "react-hot-toast";

// Definição do tipo para garantir consistência entre arquivos
export interface FormData {
  name: string;
  category: string;
  currency: string;
  price: string;
  unit: string;
  full_description: string;
  main_image: string;
  gallery: string[];
}
type UploadResult = {
  index: number;
  url: string;
} | null;

type SupabaseError = {
  message: string;
};


const createSlug = (t: string) => t.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');

export function ProductDetails({ isCreating = false, onClose }: { isCreating?: boolean; onClose?: () => void }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { data: store } = useAdminStore();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isEditing, setIsEditing] = useState(isCreating);
  const [isSaving, setIsSaving] = useState(false);
  const [quantidade, setQuantidade] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const [previews, setPreviews] = useState<string[]>(['', '', '', '']);
  const [tempFiles, setTempFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [fileSizes, setFileSizes] = useState<number[]>([0, 0, 0, 0]);
  const [uploadErrors, setUploadErrors] = useState<string[]>(['', '', '', '']);

  // Correção da tipagem inicial para evitar o erro de 'never[]'
  const [formData, setFormData] = useState<FormData>({
    name: '', 
    price: '', 
    category: '', 
    unit: 'un',
    currency: 'MZN',
    main_image: '', 
    gallery: [], 
    full_description: ''
  });
  
  const [storeWhatsApp, setStoreWhatsApp] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (isCreating) return null;
      const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!productId && !isCreating
  });

  const { data: categories } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('category');
      return Array.from(new Set(data?.map(p => p.category).filter(Boolean))) as string[];
    }
  });

  useEffect(() => {
    if (product) {
      setFormData({ 
        ...product, 
        price: product.price.toString(),
        currency: product.currency || 'MZN'
      });
      const imgs = [product.main_image, ...(product.gallery || [])];
      setPreviews([...imgs, '', '', ''].slice(0, 4));
    }
    if (store?.whatsapp_number) setStoreWhatsApp(store.whatsapp_number);
  }, [product, store]);

  useEffect(() => {
    if (scrollRef.current) {
      const hasScroll = scrollRef.current.scrollHeight > scrollRef.current.clientHeight;
      setShowScrollHint(hasScroll);
    }
  }, [formData.full_description, isEditing]);

  const handleFileSelection = useCallback((e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newSizes = [...fileSizes]; newSizes[index] = file.size; setFileSizes(newSizes);
    const newErrors = [...uploadErrors]; newErrors[index] = file.size > 1024 * 1024 ? "GRANDE" : ""; setUploadErrors(newErrors);
    const f = [...tempFiles]; f[index] = file; setTempFiles(f);

    const reader = new FileReader();
    reader.onloadend = () => { 
      setPreviews(prev => {
        const next = [...prev];
        next[index] = reader.result as string;
        return next;
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [fileSizes, uploadErrors, tempFiles]);

  const removePhoto = useCallback((index: number) => {
    setPreviews(prev => { const n = [...prev]; n[index] = ""; return n; });
    setTempFiles(prev => { const n = [...prev]; n[index] = null; return n; });
    setFileSizes(prev => { const n = [...prev]; n[index] = 0; return n; });
    setUploadErrors(prev => { const n = [...prev]; n[index] = ""; return n; });
  }, []);

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      setIsSaving(true);
  
      try {
        const uploadPromises: Promise<UploadResult>[] = tempFiles.map(async (file, index) => {
          if (file) {
            const res = await uploadToCloudinary(file);
            return { index, url: res.url };
          }
          return null;
        });
  
        const uploadResults = await Promise.all(uploadPromises);
  
        // MAIN IMAGE
        const mainUpload = uploadResults.find(r => r?.index === 0);
        const finalMain = mainUpload ? mainUpload.url : data.main_image;
  
        // GALLERY
        const finalGallery = isCreating ? [] : [...(data.gallery || [])];
  
        uploadResults.forEach((result) => {
          if (result && result.index > 0) {
            finalGallery[result.index - 1] = result.url;
          }
        });
  
        const payload = {
          name: data.name,
          slug: createSlug(data.name),
          category: data.category,
          price: Number(data.price),
          currency: data.currency,
          unit: data.unit,
          full_description: data.full_description,
          main_image: finalMain,
          gallery: finalGallery.filter(Boolean),
          store_id: store?.id,
        };
  
        const { error } = isCreating
          ? await supabase.from('products').insert([payload])
          : await supabase.from('products').update(payload).eq('id', productId);
  
        if (error) throw error;
  
        return true;
  
      } catch (error) {
        console.error("Erro ao salvar produto:", error);
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
  
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
  
      toast.success(
        isCreating ? "Produto criado com sucesso 🚀" : "Produto atualizado com sucesso ✨"
      );
  
      if (isCreating) onClose?.();
      else setIsEditing(false);
    },
  
    onError: (error: unknown) => {
      const err = error as SupabaseError;
  
      toast.error(err.message || "Erro ao salvar. Tente novamente.");
    }
  });
  

  const totalPrice = useMemo(() => (Number(formData.price) || 0) * quantidade, [formData.price, quantidade]);
  
  const canSave = useMemo(() => (
    formData.name.trim().length >= 3 && 
    Number(formData.price) > 0 && 
    formData.category.trim().length >= 2 &&
    previews[0] !== "" &&
    !uploadErrors.some(e => e !== "")
  ), [formData, previews, uploadErrors]);

  if (isLoading && !isCreating) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-blue-500" size={32}/></div>;

  return (
    <div className='bg-white min-h-screen text-slate-900 font-sans selection:bg-blue-50 overflow-x-hidden'>
      <nav className="fixed top-0 left-0 right-0 bg-white/90  z-[120] px-6 h-16 flex items-center justify-between border-b border-slate-50">
        <button type="button" onClick={() => (isCreating ? onClose?.() : navigate(-1))} className="p-2 hover:bg-slate-50 rounded-full transition-all">
          <ChevronLeft size={24}/>
        </button>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all active:scale-95 shadow-sm">
              <Edit3 size={14} /><span className="text-[10px] font-black uppercase tracking-widest">Editar Produto</span>
            </button>
          ) : (
            <>
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Cancelar</button>
              <button 
                type="button" 
                onClick={() => canSave && saveMutation.mutate(formData)} 
                disabled={isSaving || !canSave} 
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${canSave ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-300'}`}
              >
                {isSaving ? <Loader2 size={12} className="animate-spin"/> : <Check size={14}/>} Publicar
              </button>
            </>
          )}
        </div>
      </nav>

      <main className="container mx-auto max-w-6xl px-6 pt-24 pb-20">
        {isEditing ? (
          <ProductForm 
            formData={formData} 
            setFormData={setFormData} 
            previews={previews} 
            uploadErrors={uploadErrors} 
            onFileSelect={handleFileSelection} 
            fileSizes={fileSizes} 
            removePhoto={removePhoto} 
            setUploadErrors={setUploadErrors}
            existingCategories={categories || []} 
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="w-full lg:sticky lg:top-24">
              <div className="relative aspect-[1/1.05] rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-xl">
                <img key={activeIndex} src={previews.filter(Boolean)[activeIndex] || 'https://via.placeholder.com/800'} alt="Preview" className="w-full h-full object-cover animate-in fade-in duration-700" />
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/20  p-2 rounded-full">
                  {previews.filter(Boolean).map((_, i) => (
                    <button key={i} onClick={() => setActiveIndex(i)} className={`h-1 rounded-full transition-all ${i === activeIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="space-y-3">
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em]">{formData.category || 'Geral'}</span>
                <h1 className="text-[clamp(1.5rem,5vw,2.0rem)] font-extrabold text-slate-900 tracking-tight leading-[1.1] uppercase break-words">{formData.name}</h1>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Informações</span>
                  {showScrollHint && (
                    <span className="flex items-center gap-1.5 text-[9px] font-black text-blue-500 uppercase animate-pulse">
                      <MousePointer2 size={10} /> Role para ler mais
                    </span>
                  )}
                </div>
                
                <div className="relative bg-gray-50 rounded-2xl p-4">
                  <div ref={scrollRef} onScroll={() => setShowScrollHint(false)} className="max-h-[200px] overflow-y-auto pr-4 text-slate-500 leading-relaxed text-[15px] break-words whitespace-pre-wrap font-medium custom-v-scroll">
                    {formData.full_description || 'Este item não possui uma descrição detalhada.'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-8 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Final</p>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums">
                      <span className="text-blue-600 text-2xl mr-1">{formData.currency}</span>
                      {totalPrice.toLocaleString()}
                    </div>
                    <p className="text-[11px] text-slate-400 italic">{formData.currency} {Number(formData.price).toLocaleString()} / {formData.unit}</p>
                  </div>
                  
                  <div className="flex items-center gap-6 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                    <button type="button" onClick={() => setQuantidade(q => Math.max(1, q-1))} className="text-slate-300 hover:text-slate-900 p-1"><Minus size={20}/></button>
                    <span className="text-xl font-black w-6 text-center tabular-nums">{quantidade}</span>
                    <button type="button" onClick={() => setQuantidade(q => q+1)} className="text-slate-300 hover:text-slate-900 p-1"><Plus size={20}/></button>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => window.open(`https://wa.me/${storeWhatsApp.replace(/\D/g,'')}?text=Olá! Quero ${quantidade}x ${formData.name} (${formData.currency} ${totalPrice.toLocaleString()})`, '_blank')}
                  className="w-full bg-slate-900 hover:bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all hover:shadow-2xl active:scale-95 shadow-lg shadow-slate-200"
                >
                  Confirmar no WhatsApp <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <style>{`.custom-v-scroll::-webkit-scrollbar { width: 5px; } .custom-v-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }`}</style>
    </div>
  );
}