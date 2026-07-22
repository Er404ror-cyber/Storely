import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  Settings,
  Loader2,
  Compass,
  PanelLeftOpen,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { AdminSidebar } from '../components/headers/adminHeader'; 
import { AdminTopBar } from '../components/headers/AdminTopBar';
import { useTranslate } from '../context/LanguageContext';
import { useAdminStoreData } from '../hooks/useAdminStoreData';
import { ADMIN_STORE_CACHE_KEY, getAdminPagesCacheKey, clearCache } from '../utils/adminCache';

const BASE_DOMAIN = 'https://storelyy.vercel.app';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, lang, setLang } = useTranslate();

  const isEditorRoute = location.pathname.includes('/editor/');

  // UI States
  const [isOpen, setIsOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  // Lógica pesada totalmente abstraída no hook
  const {
    store,
    pages,
    storeLoading,
    pagesLoading,
    storeFetching,
    updateStoreMutation,
    storeCacheLeft,
    source,
    timeLeft
  } = useAdminStoreData();

  const handleLangChange = useCallback(() => {
    const newLang = lang === 'pt' ? 'en' : 'pt';
    setLang(newLang);
    toast.success(newLang === 'pt' ? 'Idioma: Português' : 'Language: English', {
      id: 'lang',
      icon: '🌎',
      style: { borderRadius: '12px', background: '#1e293b', color: '#fff', fontSize: '12px' },
    });
  }, [lang, setLang]);

  useEffect(() => {
    if (isEditorRoute) setIsOpen(false);
  }, [location.pathname, isEditorRoute]);

  useEffect(() => {
    if (store?.name && !isEditingName) setNewName(store.name);
  }, [store?.name, isEditingName]);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      clearCache(ADMIN_STORE_CACHE_KEY);
      if (store?.id) clearCache(getAdminPagesCacheKey(store.id));
      queryClient.clear();
      navigate('/');
    } catch {
      toast.error(t('error_exiting'));
    }
  }, [navigate, queryClient, store?.id, t]);

  if (storeLoading && !store) {
    return (
      <div className="min-h-dvh w-full flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="animate-spin text-[#7B61FF]" size={36} />
      </div>
    );
  }

  const storeUrl = `${BASE_DOMAIN}/${store?.slug ?? ''}`;
  const menuItems = [
    { path: '/admin', label: t('nav_dashboard'), icon: <LayoutDashboard size={20} /> },
    { path: '/admin/produtos', label: t('nav_products'), icon: <ShoppingBag size={20} /> },
    { path: '/admin/paginas', label: t('nav_pages'), icon: <FileText size={20} /> },
    { path: '/admin/explore', label: t('nav_home'), icon: <Compass size={20} /> }, 
    { path: '/admin/configuracoes', label: t('nav_settings'), icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex min-h-dvh w-full bg-[#F8F9FA] font-sans text-slate-900 select-none relative">
      <AdminSidebar
        t={t}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        store={store}
        pages={pages}
        location={location}
        isEditingName={isEditingName}
        setIsEditingName={(val) => {
          setIsEditingName(val);
          if (val && store) setNewName(store.name);
        }}
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

      <main className="flex-1 flex flex-col min-w-0 min-h-dvh bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.02)] relative lg:rounded-none">
        
        {isEditorRoute && !isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="fixed top-3 sm:top-5 left-5 z-[70] w-11 h-11 flex items-center justify-center bg-white/90 border border-slate-200/60 shadow-[0_4px_16px_rgba(0,0,0,0.06)] rounded-2xl text-slate-600 hover:text-[#7B61FF] transition-all transform-gpu active:scale-95 touch-manipulation"
          >
            <PanelLeftOpen size={22} strokeWidth={2.5} />
          </button>
        )}

        {!isEditorRoute && (
          <AdminTopBar
            store={store}
            setIsOpen={setIsOpen}
            storeUrl={storeUrl}
            storeCacheLeft={storeCacheLeft}
            source={source}
            storeFetching={storeFetching}
          />
        )}

        {/* Zona de conteúdo agora expande naturalmente com a página */}
        <div 
          data-scroll-container="admin" 
          className="flex-1 w-full bg-white pb-safe flex flex-col select-text"
        >
          <Outlet context={{ store, pages, pagesLoading }} />
        </div>
      </main>
    </div>
  );
}