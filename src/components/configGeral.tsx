import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Save, Palette, UploadCloud, Loader2 } from 'lucide-react';

export function AdminHeaderSettings({ storeId }: { storeId: string }) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  // Busca dados atuais
  const { data: store, isLoading } = useQuery({
    queryKey: ["admin-store-settings", storeId],
    queryFn: async () => {
      const { data } = await supabase.from("stores").select("*").eq("id", storeId).single();
      return data;
    },
    enabled: !!storeId
  });

  // Mutação para salvar no banco
  const saveMutation = useMutation({
    mutationFn: async (newData: any) => {
      const { error } = await supabase.from("stores").update(newData).eq("id", storeId);
      if (error) throw error;
    },
    onSuccess: () => {
      // Limpa o cache para atualizar o site público na hora
      queryClient.invalidateQueries({ queryKey: ["store-header-config"] });
    }
  });

  if (isLoading) return <div className="p-10 text-center animate-pulse font-bold text-xs">Sincronizando...</div>;

  return (
    <div className="max-w-2xl mx-auto p-10 bg-white rounded-[3rem] border border-slate-100 shadow-2xl space-y-10">
      <div className="flex items-center justify-between border-b pb-6">
        <h2 className="text-2xl font-black tracking-tighter uppercase italic text-slate-800">Visual do Site</h2>
        {saveMutation.isPending && <Loader2 className="animate-spin text-blue-600" size={20} />}
      </div>

      <div className="space-y-8">
        {/* NOME DO SITE */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nome Exibido no Header</label>
          <input 
            key={store?.name} // Truque vital: reconstrói o input se o valor no banco mudar
            defaultValue={store?.name}
            placeholder="Ex: Minha Empresa Profissional"
            className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none font-bold transition-all text-slate-700"
            onBlur={(e) => {
              if (e.target.value !== store?.name) {
                saveMutation.mutate({ name: e.target.value });
              }
            }}
          />
        </div>

        {/* TEMA E LOGO */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Modo de Cor</label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
              {['light', 'dark'].map((t) => (
                <button
                  key={t}
                  onClick={() => saveMutation.mutate({ settings: { ...store?.settings, headerTheme: t } })}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    (store?.settings?.headerTheme || 'light') === t 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t === 'light' ? 'Claro' : 'Escuro'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 flex flex-col items-center">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Logotipo</label>
             <label className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-600 transition-all shadow-lg active:scale-95">
               <UploadCloud size={14} /> {isUploading ? 'A carregar...' : 'Mudar Logo'}
               <input type="file" className="hidden" accept="image/*" onChange={(e) => {/* Lógica de upload aqui */}} />
             </label>
          </div>
        </div>
      </div>
    </div>
  );
}