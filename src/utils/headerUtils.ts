import {
    Briefcase, Home, ShoppingBag, FileBadge, Image as ImageIcon,
    MapPin, Phone, Info, FileText, Truck, Gem, Package, Star, type LucideIcon
  } from "lucide-react";
  
  export type PageItem = { slug: string; title: string | null; is_home: boolean | null; };
  
  export const MAX_LABEL_LENGTH = 24;
  export const MAX_STORE_NAME_MOBILE = 14;
  export const MAX_STORE_NAME_DESKTOP = 22;
  export const MAX_CURRENT_PAGE_MOBILE = 18;
  
  export function normalizeLabel(text?: string | null, max = MAX_LABEL_LENGTH) {
    const value = (text || "").trim();
    if (!value) return "Page";
    if (value.length <= max) return value;
    return `${value.slice(0, max).trim()}…`;
  }
  
  function normalizeText(value?: string | null) {
    return (value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  }
  
  export function getPageIcon(title?: string | null, slug?: string | null): LucideIcon {
    const text = `${normalizeText(title)} ${normalizeText(slug)}`;
    if (text.includes("home") || text.includes("inicio") || text.includes("início") || text.includes("start")) return Home;
    if (text.includes("shop") || text.includes("store") || text.includes("catalog") || text.includes("catalogo") || text.includes("catálogo") || text.includes("product") || text.includes("produto")) return ShoppingBag;
    if (text.includes("portfolio") || text.includes("portifolio") || text.includes("port") || text.includes("works") || text.includes("project") || text.includes("projeto")) return Briefcase;
    if (text.includes("cv") || text.includes("resume") || text.includes("curriculo") || text.includes("currículo")) return FileBadge;
    if (text.includes("gallery") || text.includes("galeria") || text.includes("photo") || text.includes("foto") || text.includes("image") || text.includes("imagem")) return ImageIcon;
    if (text.includes("location") || text.includes("map") || text.includes("morada") || text.includes("address") || text.includes("localizacao") || text.includes("localização")) return MapPin;
    if (text.includes("contact") || text.includes("contacto") || text.includes("contato") || text.includes("support") || text.includes("suporte")) return Phone;
    if (text.includes("about") || text.includes("sobre") || text.includes("info") || text.includes("information")) return Info;
    if (text.includes("order") || text.includes("pedido") || text.includes("checkout") || text.includes("cart") || text.includes("carrinho")) return FileText;
    if (text.includes("delivery") || text.includes("entrega") || text.includes("shipping") || text.includes("envio")) return Truck;
    if (text.includes("premium") || text.includes("luxury") || text.includes("luxo")) return Gem;
    if (text.includes("collection") || text.includes("colecao") || text.includes("coleção")) return Package;
    return Star;
  }
  
  export function getPagePath(storeSlug?: string, page?: PageItem) {
    if (!storeSlug || !page) return "/";
    return page.is_home ? `/${storeSlug}` : `/${storeSlug}/${page.slug}`;
  }