import { useEffect, useState, useTransition } from 'react';
import { HeaderLog } from '../../components/headerlog';
import Footer from '../../components/footer2';
import { ShowcaseStores } from '../../components/blog/ShowcaseStores';
import { useNavigate, useLocation } from 'react-router-dom'; // Correção: importado useLocation explicitamente
import { Store, ShoppingBag, Sparkles, UserPlus, Search, PlusCircle } from 'lucide-react';
import { useTranslate } from "../../context/LanguageContext";
import { HeroBackgroundMedia } from '../../components/blog/HeroMedia';
import { supabase } from '../../lib/supabase';

export const Blog = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation(); // Correção: Evita quebra se 'location' global estivesse instável
  const { t } = useTranslate();
  const [isPending, startTransition] = useTransition(); // React 18 Transitions para navegação fluida
  const [hasSession, setHasSession] = useState(false);
  const isEditorRoute = pathname.includes("admin");

  useEffect(() => {
    let mounted = true;
  
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      // Atualizações de estado não urgentes são encapsuladas para evitar congelar a UI principal
      startTransition(() => {
        setHasSession(!!data.session?.user);
      });
    }
  
    void loadSession();
  
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      startTransition(() => {
        setHasSession(!!session?.user);
      });
    });
  
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handlePrimaryClick = () => {
    document
      .getElementById("marketplace-showcase")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSecondaryClick = () => {
    const route = hasSession ? "/admin/produtos" : "/auth";
    startTransition(() => {
      navigate(route);
    });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
      {!isEditorRoute && <HeaderLog />}

      <main className="mx-auto max-w-[1440px] pb-16">
        <section className={`px-0 sm:px-6 lg:px-8 ${!isEditorRoute ? "pt-20" : "sm:pt-10"}`}>
          {/* Estabilização de Layout: Altura mínima fixa e contenção de renderização */}
          <div className="relative min-h-[460px] sm:min-h-[400px] lg:min-h-[360px] overflow-hidden bg-zinc-900 sm:rounded-[2rem] contain-layout [content-visibility:auto]">
            
            {/* Background isolado do fluxo para 0 oscilações de CPU */}
            <div className="pointer-events-none absolute inset-0 z-0">
              <HeroBackgroundMedia
                videoSrc="/img/freepik-video-upscaler-480"
                posterSrc="/img/Mascote.png"
              />
            </div>

            {/* Conteúdo com Z-index explícito para evitar repaints na GPU */}
            <div className="relative z-10 px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-10">
              <div className="max-w-4xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/92 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-blue-700 dark:border-blue-900/40 dark:bg-zinc-900/82 dark:text-blue-300">
                  <Sparkles size={12} />
                  {t("marketplace_hero_badge")}
                </div>

                {/* Títulos otimizados com cores de fallback enquanto o gradiente renderiza */}
                <h1 className="max-w-3xl text-[2rem] font-black leading-[0.96] tracking-tight text-white sm:text-[2.45rem] lg:text-[3.05rem]">
                  {t("marketplace_hero_title_line_1")}{" "}
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
                    {t("marketplace_hero_title_line_2")}
                  </span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-200 sm:text-[15px]">
                  {t("marketplace_hero_subtitle")}
                </p>

                {/* UX de Direcionamento Direto: Botões proeminentes e sem atrito */}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {/* Botão de Ação Primária: Enfatizado com maior contraste visual para o novo usuário */}
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleSecondaryClick}
                    className="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-600/20 transition-all duration-150 hover:bg-blue-500 active:scale-[0.99]"
                  >
                                       {hasSession ? (
                      <PlusCircle size={15} className="mr-2" />
                    ) : (
                      <UserPlus size={15} className="mr-2" />
                    )}
                    {t(hasSession ? "btn_create_product" : "storely_sell_now")}
                  </button>
                  
                  {/* Botão Secundário */}
                  <button
                    type="button"
                    onClick={handlePrimaryClick}
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/20 bg-white/20  px-6 text-[11px] font-black uppercase tracking-[0.14em] text-white transition-all duration-150 hover:bg-white/30 active:scale-[0.99]"
                  >
                     <ShoppingBag size={15} className="mr-2" />
                     {t("marketplace_showcase_title")}

                  </button>
                </div>

                {/* Tags informativas movidas para baixo dos botões (Menos ruído visual antes da ação) */}
                <div className="mt-8 flex flex-wrap gap-2.5 opacity-85">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold text-zinc-200 ">
                    <ShoppingBag size={12} className="text-blue-400" />
                    {t("marketplace_hero_point_products")}
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold text-zinc-200 ">
                    <Store size={12} className="text-fuchsia-400" />
                    {t("marketplace_hero_point_stores")}
                  </div>

                  <div className="sm:inline-flex hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold text-zinc-200 ">
                    <Search size={12} className="text-cyan-400" />
                    {t("marketplace_hero_point_discover")}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section id="marketplace-showcase" className="border-zinc-100 py-4 dark:border-zinc-900">
          <ShowcaseStores />
        </section>
      </main>
      {!isEditorRoute && <Footer />}
    </div>
  );
};