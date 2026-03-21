import { memo, useState, useEffect, useMemo, useRef } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabase";

type StoreHeaderProps = {
  storeId: string;
};

type StoreData = {
  name: string | null;
  logo_url: string | null;
};

type PageItem = {
  slug: string;
  title: string | null;
  is_home: boolean | null;
};

const MAX_LABEL_LENGTH = 24;
const MAX_STORE_NAME_MOBILE = 14;
const MAX_STORE_NAME_DESKTOP = 22;
const MAX_CURRENT_PAGE_MOBILE = 18;

function normalizeLabel(text?: string | null, max = MAX_LABEL_LENGTH) {
  const value = (text || "").trim();
  if (!value) return "Página";
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}…`;
}

function getPagePath(storeSlug?: string, page?: PageItem) {
  if (!storeSlug || !page) return "/";
  return page.is_home ? `/${storeSlug}` : `/${storeSlug}/${page.slug}`;
}

const DesktopNavItem = memo(function DesktopNavItem({
  to,
  label,
  fullLabel,
  isActive,
}: {
  to: string;
  label: string;
  fullLabel: string;
  isActive: boolean;
}) {
  return (
    <Link
      to={to}
      title={fullLabel}
      className={[
        "group relative shrink-0 rounded-xl px-3 py-2",
        "max-w-[160px] overflow-hidden",
        "text-[11px] font-bold uppercase tracking-[0.14em]",
        "transition-colors duration-200",
        isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-900",
      ].join(" ")}
    >
      <span className="block truncate">{label}</span>
      <span
        className={[
          "absolute left-3 right-3 bottom-1 h-[2px] rounded-full transition-opacity duration-200",
          isActive ? "bg-blue-600 opacity-100" : "bg-slate-300 opacity-0 group-hover:opacity-60",
        ].join(" ")}
      />
    </Link>
  );
});

const MobileNavItem = memo(function MobileNavItem({
  to,
  label,
  fullLabel,
  isActive,
}: {
  to: string;
  label: string;
  fullLabel: string;
  isActive: boolean;
}) {
  return (
    <Link
      to={to}
      title={fullLabel}
      className={[
        "group flex items-center justify-between  px-4 py-3.5  p-4 rounded-2xl font-bold transition-all",
        " transition-all duration-200",
        isActive
          ? "border-blue-600 bg-blue-600 text-white"
          : "bg-slate-50 text-slate-700 active:bg-slate-100 ",
      ].join(" ")}
      
    >
      <div className="min-w-0">
        <span className="block truncate text-sm font-semibold">{label}</span>
      </div>

      <ChevronRight
        size={16}
        className={[
          "shrink-0 transition-transform duration-200",
          isActive ? "text-white" : "text-slate-300 group-hover:translate-x-0.5",
        ].join(" ")}
      />
    </Link>
    
  );
});

export const StoreHeader = memo(function StoreHeader({
  storeId,
}: StoreHeaderProps) {
  const { storeSlug, pageSlug } = useParams();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: storeData } = useQuery<StoreData | null>({
    queryKey: ["store-header-config", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("name, logo_url")
        .eq("id", storeId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: pages = [] } = useQuery<PageItem[]>({
    queryKey: ["pages-menu", storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("slug, title, is_home")
        .eq("store_id", storeId)
        .order("is_home", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!storeId,
    staleTime: 60 * 1000,
  });

  const navItems = useMemo(() => {
    return pages.map((page) => {
      const fullLabel = page.title || page.slug || "Página";
      const label = normalizeLabel(fullLabel);
      const isActive = (page.is_home && !pageSlug) || page.slug === pageSlug;

      return {
        key: page.slug || fullLabel,
        to: getPagePath(storeSlug, page),
        fullLabel,
        label,
        isActive,
      };
    });
  }, [pages, storeSlug, pageSlug]);

  const storeName = useMemo(() => {
    const raw = (storeData?.name || "Store").trim();
    return raw || "Store";
  }, [storeData?.name]);

  const activeItem = useMemo(() => {
    return navItems.find((item) => item.isActive) || null;
  }, [navItems]);

  const currentPageLabel = useMemo(() => {
    if (!activeItem) return "Menu";
    return normalizeLabel(activeItem.fullLabel, MAX_CURRENT_PAGE_MOBILE);
  }, [activeItem]);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <header
      ref={wrapperRef}
      className="sticky top-0 z-[100]  bg-[#fcfcfd]/95"
    >
      <div className="relative mx-auto max-w-7xl">
        {/* MOBILE */}
        <div className="relative flex h-16 items-center px-4 md:hidden">
          <Link
            to={`/${storeSlug ?? ""}`}
            className="flex min-w-0 max-w-[42%] items-center gap-3"
            aria-label={storeName}
            title={storeName}
          >
            {storeData?.logo_url ? (
              <img
                src={storeData.logo_url}
                alt={storeName}
                className="h-9 w-9 shrink-0 rounded-2xl border border-slate-200 bg-white object-cover"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xs font-black uppercase text-white">
                {storeName.charAt(0)}
              </div>
            )}

            <span
              className="block min-w-0 truncate text-[14px] font-bold tracking-tight text-slate-900"
              title={storeName}
            >
              {normalizeLabel(storeName, MAX_STORE_NAME_MOBILE)}
            </span>
          </Link>

          <button
            type="button"
            onClick={toggleMenu}
            title={activeItem?.fullLabel || "Menu"}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isOpen}
            className={[
              "absolute left-1/2 -translate-x-1/2",
              "max-w-[140px] min-w-[92px]",
              "rounded-2xl border px-4 py-2",
              "transition-colors duration-200",
              isOpen
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100",
            ].join(" ")}
          >
            <span className="block truncate text-[12px] font-semibold">
              {currentPageLabel}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleMenu}
            className="ml-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition-colors duration-200 hover:bg-slate-50"
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* DESKTOP */}
        <div className="hidden h-16 items-center px-5 lg:px-6 md:grid md:grid-cols-[minmax(180px,1fr)_auto_minmax(180px,1fr)]">
          <Link
            to={`/${storeSlug ?? ""}`}
            className="flex min-w-0 items-center gap-3"
            aria-label={storeName}
            title={storeName}
          >
            {storeData?.logo_url ? (
              <img
                src={storeData.logo_url}
                alt={storeName}
                className="h-10 w-10 shrink-0 rounded-2xl border border-slate-200 bg-white object-cover"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xs font-black uppercase text-white">
                {storeName.charAt(0)}
              </div>
            )}

            <span
              className="block min-w-0 truncate text-[15px] font-bold tracking-tight text-slate-900"
              title={storeName}
            >
              {normalizeLabel(storeName, MAX_STORE_NAME_DESKTOP)}
            </span>
          </Link>

          <nav className="justify-self-center">
            <div className="no-scrollbar flex max-w-[56vw] items-center justify-center gap-1 overflow-x-auto px-2">
              {navItems.map((item) => (
                <DesktopNavItem
                  key={item.key}
                  to={item.to}
                  label={item.label}
                  fullLabel={item.fullLabel}
                  isActive={item.isActive}
                />
              ))}
            </div>
          </nav>

          <div />
        </div>

        {/* MOBILE DROPDOWN */}
        <div
          className={[
            "absolute left-0 right-0 top-full md:hidden",
            "origin-top transition-all duration-200 ease-out",
            isOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-1 opacity-0",
          ].join(" ")}
        >
          <div className="border-t border-slate-100/10 bg-[#fcfcfd] ">
            <div className=" border-slate-100 px-4 mt-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Navigation
                  </div>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-3">
              
              <div className="space-y-2">
                {navItems.map((item) => (
                  <MobileNavItem
                    key={item.key}
                    to={item.to}
                    label={item.fullLabel}
                    fullLabel={item.fullLabel}
                    isActive={item.isActive}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});