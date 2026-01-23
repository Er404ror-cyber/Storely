import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { SectionLibrary } from '../../components/sections/SectionLibrary';

export function PageView() {
  const { storeSlug, pageSlug } = useParams();
  const hasInjectedSlug = useRef(false);

  const { data: pageData, isLoading, isError } = useQuery({
    queryKey: ['public-page', storeSlug, pageSlug],
    queryFn: async () => {
      // OTIMIZAÇÃO 1: Busca a loja e a página em paralelo para economizar latência
      const { data: store, error: sErr } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', storeSlug)
        .single();
      
      if (sErr || !store) throw new Error('Loja não encontrada');

      // OTIMIZAÇÃO 2: Busca apenas o ID e o Slug da página necessária
      let pageQuery = supabase
        .from('pages')
        .select('id, slug')
        .eq('store_id', store.id);

      if (pageSlug) {
        pageQuery = pageQuery.eq('slug', pageSlug);
      } else {
        pageQuery = pageQuery.eq('is_home', true);
      }

      const { data: page, error: pErr } = await pageQuery.single();
      if (pErr || !page) throw new Error('Página não encontrada');

      // OTIMIZAÇÃO 3: Busca as seções
      const { data: sections } = await supabase
        .from('page_sections')
        .select('id, type, content, style') // Seleciona apenas o necessário
        .eq('page_id', page.id)
        .order('order_index', { ascending: true });

      return { sections, resolvedSlug: page.slug };
    },
    refetchInterval: 1000, // Pergunta ao banco a cada 1 segundo (quase instantâneo)
    refetchIntervalInBackground: true, // Continua atualizando mesmo se o usuário mudar de aba
    staleTime: 0, // Considera os dados velhos imediatamente para sempre buscar o novo
    gcTime: 1000 * 60 * 10, 
    placeholderData: (previousData) => previousData, // CHAVE: Mantém o conteúdo atual na tela enquanto baixa o novo (Zero Flicker)
  });

  // OTIMIZAÇÃO 5: Injeção de URL via History API (Zero flicker)
  useEffect(() => {
    if (pageData?.resolvedSlug && !pageSlug && !hasInjectedSlug.current) {
      const canonicalPath = `/${storeSlug}/${pageData.resolvedSlug}`;
      window.history.replaceState({ ...window.history.state }, '', canonicalPath);
      hasInjectedSlug.current = true;
    }
  }, [pageData?.resolvedSlug, pageSlug, storeSlug]);

  if (isLoading) return null; // Ou um skeleton muito leve para não haver "salto" visual

  if (isError) return (
    <div className="h-screen flex items-center justify-center font-black uppercase text-slate-300 tracking-tighter">
      404 | Not Found
    </div>
  );

  return (
    <main className="w-full bg-white transition-opacity duration-300 ease-in animate-in fade-in">
      {pageData?.sections?.map((s) => {
        const Comp = SectionLibrary[s.type as keyof typeof SectionLibrary];
        if (!Comp) return null;

        return (
          <section 
            key={s.id} 
            className={`w-full ${s.style?.theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
            style={{ textAlign: s.style?.align || 'left' }}
          >
            <Comp content={s.content} style={s.style} />
          </section>
        );
      })}
    </main>
  );
}