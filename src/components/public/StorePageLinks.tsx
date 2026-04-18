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
  ArrowRight,
  Compass,
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
  isHome: boolean;
};

function normalizeText(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function trimLabel(text?: string | null, max = 20) {
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

const NavLinkItem = memo(function NavLinkItem({
  to,
  shortLabel,
  fullLabel,
  active,
  Icon,
  isHome,
  homeBadge,
  navigateLabel,
}: {
  to: string;
  shortLabel: string;
  fullLabel: string;
  active: boolean;
  Icon: LucideIcon;
  isHome: boolean;
  homeBadge: string;
  navigateLabel: string;
}) {
  return (
    <Link
      to={to}
      title={fullLabel}
      aria-label={fullLabel}
      className={[
        "group flex h-[78px] min-w-[216px] max-w-[216px] shrink-0 items-center gap-3 overflow-hidden rounded-2xl border px-3 sm:h-[82px] sm:min-w-[228px] sm:max-w-[228px] sm:px-3.5",
        "transition-colors duration-200",
        active
          ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
          : "border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-500 dark:hover:bg-slate-800/70",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          active
            ? "bg-white/10 dark:bg-slate-200"
            : "bg-slate-100 dark:bg-slate-800",
        ].join(" ")}
      >
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden">
          <span className="truncate text-[13px] font-bold tracking-tight sm:text-[14px]">
            {shortLabel}
          </span>

          {isHome && (
            <span
              className={[
                "shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.16em]",
                active
                  ? "bg-white/10 text-white/80 dark:bg-slate-200 dark:text-slate-900"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300",
              ].join(" ")}
            >
              {homeBadge}
            </span>
          )}
        </div>

        <span
          className={[
            "mt-1 block truncate text-[10px]",
            active
              ? "text-white/65 dark:text-slate-600"
              : "text-slate-500 dark:text-slate-400",
          ].join(" ")}
        >
          {navigateLabel}
        </span>
      </div>

      <div
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          active
            ? "bg-white/10 dark:bg-slate-200"
            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300",
        ].join(" ")}
      >
        <ArrowRight size={14} />
      </div>
    </Link>
  );
});

const SectionSkeleton = memo(function SectionSkeleton({
  title,
}: {
  title: string;
}) {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8 lg:pb-12">
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="h-5 w-28 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
              <div className="mt-3 h-7 w-60 max-w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="h-7 w-14 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
          </div>

          <div className="mt-4 flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[78px] min-w-[216px] rounded-2xl border border-slate-200 bg-slate-50 animate-pulse dark:border-slate-800 dark:bg-slate-900"
              />
            ))}
          </div>

          <span className="sr-only">{title}</span>
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
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
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
        shortLabel: trimLabel(fullLabel, 20),
        active,
        Icon: getPageIcon(page.title, page.slug),
        isHome: !!page.is_home,
      };
    });
  }, [pages, maxItems, t, storeSlug, pageSlug, location.pathname]);

  if (isLoading && !items.length) {
    return <SectionSkeleton title={t("store_page_links_title")} />;
  }

  if (!items.length) return null;

  return (
    <section className={["w-full", className].join(" ")}>
      <div className="mx-auto max-w-7xl px-4 pb-4 pt-4 sm:px-6 lg:px-8 lg:pb-8">
        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="px-4 pb-3 pt-4 sm:px-5 sm:pb-4 sm:pt-5 lg:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Compass size={13} />
                  <span>{t("store_page_links_discover")}</span>
                </div>

                <h2 className="mt-3 text-[18px] font-black tracking-tight text-slate-950 dark:text-white sm:text-[22px] lg:text-[24px]">
                  {t("store_page_links_title")}
                </h2>

                <p className="mt-1.5 max-w-xl text-[12px] leading-5 text-slate-600 dark:text-slate-300 sm:text-[13px]">
                  {t("store_page_links_subtitle")}
                </p>
              </div>

              <div className="shrink-0">
                <span className="inline-flex items-center rounded-full border border-slate-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  {items.length} {t("store_page_links_items")}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 px-3 py-4 dark:border-slate-800 sm:px-5 lg:px-6">
            <div
              className={[
                "flex gap-3 overflow-x-auto pb-1",
                "snap-x snap-mandatory scroll-smooth",
                "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
              ].join(" ")}
            >
              {items.map((item) => (
                <div key={item.key} className="snap-start">
                  <NavLinkItem
                    to={item.to}
                    shortLabel={item.shortLabel}
                    fullLabel={item.fullLabel}
                    active={item.active}
                    Icon={item.Icon}
                    isHome={item.isHome}
                    homeBadge={t("store_page_links_home_badge")}
                    navigateLabel={t("store_page_links_navigate_label")}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});