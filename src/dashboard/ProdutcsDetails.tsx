import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft, Edit3, Loader2, Plus, Minus, 
  ArrowRight, Check, Share2, Maximize2 
} from 'lucide-react';
import { useAdminStore } from '../hooks/useAdminStore';
import { supabase } from '../lib/supabase';
import { uploadToCloudinary } from '../utils/cloud';
import { ProductForm } from '../components/produtos/ProductForm';
import { toast } from "react-hot-toast";
import { getUserCurrency } from '../utils/mzn';
import type { MediaItem } from '../types/library';
import { MediaModal } from '../components/modal';

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


const createSlug = (t: string) => t.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');

export function ProductDetails({ isCreating = false, onClose }: { isCreating?: boolean; onClose?: () => void }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: store } = useAdminStore();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isEditorRoute = pathname.includes('admin');

  // ESTADOS PRINCIPAIS
  const [isEditing, setIsEditing] = useState(isCreating);
  const [isSaving, setIsSaving] = useState(false);
  const [quantidade, setQuantidade] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  
  // ESTADO PARA O MODAL DE MEDIA E FORMULÁRIO
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [previews, setPreviews] = useState<string[]>(['', '', '', '']);
  const [tempFiles, setTempFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [fileSizes, setFileSizes] = useState<number[]>([0, 0, 0, 0]);
  const [uploadErrors, setUploadErrors] = useState<string[]>(['', '', '', '']);

  const [formData, setFormData] = useState<FormData>(() => ({
    name: '',
    price: '',
    category: '',
    unit: 'un',
    currency: getUserCurrency(),
    main_image: '',
    gallery: [],
    full_description: ''
  }));
  
  const [storeWhatsApp, setStoreWhatsApp] = useState('');

  // --- LÓGICA DO SLIDER AUTOMÁTICO ---
  useEffect(() => {
    const activePreviews = previews.filter(Boolean);
    if (activePreviews.length <= 1 || isEditing || isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % activePreviews.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [previews, isEditing, isPaused]);

  // --- QUERIES ---
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

  // --- EFEITOS DE SINCRONIZAÇÃO ---
  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        price: product.price.toString(),
        currency: product.currency || getUserCurrency()
      });
  
      const imgs = [product.main_image, ...(product.gallery || [])];
      setPreviews([...imgs, '', '', ''].slice(0, 4));
    }
    if (store?.whatsapp_number) setStoreWhatsApp(store.whatsapp_number);
  }, [product, store]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      setShowScrollHint(true);
    }
  }, [productId]);

  // --- HANDLERS ---
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop > 20) setShowScrollHint(false);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: formData.name,
      text: `Confira este produto: ${formData.name}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copiado!");
      }
    } catch (err) { console.log("Erro ao partilhar", err); }
  };

  const openImagePreview = () => {
    const currentImageUrl = previews.filter(Boolean)[activeIndex];
    if (currentImageUrl) {
      setPreviewMedia({
        url: currentImageUrl,
        type: 'image',
        id: activeIndex.toString()
      });
    }
  };

  const handleWhatsAppOrder = () => {
    if (!storeWhatsApp) {
      toast.error("WhatsApp da loja não configurado.");
      return;
    }
    const cleanNumber = storeWhatsApp.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá! Quero comprar:\n*${formData.name}*\nQuantidade: ${quantidade}\nTotal: ${formData.currency} ${totalPrice.toLocaleString()}`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

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
        const uploadPromises = tempFiles.map(async (file, index) => {
          if (file) {
            const res = await uploadToCloudinary(file);
            return { index, url: res.url };
          }
          return null;
        });
  
        const uploadResults = await Promise.all(uploadPromises);
        const mainUpload = uploadResults.find(r => r?.index === 0);
        const finalMain = mainUpload ? mainUpload.url : data.main_image;
        const finalGallery = isCreating ? [] : [...(data.gallery || [])];
  
        uploadResults.forEach((result) => {
          if (result && result.index > 0) finalGallery[result.index - 1] = result.url;
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
      } finally { setIsSaving(false); }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      toast.success(isCreating ? "Produto criado! 🚀" : "Produto atualizado! ✨");
      if (isCreating) onClose?.();
      else setIsEditing(false);
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

  const t = (key: string) => {
    const labels: Record<string, string> = { exit: 'Sair', image: 'Imagem' };
    return labels[key] || key;
  };

  return (
    <div className='bg-white min-h-screen text-slate-900 font-sans selection:bg-blue-50 overflow-x-hidden'>
      {!isEditing && previewMedia && (
        <MediaModal media={previewMedia} onClose={() => setPreviewMedia(null)} t={t} />
      )}

      <nav className="fixed top-0 left-0 right-0 bg-white  z-[120] px-6 h-16 flex items-center justify-between border-b border-slate-50">
        <button type="button" onClick={isCreating ? onClose : handleBack} className="p-2 hover:bg-slate-50 rounded-full transition-all">
          <ChevronLeft size={24}/>
        </button>

        <div className="flex items-center gap-3">
          <button onClick={handleShare} className="p-2.5 hover:bg-slate-50 rounded-full text-slate-600 transition-all border border-transparent hover:border-slate-100">
            <Share2 size={20} />
          </button>

          {isEditorRoute && (
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-sm">
                  <Edit3 size={14} /><span className="text-[10px] font-black uppercase tracking-widest text-white">Editar</span>
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
          )}
        </div>
      </nav>

      <main className="container mx-auto max-w-6xl px-6 pt-24 pb-20">
        {isEditing && isEditorRoute ? (
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
              <div 
                className="relative aspect-[1/1.05] rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-xl cursor-zoom-in group"
                onClick={openImagePreview}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <img 
                  key={activeIndex} 
                  src={previews.filter(Boolean)[activeIndex] || 'https://via.placeholder.com/800'} 
                  alt="Preview" 
                  className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-700 transition-transform duration-500 group-hover:scale-105" 
                />
                
                <div className="absolute top-4 right-4 bg-white/20  p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                   <Maximize2 size={20} className="text-white" />
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/20  p-2 rounded-full z-10">
                  {previews.filter(Boolean).map((_, i) => (
                    <button 
                      key={i} 
                      onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }} 
                      className={`h-1 rounded-full transition-all duration-500 ${i === activeIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="space-y-3">
                <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em]">{formData.category || 'Geral'}</span>
                <h1 className="text-[clamp(1.5rem,5vw,2.2rem)] font-extrabold text-slate-900 tracking-tight leading-[1.1] uppercase break-words">{formData.name}</h1>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Detalhes</span>
                </div>
                
                <div className="relative bg-gray-50 rounded-2xl p-4 group">
                  <div 
                    ref={scrollRef} 
                    onScroll={handleScroll} 
                    className="max-h-[220px] overflow-y-auto pr-4 text-slate-500 leading-relaxed text-[15px] break-words whitespace-pre-wrap font-medium custom-v-scroll"
                  >
                    {formData.full_description || 'Produto sem descrição detalhada disponível no momento.'}
                  </div>
                  
                  {showScrollHint && formData.full_description?.length > 200 && (
                    <>
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce opacity-40">
                         <div className="w-1 h-3 bg-blue-500 rounded-full" />
                      </div>
                    </>
                  )}
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
                    <button type="button" onClick={() => setQuantidade(q => Math.max(1, q-1))} aria-label="Remover" className="text-slate-300 hover:text-slate-900 p-1 transition-colors"><Minus size={20}/></button>
                    <span className="text-xl font-black w-6 text-center tabular-nums">{quantidade}</span>
                    <button type="button" onClick={() => setQuantidade(q => q+1)} aria-label="Adicionar" className="text-slate-300 hover:text-slate-900 p-1 transition-colors"><Plus size={20}/></button>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-slate-900 hover:bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all hover:shadow-2xl active:scale-95 shadow-lg shadow-slate-200"
                >
                  Confirmar no WhatsApp <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <style>{`
        .custom-v-scroll::-webkit-scrollbar { width: 4px; } 
        .custom-v-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}