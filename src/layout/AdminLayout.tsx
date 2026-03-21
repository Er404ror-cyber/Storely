import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LayoutDashboard, FileText, ShoppingBag, Settings, Loader2, Menu, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { AdminSidebar } from '../components/headers/adminHeader';
import { useTranslate } from '../context/LanguageContext';

// --- Interface Atualizada ---
interface Store {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  logo_url?: string; // Adicionado para a imagem aparecer
  updated_at_name: string | null;
  created_at: string;
}

const BASE_DOMAIN = "https://storelyy.vercel.app";
const STORE_CACHE_KEY = 'storelyy_persistent_store';

const generateSlug = (text: string): string => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, lang, setLang } = useTranslate();
  


  const isEditorRoute = location.pathname.includes('/editor/');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [confirmLogout, setConfirmLogout] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<string>("");


  const handleLangChange = () => {
    const newLang = lang === 'pt' ? 'en' : 'pt';
    setLang(newLang);
    toast.success(newLang === 'pt' ? 'Idioma: Português' : 'Language: English', {
      id: 'lang',
      icon: '🌎',
      style: {
        borderRadius: '12px',
        background: '#1e293b',
        color: '#fff',
        fontSize: '12px'
      }
    });
  };

  useEffect(() => {
    if (isEditorRoute) setIsOpen(false);
  }, [location.pathname, isEditorRoute]);
  const { data: store, isLoading: storeLoading } = useQuery<Store>({
    queryKey: ['admin-store'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");
  
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .single();
  
      if (error) throw error;
  
      return data as Store;
    },
  
    staleTime: 1000 * 60 * 30, // 30 min
  
    refetchOnMount: false,
  
    refetchOnWindowFocus: true,
  
    refetchOnReconnect: true,
  
    retry: 1,
  });

  const { data: pages } = useQuery({
    queryKey: ['pages', store?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('pages').select('*').eq('store_id', store?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!store?.id,
  });

  const updateStoreMutation = useMutation({
    mutationFn: async (name: string) => {
      const cleanName = name.trim();
      const newSlug = generateSlug(cleanName);
      if (!store || !cleanName) return;

      if (cleanName.toLowerCase() === store.name.toLowerCase() || newSlug === store.slug) {
        setIsEditingName(false);
        return store;
      }

      const { data: existingStore } = await supabase.from('stores').select('id').eq('slug', newSlug).single();
      if (existingStore) throw new Error(t('name_taken'));

      const { data, error } = await supabase
        .from('stores')
        .update({ name: cleanName, slug: newSlug, updated_at_name: new Date().toISOString() })
        .eq('id', store.id)
        .select().single();

      if (error) throw new Error(error.code === '23505' ? t('name_taken') : error.message);
      return data;
    },
    onSuccess: (updatedStore) => {
      if (updatedStore) {
        queryClient.setQueryData(['admin-store'], updatedStore);
        localStorage.setItem(STORE_CACHE_KEY, JSON.stringify(updatedStore));
      }
      setIsEditingName(false);
      toast.success(t('update_success'));
    },
    onError: (err: Error) => {
      toast.error(err.message);
    }
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem(STORE_CACHE_KEY);
      queryClient.clear();
      navigate('/');
    } catch {
      toast.error(t('error_exiting'));
    }
  };

  useEffect(() => {
    if (!store?.updated_at_name) return;
    const interval = setInterval(() => {
      const lastUpdate = new Date(store.updated_at_name!).getTime();
      const diff = (lastUpdate + 24 * 60 * 60 * 1000) - new Date().getTime();
      if (diff <= 0) { setTimeLeft(""); clearInterval(interval); } 
      else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [store?.updated_at_name]);

  if (storeLoading && !store) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
    </div>
  );

  const storeUrl = `${BASE_DOMAIN}/${store?.slug}`;
  
  // --- Menu Itens com Tradução ---
  const menuItems = [
    { path: '/admin', label: t('nav_dashboard'), icon: <LayoutDashboard size={20} /> },
    { path: '/admin/paginas', label: t('nav_pages'), icon: <FileText size={20} /> },
    { path: '/admin/produtos', label: t('nav_products'), icon: <ShoppingBag size={20} /> },
    { path: '/admin/configuracoes', label: t('nav_settings'), icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-white font-sans text-slate-900 overflow-hidden relative">
      <AdminSidebar 
        t={t} 
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        store={store}
        pages={pages || []}
        location={location}
        isEditingName={isEditingName}
        setIsEditingName={setIsEditingName}
        newName={newName}
        setNewName={setNewName}
        timeLeft={timeLeft}
        updateStoreMutation={updateStoreMutation}
        confirmLogout={confirmLogout}
        setConfirmLogout={setConfirmLogout}
        handleLogout={handleLogout}
        storeUrl={storeUrl}
        menuItems={menuItems}
        lang={lang}
        handleLangChange={handleLangChange}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full bg-white relative overflow-hidden">
        {isEditorRoute && !isOpen && (
          <button 
            onClick={() => setIsOpen(true)} 
            className="fixed top-3 sm:top-5 left-5 z-[70] w-10 h-10 flex items-center justify-center bg-white/80 border border-slate-200 shadow-lg rounded-xl text-slate-600 hover:text-indigo-600 transition-all"
          >
            <Menu size={20} strokeWidth={2.5} />
          </button>
        )}

        {!isEditorRoute && (
          <header className="lg:hidden h-16 flex items-center justify-between px-6 border-b border-slate-50 bg-white/80 sticky top-0 z-50 shrink-0">
            <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 text-slate-600">
              <Menu size={24} />
            </button>
            <span className="font-black text-[12px] uppercase italic truncate max-w-[150px]">
              {store?.name}
            </span>
            <a href={storeUrl} target="_blank" rel="noreferrer" className="p-2 -mr-2 text-slate-400">
              <ExternalLink size={20} />
            </a>
          </header>
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet context={{ store, pages }} />
        </div>
      </main>
    </div>
  );
}