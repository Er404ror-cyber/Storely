import { useParams, Link } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";

export function StorePageNotFound() {
  const { storeSlug } = useParams();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[60vh] text-center animate-in fade-in duration-700">
      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 shadow-inner">
         <AlertCircle size={40} className="text-slate-300" />
      </div>
      
      <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 mb-3">
        Ops! Página Indisponível
      </h2>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 max-w-sm leading-loose mb-10">
        Parece que este caminho não existe mais ou foi movido pelo administrador da loja.
      </p>

      <Link 
        to={`/${storeSlug}`} 
        className="group flex items-center gap-4 bg-slate-900 text-white px-12 py-5 rounded-full font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 transition-all active:scale-95"
      >
        <Home size={18} className="group-hover:-rotate-12 transition-transform" />
        Voltar ao Início da Loja
      </Link>
    </div>
  );
}