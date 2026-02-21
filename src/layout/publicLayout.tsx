import { Outlet, useParams } from "react-router-dom";
import { StoreHeader } from "../components/header";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";

export function PublicLayout() {
  const { storeSlug } = useParams();
  const mascotImages = ["/img/Mascote.png", "/img/Mascote2.png", "/img/Mascote4.png"];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % mascotImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [mascotImages.length]);

  const { data: store, isLoading, isError } = useQuery({
    queryKey: ["store-public", storeSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("id, name, settings, logo_url")
        .eq("slug", storeSlug)
        .single();
      if (error) throw error;
      return data;
    },
    refetchInterval: 1500
  });

  if (isLoading) return <div className="h-screen flex items-center justify-center animate-pulse text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Loading Store...</div>;
  if (isError || !store) return <div className="h-screen flex items-center justify-center font-black italic text-slate-400">404 | STORE NOT FOUND</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <StoreHeader storeId={store.id} />
      
      <main className="flex-1">
        <Outlet context={{ storeId: store.id }} />
      </main>

      <footer className="relative w-full border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-black transition-colors duration-500">
        
        <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-4">
            
            {/* Brand + Mascot Container */}
            <div className="relative flex flex-col items-center md:items-start group">
              
              {/* Mascot - Positioned above Brand */}
              <div className="absolute -top-[65px] flex flex-col items-center pointer-events-none select-none">
                <img
                  src={mascotImages[activeIndex]}
                  alt="Mascot"
                  className="h-24 md:h-22 w-full w-auto object-contain transition-all duration-1000 ease-in-out  group-hover:-translate-y-1"
                />
                <div className="w-8 h-1 bg-black/5 dark:bg-cyan-400/10 rounded-full mt-1" />
              </div>

              {/* Brand Text */}
              <span className="text-[11px] font-black tracking-[0.5em] uppercase bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent pt-2">
                STORELY
              </span>
            </div>

            {/* Center: Copyright */}
            <div className="flex flex-col items-center justify-center order-3 md:order-2">
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 font-medium text-center leading-relaxed">
                © {new Date().getFullYear()} {store.name} <br className="md:hidden" />
                <span className="hidden md:inline mx-2 opacity-30">•</span> 
                Storely All Rights Reserved
              </span>
            </div>

            {/* Right: Socials */}
            <div className="flex justify-center md:justify-end gap-5 order-2 md:order-3">
              {['whatsapp', 'instagram', 'twitter', 'github'].map(icon => (
                <a 
                  key={icon}
                  href="#"
                  className="opacity-40 hover:opacity-100 hover:scale-110 transition-all duration-300 dark:invert"
                >
                  <img 
                    src={`/img/${icon}.png`} 
                    alt={icon} 
                    className="h-3.5 w-3.5" 
                  />
                </a>
              ))}
            </div>

          </div>
        </div>
      </footer>
    </div>
  );
}