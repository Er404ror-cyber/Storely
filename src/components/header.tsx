import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  ChevronRight,
  Compass,
  FileBadge,
  FileText,
  Gem,
  Home,
  Image as ImageIcon,
  Info,
  LayoutDashboard,
  LogIn,
  MapPin,
  Menu,
  Package,
  Phone,
  ShoppingBag,
  Star,
  Truck,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useTranslate } from "../context/LanguageContext";

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
  if (!value) return "Page";
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}…`;
}

function normalizeText(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getPageIcon(title?: string | null, slug?: string | null): LucideIcon {
  const text = `${normalizeText(title)} ${normalizeText(slug)}`;

  if (
    text.includes("home") ||
    text.includes("inicio") ||
    text.includes("início") ||
    text.includes("start")
  ) {
    return Home;
  }

  if (
    text.includes("shop") ||
    text.includes("store") ||
    text.includes("catalog") ||
    text.includes("catalogo") ||
    text.includes("catálogo") ||
    text.includes("product") ||
    text.includes("produto")
  ) {
    return ShoppingBag;
  }

  if (
    text.includes("portfolio") ||
    text.includes("portifolio") ||
    text.includes("port") ||
    text.includes("works") ||
    text.includes("project") ||
    text.includes("projeto")
  ) {
    return Briefcase;
  }

  if (
    text.includes("cv") ||
    text.includes("resume") ||
    text.includes("curriculo") ||
    text.includes("currículo")
  ) {
    return FileBadge;
  }

  if (
    text.includes("gallery") ||
    text.includes("galeria") ||
    text.includes("photo") ||
    text.includes("foto") ||
    text.includes("image") ||
    text.includes("imagem")
  ) {
    return ImageIcon;
  }

  if (
    text.includes("location") ||
    text.includes("map") ||
    text.includes("morada") ||
    text.includes("address") ||
    text.includes("localizacao") ||
    text.includes("localização")
  ) {
    return MapPin;
  }

  if (
    text.includes("contact") ||
    text.includes("contacto") ||
    text.includes("contato") ||
    text.includes("support") ||
    text.includes("suporte")
  ) {
    return Phone;
  }

  if (
    text.includes("about") ||
    text.includes("sobre") ||
    text.includes("info") ||
    text.includes("information")
  ) {
    return Info;
  }

  if (
    text.includes("order") ||
    text.includes("pedido") ||
    text.includes("checkout") ||
    text.includes("cart") ||
    text.includes("carrinho")
  ) {
    return FileText;
  }

  if (
    text.includes("delivery") ||
    text.includes("entrega") ||
    text.includes("shipping") ||
    text.includes("envio")
  ) {
    return Truck;
  }

  if (
    text.includes("premium") ||
    text.includes("luxury") ||
    text.includes("luxo")
  ) {
    return Gem;
  }

  if (
    text.includes("collection") ||
    text.includes("colecao") ||
    text.includes("coleção")
  ) {
    return Package;
  }

  return Star;
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
  Icon,
}: {
  to: string;
  label: string;
  fullLabel: string;
  isActive: boolean;
  Icon: LucideIcon;
}) {
  return (
    <Link
      to={to}
      title={fullLabel}
      className={[
        "group relative shrink-0 rounded-xl px-3 py-2",
        "max-w-[180px] overflow-hidden",
        "text-[11px] font-bold uppercase tracking-[0.12em]",
        "transition-colors duration-200",
        isActive
          ? "text-slate-950 dark:text-white"
          : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white",
      ].join(" ")}
    >
      <span className="flex items-center gap-2 truncate">
        <Icon size={14} className="shrink-0" />
        <span className="truncate">{label}</span>
      </span>

      <span
        className={[
          "absolute bottom-1 left-3 right-3 h-[2px] rounded-full transition-opacity duration-200",
          isActive
            ? "bg-slate-950 opacity-100 dark:bg-white"
            : "bg-slate-400 opacity-0 group-hover:opacity-50 dark:bg-slate-500",
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
  Icon,
}: {
  to: string;
  label: string;
  fullLabel: string;
  isActive: boolean;
  Icon: LucideIcon;
}) {
  return (
    <Link
      to={to}
      title={fullLabel}
      className={[
        "group flex items-center justify-between rounded-2xl p-4 font-bold transition-colors duration-200",
        isActive
          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950"
          : "bg-slate-50 text-slate-700 active:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:active:bg-slate-800",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Icon size={18} className="shrink-0" />
        <span className="block truncate text-sm font-semibold">{label}</span>
      </div>

      <ChevronRight
        size={16}
        className={[
          "shrink-0 transition-transform duration-200",
          isActive
            ? "text-white dark:text-slate-950"
            : "text-slate-300 group-hover:translate-x-0.5 dark:text-slate-500",
        ].join(" ")}
      />
    </Link>
  );
});

const HeaderAssistButton = memo(function HeaderAssistButton({
  to,
  label,
  icon,
  primary = false,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <Link
      to={to}
      className={[
        "inline-flex items-center gap-2 rounded-full px-4 py-2",
        "text-[10px] font-black uppercase tracking-[0.14em]",
        "transition-colors duration-200",
        primary
          ? "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          : "border border-slate-300/80 bg-white/85 text-slate-700 hover:bg-white dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-200 dark:hover:bg-slate-900",
      ].join(" ")}
    >
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </Link>
  );
});

export const StoreHeader = memo(function StoreHeader({
  storeId,
}: StoreHeaderProps) {
  const { t } = useTranslate();
  const { storeSlug, pageSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [hasSession, setHasSession] = useState(false);

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

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setHasSession(!!data.session?.user);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setHasSession(!!session?.user);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
      const fullLabel =
        page.title || page.slug || t("store_header_page_fallback");
      const label = normalizeLabel(fullLabel);
      const isActive = (page.is_home && !pageSlug) || page.slug === pageSlug;

      return {
        key: page.slug || fullLabel,
        to: getPagePath(storeSlug, page),
        fullLabel,
        label,
        Icon: getPageIcon(page.title, page.slug),
        isActive,
      };
    });
  }, [pages, storeSlug, pageSlug, t]);

  const storeName = useMemo(() => {
    const raw = (storeData?.name || t("store_header_store_fallback")).trim();
    return raw || t("store_header_store_fallback");
  }, [storeData?.name, t]);

  const activeItem = useMemo(() => {
    return navItems.find((item) => item.isActive) || null;
  }, [navItems]);

  const currentPageLabel = useMemo(() => {
    if (!activeItem) return t("store_header_menu");
    return normalizeLabel(activeItem.fullLabel, MAX_CURRENT_PAGE_MOBILE);
  }, [activeItem, t]);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const authPath = "/auth";
  const explorePath = hasSession ? "/admin/explore" : "/";

  return (
    <header className="sticky top-0 z-[100] border-b border-slate-200/70 bg-white/82 text-slate-900 shadow-[0_8px_30px_rgba(15,23,42,0.05)]   dark:border-white/10 dark:bg-slate-950/78 dark:text-white dark:shadow-[0_8px_30px_rgba(2,6,23,0.22)] ">
      <div ref={wrapperRef} className="relative mx-auto max-w-7xl">
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
                className="h-9 w-9 shrink-0 rounded-2xl border border-slate-200/80 bg-white object-cover dark:border-slate-700 dark:bg-slate-900"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xs font-black uppercase text-white dark:bg-white dark:text-slate-950">
                {storeName.charAt(0)}
              </div>
            )}

            <span
              className="block min-w-0 truncate text-[14px] font-bold tracking-tight text-slate-900 dark:text-white"
              title={storeName}
            >
              {normalizeLabel(storeName, MAX_STORE_NAME_MOBILE)}
            </span>
          </Link>

          <button
            type="button"
            onClick={toggleMenu}
            title={activeItem?.fullLabel || t("store_header_menu")}
            aria-label={
              isOpen ? t("store_header_close_menu") : t("store_header_open_menu")
            }
            aria-expanded={isOpen}
            className={[
              "absolute left-1/2 -translate-x-1/2",
              "min-w-[92px] max-w-[145px]",
              "rounded-2xl border px-4 py-2 transition-colors duration-200",
              isOpen
                ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950"
                : "border-slate-200 bg-white/85 text-slate-700 hover:bg-white dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-200 dark:hover:bg-slate-900",
            ].join(" ")}
          >
            <span className="block truncate text-[12px] font-semibold">
              {currentPageLabel}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleMenu}
            className="ml-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white/85 text-slate-700 transition-colors duration-200 hover:bg-white dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-200 dark:hover:bg-slate-900"
            aria-label={
              isOpen ? t("store_header_close_menu") : t("store_header_open_menu")
            }
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="hidden h-16 items-center px-5 md:grid md:grid-cols-[minmax(180px,1fr)_auto_minmax(260px,1fr)] lg:px-6">
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
                className="h-10 w-10 shrink-0 rounded-2xl border border-slate-200/80 bg-white object-cover dark:border-slate-700 dark:bg-slate-900"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xs font-black uppercase text-white dark:bg-white dark:text-slate-950">
                {storeName.charAt(0)}
              </div>
            )}

            <span
              className="block min-w-0 truncate text-[15px] font-bold tracking-tight text-slate-900 dark:text-white"
              title={storeName}
            >
              {normalizeLabel(storeName, MAX_STORE_NAME_DESKTOP)}
            </span>
          </Link>

          <nav className="justify-self-center">
            <div className="no-scrollbar flex max-w-[50vw] items-center justify-center gap-1 overflow-x-auto px-2">
              {navItems.map((item) => (
                <DesktopNavItem
                  key={item.key}
                  to={item.to}
                  label={item.label}
                  fullLabel={item.fullLabel}
                  isActive={item.isActive}
                  Icon={item.Icon}
                />
              ))}
            </div>
          </nav>

          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">

              {hasSession ? (
                <HeaderAssistButton
                  to={explorePath}
                  label={t("store_header_back_admin")}
                  icon={<LayoutDashboard size={16} />}
                  primary
                />
              ) : (
                <div className="space-x-2 ">
 <HeaderAssistButton
                to={explorePath}
                label={t("nav_home")}
                icon={<Compass size={16} />}
              />
                <HeaderAssistButton
                  to={authPath}
                  label={t("store_header_create_account")}
                  icon={<LogIn size={16} />}
                />
                                </div>

              )}
            </div>
          </div>
        </div>

        <div
          className={[
            "absolute left-0 right-0 top-full md:hidden",
            "origin-top transition-all duration-200 ease-out",
            isOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-1 opacity-0",
          ].join(" ")}
        >
          <div className="border-b border-slate-200/70 bg-white/95  dark:border-slate-800 dark:bg-slate-950/95">
            <div className="space-y-5 p-4">
              <div>
                <div className="mb-3 px-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  {t("store_header_navigation")}
                </div>

                <div className="max-h-[52vh] overflow-y-auto">
                  <div className="space-y-2.5">
                    {navItems.map((item) => (
                      <MobileNavItem
                        key={item.key}
                        to={item.to}
                        label={item.fullLabel}
                        fullLabel={item.fullLabel}
                        isActive={item.isActive}
                        Icon={item.Icon}
                      />
                    ))}
                  </div>
                </div>
              </div>

             

              {hasSession ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5 dark:border-slate-800 dark:bg-slate-900/90">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    {t("store_header_account_area")}
                  </p>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate(explorePath);
                      }}
                      className="flex w-full items-center justify-between rounded-2xl bg-slate-900 px-4 py-3.5 text-left text-white transition-colors duration-200 active:bg-slate-800 dark:bg-white dark:text-slate-950 dark:active:bg-slate-200"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <LayoutDashboard size={18} className="shrink-0" />
                        <span className="truncate text-sm font-bold">
                          {t("store_header_back_admin")}
                        </span>
                      </div>
                      <ChevronRight
                        size={16}
                        className="shrink-0 opacity-80 dark:text-slate-950"
                      />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
 <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5 dark:border-slate-800 dark:bg-slate-900/90">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  {t("store_header_discover_more")}
                </p>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      navigate(explorePath);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left text-slate-700 transition-colors duration-200 active:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:active:bg-slate-900"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Compass size={18} className="shrink-0" />
                      <span className="truncate text-sm font-bold">
                        {t("nav_home")}
                      </span>
                    </div>
                    <ChevronRight
                      size={16}
                      className="shrink-0 text-slate-400 dark:text-slate-500"
                    />
                  </button>
                </div>
              </div>



                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-3.5 dark:border-slate-800 dark:bg-slate-900/90">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    {t("store_header_new_here")}
                  </p>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate(authPath);
                      }}
                      className="flex w-full items-center justify-between rounded-2xl bg-slate-900 px-4 py-3.5 text-left text-white transition-colors duration-200 active:bg-slate-800 dark:bg-white dark:text-slate-950 dark:active:bg-slate-200"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <LogIn size={18} className="shrink-0" />
                        <span className="truncate text-sm font-bold">
                          {t("store_header_create_account")}
                        </span>
                      </div>
                      <ChevronRight
                        size={16}
                        className="shrink-0 opacity-80 dark:text-slate-950"
                      />
                    </button>
                  </div>
                </div>
                </div>

              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});