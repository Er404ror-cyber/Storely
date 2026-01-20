import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { UploadCloud, Loader2 } from 'lucide-react';

// --- Interfaces para Type Safety ---

interface StoreSettings {
  headerTheme?: 'light' | 'dark';
  [key: string]: unknown;
}

interface StoreData {
  id: string;
  name: string;
  settings: StoreSettings;
  logo_url?: string;
}

interface StoreUpdatePayload {
  name?: string;
  settings?: StoreSettings;
  logo_url?: string;
}

export function AdminHeaderSettings() {
  const { storeId } = useParams<{ storeId: string }>(); // Obtém o ID da URL
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  // 1. Busca as configurações atuais
  const { data: store, isLoading } = useQuery<StoreData>({
    queryKey: ["admin-store-settings", storeId],
    queryFn: async () => {
      if (!storeId) throw new Error("ID da loja não fornecido");
      
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", storeId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!storeId // Só executa se houver um ID
  });

  // 2. Mutação para salvar dados (Sem 'any')
  const saveMutation = useMutation({
    mutationFn: async (newData: StoreUpdatePayload) => {
      if (!storeId) throw new Error("ID da loja não encontrado");
      
      const { error } = await supabase
        .from("stores")
        .update(newData)
        .eq("id", storeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-store-settings", storeId] });
      queryClient.invalidateQueries({ queryKey: ["store-header-config"] });
    },
    onError: (error: Error) => {
      alert("Erro ao salvar: " + error.message);
    }
  });

  // 3. Lógica de Upload do Logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storeId) return;

    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${storeId}-logo-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('store-assets')
        .getPublicUrl(filePath);

      await saveMutation.mutateAsync({ logo_url: publicUrl });
      
    } catch (error) {
      console.error("Upload error:", error);
      alert("Falha ao carregar imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!storeId) return <div className="p-10 text-center text-red-500 font-bold">Erro: storeId não encontrado na URL.</div>;
  if (isLoading) return <div className="p-10 text-center animate-pulse font-bold text-xs text-slate-400">Sincronizando...</div>;

  return (
    <div className="max-w-2xl mx-auto p-10 bg-white rounded-[3rem] border border-slate-100 shadow-2xl space-y-10">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b pb-6">
        <h2 className="text-2xl font-black tracking-tighter uppercase italic text-slate-800">Visual do Site</h2>
        {saveMutation.isPending && <Loader2 className="animate-spin text-blue-600" size={20} />}
      </div>

      <div className="space-y-8">
        {/* NOME DO SITE */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
            Nome Exibido no Header
          </label>
          <input 
            key={store?.name} 
            defaultValue={store?.name}
            placeholder="Ex: Minha Empresa"
            className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none font-bold transition-all text-slate-700"
            onBlur={(e) => {
              if (e.target.value !== store?.name) {
                saveMutation.mutate({ name: e.target.value });
              }
            }}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* SELETOR DE TEMA */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Modo de Cor</label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
              {(['light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => saveMutation.mutate({ 
                    settings: { ...store?.settings, headerTheme: t } 
                  })}
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

          {/* UPLOAD DO LOGO */}
          <div className="space-y-3 flex flex-col items-center">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Logotipo</label>
             <label className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all shadow-lg active:scale-95 ${
               isUploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600'
             }`}>
               {isUploading ? <Loader2 className="animate-spin" size={14} /> : <UploadCloud size={14} />}
               {isUploading ? 'A carregar...' : 'Mudar Logo'}
               <input 
                 type="file" 
                 className="hidden" 
                 accept="image/*" 
                 disabled={isUploading}
                 onChange={handleLogoUpload} 
               />
             </label>
          </div>
        </div>
      </div>
    </div>
  );
}