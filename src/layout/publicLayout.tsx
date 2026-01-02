import { Outlet, useParams } from "react-router-dom";
import { StoreHeader } from "../components/header";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export function PublicLayout() {
  const { storeSlug } = useParams();

  // Busca o ID e os dados da loja usando o SLUG da URL
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
    refetchInterval: 1500 // Sincroniza o nome/logo em tempo real
  });

  if (isLoading) return <div className="h-screen flex items-center justify-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-[10px]">Carregando Loja...</div>;
  
  if (isError || !store) return <div className="h-screen flex items-center justify-center font-black italic text-slate-400">404 | LOJA NÃO ENCONTRADA</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Agora passamos o ID REAL (UUID) para o Header, não o slug */}
      <StoreHeader storeId={store.id} />
      
      <main className="flex-1">
        <Outlet context={{ storeId: store.id }} />
      </main>

      <footer className="p-8 text-center text-[9px] text-slate-300 font-black uppercase tracking-[0.3em]">
        © {new Date().getFullYear()} {store.name}
      </footer>
    </div>
  );
}