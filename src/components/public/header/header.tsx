import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, LayoutDashboard, Compass, LogIn } from "lucide-react";
import { supabase } from "../../../lib/supabase"; // AJUSTA O PATH
import { useTranslate } from "../../../context/LanguageContext"; // AJUSTA O PATH

import { MAX_STORE_NAME_MOBILE, MAX_STORE_NAME_DESKTOP, MAX_CURRENT_PAGE_MOBILE, normalizeLabel, getPagePath, getPageIcon } from "../../../utils/headerUtils"; // AJUSTA O PATH
import { DesktopNavItem, HeaderAssistButton } from "./NavItems";
import { MobileMenu } from "./MobileMenu";
import { FALLBACK_STORE } from "../../../utils/constants";

// IMAGEM DE FALLBACK (Com suporte a Dark/Light mode no próprio SVG)


export const StoreHeader = memo(function StoreHeader({ storeId }: { storeId: string }) {
  const { t } = useTranslate();
  const { storeSlug, pageSlug } = useParams();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // 1. BLOQUEIO DE SCROLL (MOBILE): Impede scroll no body quando o menu abre
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // 2. FECHAR MENU AO MUDAR DE ROTA
  useEffect(() => setIsOpen(false), [location.pathname]);

  // 3. FECHAR MENU CLIQUE FORA (DESKTOP/REDUNDÂNCIA)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 4. SESSÃO DO SUPABASE
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session?.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setHasSession(!!session?.user));
    return () => subscription.unsubscribe();
  }, []);

  // ==========================================
  // CACHE EXTREMA PARA POUPAR API (gcTime + staleTime)
  // ==========================================
  const { data: storeData } = useQuery({
    queryKey: ["store-header-config", storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from("stores").select("name, logo_url").eq("id", storeId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
    staleTime: 1000 * 60 * 60, // 1 hora sem bater na base de dados
    gcTime: 1000 * 60 * 60 * 24, // Fica guardado na memória RAM (Cache) durante 24 horas!
  });

  const { data: pages = [] } = useQuery({
    queryKey: ["pages-menu", storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages").select("slug, title, is_home").eq("store_id", storeId).order("is_home", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!storeId,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 4,
  });

  const navItems = useMemo(() => {
    return pages.map((page) => {
      const fullLabel = page.title || page.slug || t("store_header_page_fallback");
      return {
        key: page.slug || fullLabel,
        to: getPagePath(storeSlug, page),
        fullLabel,
        label: normalizeLabel(fullLabel),
        Icon: getPageIcon(page.title, page.slug),
        isActive: (page.is_home && !pageSlug) || page.slug === pageSlug,
      };
    });
  }, [pages, storeSlug, pageSlug, t]);

  const storeName = (storeData?.name || t("store_header_store_fallback")).trim();
  const activeItem = navItems.find((item) => item.isActive) || null;
  const currentPageLabel = activeItem ? normalizeLabel(activeItem.fullLabel, MAX_CURRENT_PAGE_MOBILE) : t("store_header_menu");

  const authPath = "/auth";
  const explorePath = hasSession ? "/admin/explore" : "/";

  // Função para lidar com imagens partidas ou URLs corrompidas sem quebrar a UI
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_STORE;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 text-slate-900 shadow-[0_2px_10px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-slate-950/90 dark:text-white">
      <div ref={wrapperRef} className="relative mx-auto max-w-7xl">
        
        {/* =========================================
            MOBILE HEADER (ANTI-PULOS)
            ========================================= */}
        <div className="relative flex h-14 items-center px-4 md:hidden">
          <Link to={`/${storeSlug ?? ""}`} className="flex min-w-0 max-w-[42%] items-center gap-3">
            <img 
              src={storeData?.logo_url || FALLBACK_STORE} 
              alt={storeName} 
              width={36} 
              height={36} 
              className="h-9 w-9 shrink-0 rounded-xl border border-slate-200/80 bg-white object-cover shadow-sm dark:border-slate-700" 
              loading="eager"
              onError={handleImageError}
            />
            <span className="block min-w-0 truncate text-[15px] font-bold leading-none tracking-tight text-slate-900 dark:text-white">{normalizeLabel(storeName, MAX_STORE_NAME_MOBILE)}</span>
          </Link>
          
          <button type="button" onClick={() => setIsOpen(!isOpen)} className={`absolute left-1/2 -translate-x-1/2 min-h-[36px] min-w-[100px] max-w-[145px] rounded-full border px-4 py-1.5 transition-colors duration-200 ${isOpen ? "border-slate-900 bg-slate-900 text-white shadow-sm dark:border-white dark:bg-white dark:text-slate-950" : "border-slate-200 bg-white/50 text-slate-700 dark:border-slate-700/50 dark:bg-slate-900/50 dark:text-slate-300"}`}>
            <span className="block truncate text-[12px] font-bold leading-none">{currentPageLabel}</span>
          </button>
          
          <button type="button" onClick={() => setIsOpen(!isOpen)} className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/50 text-slate-700 transition-colors active:bg-slate-100 dark:border-slate-700/50 dark:bg-slate-900/50 dark:text-slate-200 dark:active:bg-slate-800">
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* =========================================
            DESKTOP HEADER (UX & ALTA CONVERSÃO) 
            ========================================= */}
        <div className="hidden h-16 items-center justify-between gap-6 px-6 md:flex lg:px-8">
          
          <Link to={`/${storeSlug ?? ""}`} className="flex shrink-0 items-center gap-3 hover:opacity-80 transition-opacity">
            <img 
              src={storeData?.logo_url || FALLBACK_STORE} 
              alt={storeName} 
              width={44} 
              height={44} 
              className="h-11 w-11 shrink-0 rounded-xl border border-slate-200/80  object-cover shadow-sm dark:border-slate-700" 
              loading="eager"
              onError={handleImageError}
            />
            <span className="block min-w-0 truncate text-[17px] font-extrabold leading-none tracking-tight">{normalizeLabel(storeName, MAX_STORE_NAME_DESKTOP)}</span>
          </Link>

          <nav className="flex-1 min-w-0 flex justify-center" aria-label="Navegação Principal">
            <div 
              className="no-scrollbar flex items-center gap-1 overflow-x-auto px-4 max-w-full"
              style={{ maskImage: "linear-gradient(to right, transparent, black 3%, black 97%, transparent)" }}
            >
              {navItems.map((item) => (
                <DesktopNavItem key={item.key} to={item.to} label={item.label} fullLabel={item.fullLabel} isActive={item.isActive} Icon={item.Icon} />
              ))}
            </div>
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            {hasSession ? (
              <HeaderAssistButton to={explorePath} label={t("store_header_back_admin")} icon={<LayoutDashboard size={18} />} variant="primary" />
            ) : (
              <>
                <HeaderAssistButton to={explorePath} label={t("nav_home")} icon={<Compass size={18} />} variant="secondary" />
                <HeaderAssistButton to={authPath} label={t("store_header_create_account")} icon={<LogIn size={18} />} variant="primary" />
              </>
            )}
          </div>
        </div>

        {/* COMPONENTE MOBILE MENU */}
        <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} navItems={navItems} hasSession={hasSession} t={t} explorePath={explorePath} authPath={authPath} />
      </div>
    </header>
  );
});