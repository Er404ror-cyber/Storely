import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  LogOut,
  Loader2,
  Check,
  Edit2,
  Clock,
  ExternalLink,
  Globe,
  PanelLeftClose,
} from 'lucide-react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { AdminPage, AdminStore } from '../../types/admin';
import type { useTranslate } from '../../context/LanguageContext';
type TranslateFn = ReturnType<typeof useTranslate>['t'];

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  store: AdminStore | undefined;
  pages: AdminPage[];
  location: { pathname: string };
  isEditingName: boolean;
  setIsEditingName: (val: boolean) => void;
  newName: string;
  setNewName: (val: string) => void;
  timeLeft: string;
  updateStoreMutation: UseMutationResult<AdminStore, Error, string, unknown>;
  confirmLogout: boolean;
  setConfirmLogout: (val: boolean) => void;
  handleLogout: () => Promise<void>;
  storeUrl: string;
  menuItems: MenuItem[];
  t: TranslateFn;
  lang: 'pt' | 'en';
  handleLangChange: () => void;
}

// Cores Soft UI
const THEME_PRIMARY = 'text-[#7B61FF]'; // Roxo vibrante mas suave
const THEME_ACTIVE_BG = 'bg-slate-200 '; // Sombra leve para efeito 3D (Soft UI)
const BG_BASE = 'bg-slate-100/95'; // Cinza muito claro, excelente para os olhos

// Constante para Fallback de Avatar
const AvatarFallback = memo(({ name }: { name: string }) => {
  const initial = name?.charAt(0)?.toUpperCase() || 'S';
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#A494EB] to-[#7B61FF] text-white">
      <span className="text-3xl font-bold uppercase tracking-wider">{initial}</span>
    </div>
  );
});

const NavItem = memo(function NavItem({
  item,
  isActive,
  badge,
  onClick,
}: {
  item: MenuItem;
  isActive: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`group flex items-center justify-between rounded-[20px] px-4 py-3.5 transition-all duration-300 transform-gpu active:scale-95 ${
        isActive
          ? `${THEME_ACTIVE_BG} ${THEME_PRIMARY} font-bold`
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 font-medium'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className={`shrink-0 transition-colors duration-300 ${isActive ? THEME_PRIMARY : 'text-slate-400 group-hover:text-slate-600'}`}>
          {item.icon}
        </div>
        <span className="truncate text-[15px]">{item.label}</span>
      </div>

      {badge !== undefined && badge > 0 && (
        <span
          className={`rounded-xl px-2.5 py-0.5 text-[11px] font-bold transition-colors ${
            isActive ? 'bg-[#7B61FF]/10 text-[#7B61FF]' : 'bg-slate-200 text-slate-500'
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
});

// Componente estilo Apple Toggle para o Idioma
const LanguageAppleToggle = memo(function LanguageAppleToggle({
  lang,
  onToggle,
}: {
  lang: 'pt' | 'en';
  onToggle: () => void;
}) {
 const currentLanguageLabel = lang === 'pt' ? 'Idioma' : 'language';
  const nextLanguageHint = lang === 'pt' ? 'Switch to EN' : 'Mudar para PT';

  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-[20px] bg-slate-200/50 px-3.5 py-2.5  border border-white/60 transition-all hover:from-slate-200/80 hover:to-indigo-50/60 active:scale-[0.99] text-left group shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
    >
      {/* Informações da Esquerda (Cores com Psicologia de Foco) */}
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {/* Ícone com energia: Roxo/Índigo suave para atrair o cérebro visualmente */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-950 text-white shadow-[0_3px_8px_rgba(79,70,229,0.2)] group-hover:scale-105 transition-transform duration-200">
          <Globe size={14} strokeWidth={2.5} />
        </div>

        <div className="min-w-0 leading-tight">
          <div className="truncate text-[12px] font-bold text-slate-800 tracking-tight">
            {currentLanguageLabel}
          </div>
          {/* Texto de suporte em Indigo para trazer contraste e vida */}
          <div className="truncate text-[9px] font-medium text-indigo-600/80 group-hover:text-indigo-600 transition-colors">
            {nextLanguageHint}
          </div>
        </div>
      </div>
      
      {/* Toggle Premium Ultra Visível (Estilo Glass com Contraste Máximo) */}
      <div className="relative flex rounded-xl bg-slate-900/80  p-[3px] shrink-0 h-8 w-[76px] overflow-hidden select-none pointer-events-none border border-white ">
        
        {/* Pílula Ativa Pop-out: Branca pura, saltando aos olhos com sombra 3D */}
        <div 
          className={`absolute top-[3px] bottom-[3px] left-[3px] w-[33px] bg-white rounded-[8px] shadow-[0_3px_10px_rgba(0,0,0,0.18),0_1px_3px_rgba(0,0,0,0.1)] transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) transform-gpu ${
            lang === 'pt' ? 'translate-x-[35px]' : 'translate-x-0'
          }`}
        />

        {/* Texto do Switch: Contraste absoluto quando ativo */}
        <div className="relative z-10 flex w-full h-full items-center justify-between text-[20px] font-black tracking-wide">
          <span className={`w-[33px] text-center transition-all duration-200 ${lang === 'en' ? 'text-slate-900 scale-105' : 'text-slate-500/80'}`}>
            🇬🇧
          </span>
          <span className={`w-[33px] text-center transition-all duration-200 ${lang === 'pt' ? 'text-slate-900 scale-105' : 'text-slate-500/80'}`}>
            🇵🇹
          </span>
        </div>
      </div>
    </button>
  );
});

const StoreLogo = memo(function StoreLogo({ store }: { store: AdminStore | undefined }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [store?.logo_url]);

  if (store?.logo_url && !failed) {
    return (
      <img
        src={store.logo_url}
        alt={store?.name || 'Store'}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }

  return <AvatarFallback name={store?.name || 'Store'} />;
});

export function AdminSidebar({
  isOpen,
  setIsOpen,
  store,
  pages,
  location,
  isEditingName,
  setIsEditingName,
  newName,
  setNewName,
  timeLeft,
  updateStoreMutation,
  confirmLogout,
  setConfirmLogout,
  handleLogout,
  storeUrl,
  menuItems,
  t,
  lang,
  handleLangChange,
}: SidebarProps) {
  const pathname = location.pathname;
  const pageCount = pages?.length ?? 0;
  const isEditorRoute = pathname.includes('/editor/');

  const isNameTaken = useMemo(() => {
    return String(updateStoreMutation.error?.message || '')
      .toLowerCase()
      .includes('taken');
  }, [updateStoreMutation.error?.message]);

  const closeSidebar = useCallback(() => setIsOpen(false), [setIsOpen]);

  const handleNavClick = useCallback(() => {
    setIsOpen(false);
    setConfirmLogout(false);
    setIsEditingName(false);
    updateStoreMutation.reset();
  }, [setIsOpen, setConfirmLogout, setIsEditingName, updateStoreMutation]);

  const handleStartEditing = useCallback(() => {
    if (!timeLeft && store) {
      setNewName(store.name);
      setIsEditingName(true);
    }
  }, [timeLeft, store, setNewName, setIsEditingName]);

  const handleCancelEdit = useCallback(() => {
    setIsEditingName(false);
    updateStoreMutation.reset();
  }, [setIsEditingName, updateStoreMutation]);

  const handleSaveName = useCallback(() => {
    updateStoreMutation.mutate(newName);
  }, [updateStoreMutation, newName]);

  useEffect(() => {
    setConfirmLogout(false);
    setIsEditingName(false);
    updateStoreMutation.reset();
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    document.documentElement.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[80] bg-zinc-900/60  transition-opacity lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Container principal */}
      <aside
        className={`fixed left-0 z-[90] w-[290px] flex flex-col transition-transform duration-300 ease-out transform-gpu ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${!isEditorRoute ? 'lg:relative lg:translate-x-0' : 'lg:fixed'} max-w-[320px]`}
        style={{
          top: 'env(safe-area-inset-top, 0px)',
          bottom: 'env(safe-area-inset-bottom, 0px)',
          height: 'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Soft UI Background Panel */}
        <div className={`flex h-full w-full flex-col overflow-hidden ${BG_BASE} border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}>
          
          {/* Header Profissional */}
          <div className="relative flex shrink-0 flex-col items-center pt-10 pb-4 px-6">
            <button
              type="button"
              onClick={closeSidebar}
              className={`${!isEditorRoute ? 'lg:hidden' : 'flex'} absolute right-4 top-4  p-2
              
              bg-white/80 border border-slate-200 shadow-lg rounded-xl text-slate-600 hover:text-indigo-600 transition-colors`}
            >
            <PanelLeftClose size={20} strokeWidth={2.5} />
            </button>
            {/* Avatar Elegante com Sombra Soft */}
            <div className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[28px] border-4 border-white bg-white shadow-[0_8px_20px_rgba(0,0,0,0.06)] transform-gpu transition-transform hover:scale-105">
              <StoreLogo store={store} />
            </div>
            
            {/* Bloco de Nome e Info */}
            <div className="mt-5 w-full text-center">
              {isEditingName ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1 rounded-[16px] bg-white p-1.5 shadow-sm border border-slate-100">
                    <input
                      autoFocus
                      value={newName}
                      onChange={(e) => setNewName(e.target.value.slice(0, 15))}
                      maxLength={15}
                      className={`w-32 rounded-xl bg-transparent px-2 py-1 text-center text-[14px] font-bold text-slate-700 outline-none placeholder:text-slate-300 ${
                        isNameTaken ? 'ring-2 ring-red-400' : ''
                      }`}
                    />
                    <button
                      type="button"
                      disabled={updateStoreMutation.isPending}
                      onClick={handleSaveName}
                      className="rounded-xl bg-[#7B61FF] p-2 text-white shadow-sm hover:brightness-110 disabled:opacity-50 transition-all"
                    >
                      {updateStoreMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {isNameTaken && (
                    <span className="text-[10px] font-bold uppercase text-red-500">
                      {t('name_taken')}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center gap-2">
                    <h2 className="text-[18px] font-bold text-slate-800 tracking-tight">
                      Hi, {store?.name || 'Store'} <span className="text-[18px]">👋</span>
                    </h2>
                    {!timeLeft && (
                      <button onClick={handleStartEditing} className="text-slate-400 hover:text-[#7B61FF] transition-colors p-1">
                        <Edit2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="mt-1 text-[12px] font-medium text-slate-400">
                     {timeLeft ? (
                       <span className="flex items-center gap-1.5 justify-center bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                         <Clock size={12} /> {timeLeft} {t('time_left')}
                       </span>
                     ) : (
                       <span className="bg-slate-200/60 px-3 py-1 rounded-full text-slate-500">
                         {store?.slug || 'admin'}
                       </span>
                     )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navegação Secundária/Scrollável (Telas Pequenas) */}
          <nav className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
            <div className="flex min-h-full flex-col space-y-1">
              {menuItems.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  badge={item.path === '/admin/paginas' ? pageCount : undefined}
                  isActive={pathname === item.path}
                  onClick={handleNavClick}
                />
              ))}
            </div>
          </nav>

          {/* Footer Soft UI (Controles) */}
          <div className="mt-auto px-4 pb-6 pt-2 shrink-0">
            <div className="flex flex-col gap-3 rounded-[24px] bg-white/80 p-4 border border-white">
              
              {!isEditorRoute && (
              
                <LanguageAppleToggle lang={lang} onToggle={handleLangChange} />
              )}

              <div className="flex gap-2">
                 <Link
                  to={storeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-slate-200/50 text-slate-600 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:text-[#7B61FF] hover:shadow-md active:scale-95 transform-gpu"
                 >
                  <ExternalLink size={18} strokeWidth={2.5} />
                 </Link>

                {!confirmLogout ? (
                  <button
                    type="button"
                    onClick={() => setConfirmLogout(true)}
                    className="flex-1 rounded-[18px] bg-slate-200/50 px-4 py-2 font-bold text-slate-600 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:text-red-500 hover:shadow-md active:scale-95 transform-gpu"
                  >
                    <span className="flex items-center justify-center gap-2 text-[13px]">
                      <LogOut size={18} strokeWidth={2.5} />
                      {t('logout_btn')}
                    </span>
                  </button>
                ) : (
                  <div className="flex flex-1 gap-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex-1 rounded-[18px] bg-red-500 font-bold text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)] active:scale-95 transform-gpu text-[13px]"
                    >
                      {t('confirm_exit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmLogout(false)}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-slate-200/50 text-slate-600 shadow-sm active:scale-95 transform-gpu hover:bg-slate-50"
                    >
                      <X size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}