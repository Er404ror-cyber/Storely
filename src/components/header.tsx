import { memo, useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabase";

export const StoreHeader = memo(({ storeId }: { storeId: string }) => {
  const { storeSlug, pageSlug } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Fecha o menu ao mudar de página
  useEffect(() => setIsOpen(false), [location.pathname]);

  const { data: storeData } = useQuery({
    queryKey: ["store-header-config", storeId],
    queryFn: async () => {
      const { data } = await supabase.from("stores").select("name, logo_url").eq("id", storeId).single();
      return data;
    },
    enabled: !!storeId,
  });

  const { data: pages } = useQuery({
    queryKey: ["pages-menu", storeId],
    queryFn: async () => {
      const { data } = await supabase.from("pages").select("slug, title, is_home").eq("store_id", storeId).order("is_home", { ascending: false });
      return data;
    },
    enabled: !!storeId,
  });

  return (
    <header className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="flex items-center justify-between px-5 h-16 max-w-7xl mx-auto">
        
        {/* LOGO */}
        <Link to={`/${storeSlug}`} className="z-[110]">
          {storeData?.logo_url ? (
            <img src={storeData.logo_url} alt="Logo" className="h-6 w-auto" />
          ) : (
            <span className="font-black italic text-slate-900 tracking-tighter text-xl uppercase">
              {storeData?.name}<span className="text-blue-600">.</span>
            </span>
          )}
        </Link>

    

        {/* NAV DESKTOP (Invisível no Mobile) */}
        <nav className="hidden md:flex items-center gap-8">
        {pages?.map(p => {
          // LÓGICA DINÂMICA DE ATIVAÇÃO:
          // Se não houver pageSlug na URL e esta página for a Home -> ATIVA
          // Se o pageSlug na URL for igual ao slug desta página -> ATIVA
          const isLinkToHome = p.is_home;
          const isActive = (isLinkToHome && !pageSlug) || (p.slug === pageSlug);
          
          // Se for home, o link é apenas o domínio da loja
          const path = isLinkToHome ? `/${storeSlug}` : `/${storeSlug}/${p.slug}`;

          return (
            <Link 
              key={p.slug} 
              to={path} 
              className={`relative py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all group ${
                isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {p.title || p.slug}
              
              {/* Barra indicadora que atualiza quando a Home muda */}
              <span className={`absolute bottom-0 left-0 h-[2px] bg-blue-600 transition-all duration-500 ${
                isActive ? 'w-full' : 'w-0 group-hover:w-full opacity-20'
              }`} />
            </Link>
          );
        })}
      </nav>
        {/* BOTÃO MOBILE E AÇÃO DESKTOP */}
        <div className="flex items-center gap-4 z-[110]">
          <button className="hidden md:block bg-slate-900 text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all">
            Contato
          </button>
          
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 bg-slate-50 rounded-xl text-slate-900 active:scale-90 transition-all md:hidden"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MENU MOBILE DROP-DOWN (Compacto e com Scroll) */}
      <div className={`absolute top-0 left-0 w-full bg-white border-b shadow-2xl transition-all duration-300 ease-in-out md:hidden overflow-hidden ${
        isOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
      }`}>
        <div className="pt-20 pb-6 px-6 overflow-y-auto max-h-[70vh]">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Navegação</p>
          <div className="grid gap-2">
            {pages?.map((p) => {
              const isActive = (p.is_home && !pageSlug) || (p.slug === pageSlug);
              return (
                <Link
                  key={p.slug}
                  to={p.is_home ? `/${storeSlug}` : `/${storeSlug}/${p.slug}`}
                  className={`flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700 active:bg-slate-100'
                  }`}
                >
                  <span className="text-sm uppercase tracking-tight">{p.title || p.slug}</span>
                  <ChevronRight size={16} className={isActive ? 'text-white' : 'text-slate-300'} />
                </Link>
              );
            })}
          </div>
          
          <div className="mt-6">
            <button className="w-full bg-slate-900 text-white p-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
              Falar Connosco
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});