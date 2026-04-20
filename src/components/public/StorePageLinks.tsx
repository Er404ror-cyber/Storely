import { memo, useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
  ShoppingBag,
  Briefcase,
  FileBadge,
  Image as ImageIcon,
  MapPin,
  Phone,
  Info,
  FileText,
  Truck,
  Gem,
  Package,
  Star,
  ChevronRight,
  Navigation,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useTranslate } from "../../context/LanguageContext";

type PageItem = {
  slug: string;
  title: string | null;
  is_home: boolean | null;
};

type StorePageLinksSectionProps = {
  storeId: string;
  maxItems?: number;
  className?: string;
};

type PreparedPageItem = {
  key: string;
  to: string;
  fullLabel: string;
  shortLabel: string;
  active: boolean;
  Icon: LucideIcon;
};

function normalizeText(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function trimLabel(text?: string | null, max = 22) {
  const value = (text || "").trim();
  if (!value) return "Page";
  if (value.length <= max) return value;
  return `${value.slice(0, max).trim()}…`;
}

function getPagePath(storeSlug?: string, page?: PageItem) {
  if (!storeSlug || !page) return "/";
  return page.is_home ? `/${storeSlug}` : `/${storeSlug}/${page.slug}`;
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

const RailDestination = memo(function RailDestination({
  to,
  shortLabel,
  fullLabel,
  Icon,
  openLabel,
}: {
  to: string;
  shortLabel: string;
  fullLabel: string;
  Icon: LucideIcon;
  openLabel: string;
}) {
  return (
    <Link
      to={to}
      title={fullLabel}
      aria-label={fullLabel}
      className={[
        "group flex min-h-[72px] min-w-[220px] max-w-[220px] shrink-0 items-center gap-3 rounded-2xl border px-3.5 py-3",
        "border-slate-200 bg-white text-slate-900",
        "hover:border-slate-300 hover:bg-slate-50",
        "dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:hover:border-slate-700 dark:hover:bg-slate-900",
        "transition-colors duration-200",
      ].join(" ")}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-bold tracking-tight">
          {shortLabel}
        </div>
        <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          {openLabel}
        </div>
      </div>

      <div className="shrink-0 text-slate-400 dark:text-slate-500">
        <ChevronRight size={16} />
      </div>
    </Link>
  );
});

const CurrentStage = memo(function CurrentStage({
  label,
  Icon,
  currentLabel,
}: {
  label: string;
  Icon: LucideIcon;
  currentLabel: string;
}) {
  return (
    <div
      className={[
        "flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5",
        "border-slate-900 bg-slate-900 text-white",
        "dark:border-white dark:bg-white dark:text-slate-950",
      ].join(" ")}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 dark:bg-slate-200">
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-bold tracking-tight">
          {label}
        </div>
        <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-white/70 dark:text-slate-600">
          <CheckCircle2 size={13} />
          <span>{currentLabel}</span>
        </div>
      </div>
    </div>
  );
});

const SectionSkeleton = memo(function SectionSkeleton() {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4 pb-4 pt-3 sm:px-6 lg:px-8 lg:pb-6">
        <div className="w-full rounded-[26px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-2xl bg-slate-100 animate-pulse dark:bg-slate-800" />
            <div className="min-w-0 flex-1">
              <div className="h-4 w-44 rounded-full bg-slate-100 animate-pulse dark:bg-slate-800" />
              <div className="mt-2 h-3 w-64 max-w-full rounded-full bg-slate-100 animate-pulse dark:bg-slate-800" />
            </div>
          </div>

          <div className="mt-5 h-[96px] w-full rounded-[24px] bg-slate-50 animate-pulse dark:bg-slate-900" />
        </div>
      </div>
    </section>
  );
});

export const StorePageLinksSection = memo(function StorePageLinksSection({
  storeId,
  maxItems = 8,
  className = "",
}: StorePageLinksSectionProps) {
  const { t } = useTranslate();
  const { storeSlug, pageSlug } = useParams();
  const location = useLocation();

  const {
    data: pages = [],
    isLoading,
  } = useQuery<PageItem[]>({
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
    staleTime: 1000 * 60 * 60 * 4,
    gcTime: 1000 * 60 * 60 * 8,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const items = useMemo<PreparedPageItem[]>(() => {
    return pages.slice(0, maxItems).map((page) => {
      const fullLabel = page.title || page.slug || t("store_page_links_page");
      const to = getPagePath(storeSlug, page);
      const active = page.is_home
        ? !pageSlug && location.pathname === `/${storeSlug}`
        : page.slug === pageSlug;

      return {
        key: `${page.slug || "home"}-${fullLabel}`,
        to,
        fullLabel,
        shortLabel: trimLabel(fullLabel, 22),
        active,
        Icon: getPageIcon(page.title, page.slug),
      };
    });
  }, [pages, maxItems, t, storeSlug, pageSlug, location.pathname]);

  const currentItem = useMemo(
    () => items.find((item) => item.active) || null,
    [items]
  );

  const destinationItems = useMemo(
    () => items.filter((item) => !item.active),
    [items]
  );

  if (isLoading && !items.length) {
    return <SectionSkeleton />;
  }

  if (!items.length || destinationItems.length === 0) return null;

  return (
    <section className={["w-full", className].join(" ")}>
      <div className="mx-auto max-w-7xl px-4 pb-4 pt-3 sm:px-6 lg:px-8 lg:pb-6">
        <div className="w-full rounded-[26px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-950 dark:shadow-none">
          <div className="px-4 pt-4 sm:px-5 sm:pt-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <Navigation size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
                  {t("store_page_links_title")}
                </h2>
                <p className="mt-1 text-[12px] leading-5 text-slate-500 dark:text-slate-400">
                  {t("store_page_links_subtitle")}
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 sm:px-5">
            <div
              className={[
                "w-full rounded-[24px] border border-slate-200 bg-slate-50/80 p-3",
                "dark:border-slate-800 dark:bg-slate-900/60",
              ].join(" ")}
            >
              <div
                className={[
                  "flex gap-3 overflow-x-auto",
                  "snap-x snap-mandatory scroll-smooth",
                  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
                ].join(" ")}
              >
                {destinationItems.map((item) => (
                  <div key={item.key} className="snap-start">
                    <RailDestination
                      to={item.to}
                      shortLabel={item.shortLabel}
                      fullLabel={item.fullLabel}
                      Icon={item.Icon}
                      openLabel={t("store_page_links_navigate_label")}
                    />
                  </div>
                ))}

                {currentItem ? (
                  <div className="snap-start min-w-[220px] max-w-[220px] shrink-0">
                    <CurrentStage
                      label={currentItem.shortLabel}
                      Icon={currentItem.Icon}
                      currentLabel={t("store_page_links_current_label")}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});