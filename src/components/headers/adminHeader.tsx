import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Store as StoreIcon,
  X,
  LogOut,
  Loader2,
  Check,
  Edit2,
  Clock,
  ExternalLink,
  Globe,
  ChevronRight,
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
      className={`flex items-center justify-between rounded-2xl px-4 py-3 transition-colors ${
        isActive
          ? 'bg-indigo-600 text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}>
          {item.icon}
        </div>
        <span className="truncate text-[14px] font-semibold">{item.label}</span>
      </div>

      {badge !== undefined && badge > 0 && (
        <span
          className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
            isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
});

const LanguageNavButton = memo(function LanguageNavButton({
  lang,
  onClick,
}: {
  lang: 'pt' | 'en';
  onClick: () => void;
}) {
  const currentLanguageLabel = lang === 'pt' ? 'Português' : 'English';
  const currentLanguageCode = lang === 'pt' ? 'PT' : 'EN';
  const nextLanguageHint = lang === 'pt' ? 'Switch to English' : 'Mudar para Português';

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:bg-slate-50"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Globe size={18} />
          </div>

          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold text-slate-900">
              {currentLanguageLabel}
            </div>
            <div className="mt-0.5 truncate text-[9px] text-slate-500">
              {nextLanguageHint}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
            {currentLanguageCode}
          </span>
          <ChevronRight size={16} className="text-slate-300" />
        </div>
      </div>
    </button>
  );
});

const StoreLogo = memo(function StoreLogo({
  store,
}: {
  store: AdminStore | undefined;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [store?.logo_url]);

  const initial = useMemo(() => store?.name?.charAt(0)?.toUpperCase() || 'S', [store?.name]);

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 text-white">
      {store?.logo_url && !failed ? (
        <img
          src={store.logo_url}
          alt={store?.name || 'Store'}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-sm font-bold uppercase">{initial}</span>
      )}
    </div>
  );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          className="fixed inset-0 z-[80] bg-slate-900/30 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 z-[90] flex w-[290px] flex-col border-r border-slate-200 bg-[#fcfcfd] transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${!isEditorRoute ? 'lg:relative lg:translate-x-0' : 'lg:fixed'}`}
        style={{
          top: 'env(safe-area-inset-top, 0px)',
          bottom: 'env(safe-area-inset-bottom, 0px)',
          height:
            'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <StoreIcon size={18} />
              </div>
              <div>
                <div className="text-[15px] font-bold text-slate-900">Storelyy</div>
                <div className="text-[11px] text-slate-400">Admin panel</div>
              </div>
            </div>

            <button
              type="button"
              onClick={closeSidebar}
              className={`${!isEditorRoute ? 'lg:hidden' : 'flex'} rounded-xl p-2 text-slate-400 hover:bg-slate-100`}
            >
              <X size={20} />
            </button>
          </div>

          <nav
            className="flex-1 min-h-0 overflow-y-auto px-4 py-4"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex min-h-full flex-col">
              <div className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                {t('menu_nav')}
              </div>

              <div className="space-y-2">
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

              {!isEditorRoute && (
                <div className="mt-auto pt-6">
                  <div className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    {t('language') || 'Idioma'}
                  </div>
                  <LanguageNavButton lang={lang} onClick={handleLangChange} />
                </div>
              )}
            </div>
          </nav>

          <div
            className="border-t border-slate-200 bg-white p-4"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
          >
            <div className="space-y-3">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <StoreLogo store={store} />

                  <div className="min-w-0 flex-1">
                    {isEditingName ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <input
                            autoFocus
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className={`w-full rounded-xl border px-3 py-2 text-[13px] font-semibold outline-none ${
                              isNameTaken
                                ? 'border-red-500 ring-1 ring-red-500'
                                : 'border-slate-200 bg-white focus:border-indigo-400'
                            }`}
                          />

                          <button
                            type="button"
                            disabled={updateStoreMutation.isPending}
                            onClick={handleSaveName}
                            className="rounded-xl p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                          >
                            {updateStoreMutation.isPending ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Check size={18} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        {isNameTaken && (
                          <div className="text-[10px] font-bold uppercase tracking-wide text-red-600">
                            {t('name_taken')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={handleStartEditing}
                          disabled={!!timeLeft}
                          className="min-w-0 text-left"
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`truncate text-[14px] font-bold ${
                                timeLeft ? 'text-slate-400' : 'text-slate-900'
                              }`}
                            >
                              {store?.name || 'Store'}
                            </span>
                            {timeLeft ? (
                              <Clock size={12} className="text-slate-300" />
                            ) : (
                              <Edit2 size={12} className="text-slate-300" />
                            )}
                          </div>

                          <div className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                            {timeLeft ? `${timeLeft} ${t('time_left')}` : store?.slug}
                          </div>
                        </button>

                        <a
                          href={storeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700"
                        >
                          <ExternalLink size={15} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!confirmLogout ? (
                <button
                  type="button"
                  onClick={() => setConfirmLogout(true)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <span className="flex items-center justify-center gap-2">
                    <LogOut size={16} />
                    {t('logout_btn')}
                  </span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white"
                  >
                    {t('confirm_exit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmLogout(false)}
                    className="rounded-2xl bg-slate-200 px-4 py-3 text-slate-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}