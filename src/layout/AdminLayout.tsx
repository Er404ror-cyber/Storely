import React, { useState, useEffect, memo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  LayoutDashboard, FileText, ShoppingBag, Settings, 
  Store as StoreIcon, Menu, X, LogOut, Loader2, Check, Edit2, Clock, ExternalLink 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// --- Interfaces Tipadas (Sem 'any') ---

interface Store {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  updated_at_name: string | null;
  created_at: string;
  logo_url?: string;
  theme_color?: string;
}

interface Page {
  id: string;
  store_id: string;
  title: string;
  slug: string;
  is_published: boolean;
  created_at: string;
}

interface NavItemProps {
  item: {
    path: string;
    label: string;
    icon: React.ReactNode;
  };
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}

const BASE_DOMAIN = "http://storelyy.vercel.app";
const STORE_CACHE_KEY = 'storelyy_persistent_store';

const generateSlug = (text: string): string => {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
};

const NavItem = memo(({ item, isActive, onClick, badge }: NavItemProps) => (
  <Link
    to={item.path}
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
      isActive 
      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' 
      : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`${isActive ? 'scale-110' : 'group-hover:rotate-12 transition-transform'}`}>
        {item.icon}
      </div>
      <span className="font-bold text-[14px] tracking-tight">{item.label}</span>
    </div>
    {badge !== undefined && badge > 0 && !isActive && (
      <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-lg">{badge}</span>
    )}
  </Link>
));

NavItem.displayName = 'NavItem';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [confirmLogout, setConfirmLogout] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<string>("");

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
      localStorage.setItem(STORE_CACHE_KEY, JSON.stringify(data));
      return data as Store;
    },
    initialData: () => {
      const saved = localStorage.getItem(STORE_CACHE_KEY);
      return saved ? JSON.parse(saved) : undefined;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const { data: pages } = useQuery<Page[]>({
    queryKey: ['pages', store?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('store_id', store?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!store?.id,
  });

  const updateStoreMutation = useMutation({
    mutationFn: async (name: string) => {
      const cleanName = name.trim();
      if (!store || !cleanName || cleanName === store.name) {
        setIsEditingName(false);
        return store;
      }

      const { data, error } = await supabase
        .from('stores')
        .update({ 
          name: cleanName, 
          slug: generateSlug(cleanName),
          updated_at_name: new Date().toISOString() 
        })
        .eq('id', store.id)
        .select().single();

      if (error) {
        if (error.code === '23505') throw new Error("This name/URL is already taken.");
        throw new Error(error.message);
      }
      return data as Store;
    },
    onSuccess: (updatedStore) => {
      if (updatedStore) {
        queryClient.setQueryData(['admin-store'], updatedStore);
        localStorage.setItem(STORE_CACHE_KEY, JSON.stringify(updatedStore));
      }
      setIsEditingName(false);
      toast.success('Store updated successfully!');
    },
    onError: (err: Error) => toast.error(err.message)
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem(STORE_CACHE_KEY);
      queryClient.clear();
      navigate('/auth');
    } catch {
      toast.error('Error exiting');
    }
  };

  useEffect(() => {
    if (!store?.updated_at_name) return;
    const interval = setInterval(() => {
      const lastUpdate = new Date(store.updated_at_name!).getTime();
      const now = new Date().getTime();
      const diff = (lastUpdate + 24 * 60 * 60 * 1000) - now;
      
      if (diff <= 0) { 
        setTimeLeft(""); 
        clearInterval(interval); 
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
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
  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/paginas', label: 'My Pages', icon: <FileText size={20} />, badge: pages?.length },
    { path: '/admin/produtos', label: 'Products', icon: <ShoppingBag size={20} /> },
    { path: '/admin/configuracoes', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-white font-sans text-slate-900 overflow-hidden">
    
      
      {isOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80] lg:hidden" onClick={() => setIsOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-[90] w-[295px] bg-white border-r border-slate-100 flex flex-col transition-all duration-500 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3 font-black text-lg tracking-tighter uppercase italic">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <StoreIcon size={18} />
            </div>
            Storelyy
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-slate-400"><X size={20} /></button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <NavItem key={item.path} item={item} badge={item.badge} isActive={location.pathname === item.path} onClick={() => setIsOpen(false)} />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50 bg-slate-50/50">
          <div className="flex flex-col gap-2">
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm uppercase shrink-0">
                  {store?.name?.charAt(0)}
                </div>
                
                <div className="flex flex-col min-w-0 flex-1">
                  {isEditingName ? (
                    <div className="flex items-center gap-1">
                      <input 
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="text-[13px] font-black text-slate-900 bg-slate-50 px-2 py-1 rounded-lg w-full border border-slate-200 outline-indigo-600"
                      />
                      <button 
                        disabled={updateStoreMutation.isPending} 
                        onClick={() => updateStoreMutation.mutate(newName)} 
                        className="text-emerald-500 disabled:opacity-50"
                      >
                        {updateStoreMutation.isPending ? <Loader2 size={16} className="animate-spin"/> : <Check size={18} strokeWidth={3}/>}
                      </button>
                      <button onClick={() => setIsEditingName(false)} className="text-slate-400"><X size={18} /></button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between gap-1">
                        <div 
                          onClick={() => { 
                            if (!timeLeft && store) { 
                              setNewName(store.name); 
                              setIsEditingName(true); 
                            } else if (timeLeft) {
                              toast(`Edit locked for ${timeLeft}`, { icon: '⏳' });
                            }
                          }}
                          className={`flex items-center gap-1.5 min-w-0 group ${!timeLeft ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                        >
                          <span className={`text-[13px] font-black uppercase italic truncate ${!timeLeft ? 'hover:text-indigo-600' : 'text-slate-400'}`}>
                            {store?.name}
                          </span>
                          {!timeLeft ? <Edit2 size={10} className="text-slate-300 shrink-0" /> : <Clock size={10} className="text-slate-300" />}
                        </div>
                        <a href={storeUrl} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-indigo-600 shrink-0"><ExternalLink size={14} /></a>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                        {timeLeft ? `${timeLeft} left` : store?.slug}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!confirmLogout ? (
              <button onClick={() => setConfirmLogout(true)} className="flex items-center justify-center gap-2 w-full p-3.5 rounded-2xl text-slate-400 font-bold text-[11px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all">
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleLogout} className="flex-1 p-3.5 bg-red-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest italic">Exit</button>
                <button onClick={() => setConfirmLogout(false)} className="p-3.5 bg-slate-200 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-widest"><X size={16} /></button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen bg-white">
        <header className="lg:hidden h-14 flex items-center justify-between px-4 border-b border-slate-50 bg-white sticky top-0 z-[70]">
          <button onClick={() => setIsOpen(true)} className="p-2 text-slate-600"><Menu size={22} /></button>
          <span className="font-black text-[11px] uppercase tracking-tighter italic truncate max-w-[150px]">{store?.name}</span>
          <a href={storeUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-400"><ExternalLink size={18} /></a>
        </header>

        <div className="flex-1 overflow-y-auto">
          <Outlet context={{ store, pages }} />
        </div>
      </main>
    </div>
  );
}