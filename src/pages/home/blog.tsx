import { HeaderLog } from '../../components/headerlog';
import Footer from '../../components/footer2';
import { ShowcaseStores } from '../../components/blog/ShowcaseStores';
import { useNavigate } from 'react-router-dom';
import { Store, ShoppingBag, Sparkles, UserPlus, Search } from 'lucide-react';
import { useTranslate } from "../../context/LanguageContext";
import { HeroBackgroundMedia } from '../../components/blog/HeroMedia';

export const Blog = () => {
  const navigate = useNavigate();
  const { t } = useTranslate();
  const { pathname } = location;

  const isEditorRoute = pathname.includes("admin");

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
      {!isEditorRoute &&
      <HeaderLog />
}


      <main className="mx-auto max-w-[1440px] pb-16">
      <section className={`px-0 sm:px-6 lg:px-8 ${!isEditorRoute ? "pt-20" : "sm:pt-10"}`}>
                  <div className="relative overflow-hidden  border-zinc-200/80 bg-white sm:rounded-[2rem] dark:border-zinc-800/80 dark:bg-zinc-950">
            <div className="pointer-events-none absolute inset-0">
            <HeroBackgroundMedia
  videoSrc="/img/freepik-video-upscaler-480"
  posterSrc="/img/Mascote.png"
/>
            </div>

            <div className="relative z-10 px-5 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-5">
              <div className="max-w-4xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/92 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-blue-700 dark:border-blue-900/40 dark:bg-zinc-900/82 dark:text-blue-300">
                  <Sparkles size={12} />
                  {t("marketplace_hero_badge")}
                </div>

                <h1 className="max-w-3xl text-[2rem] font-black leading-[0.96] tracking-tight text-zinc-100 dark:text-zinc-50 sm:text-[2.45rem] lg:text-[3.05rem]">
                  {t("marketplace_hero_title_line_1")}{" "}
                  <span className="bg-gradient-to-r from-blue-600 via-cyan-400 to-fuchsia-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-cyan-300 dark:to-fuchsia-400">
                    {t("marketplace_hero_title_line_2")}
                  </span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-100 dark:text-zinc-300 sm:text-[15px]">
                  {t("marketplace_hero_subtitle")}
                </p>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/92 px-3 py-2 text-[11px] font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/84 dark:text-zinc-300">
                    <ShoppingBag size={14} className="text-blue-600 dark:text-blue-400" />
                    {t("marketplace_hero_point_products")}
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/92 px-3 py-2 text-[11px] font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/84 dark:text-zinc-300">
                    <Store size={14} className="text-fuchsia-600 dark:text-fuchsia-400" />
                    {t("marketplace_hero_point_stores")}
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/92 px-3 py-2 text-[11px] font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/84 dark:text-zinc-300">
                    <Search size={14} className="text-cyan-600 dark:text-cyan-400" />
                    {t("marketplace_hero_point_discover")}
                  </div>
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("marketplace-showcase")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-[11px] font-black uppercase tracking-[0.14em] text-white transition-transform duration-200 hover:scale-[1.01] dark:bg-white dark:text-zinc-900"
                  >
                    <ShoppingBag size={15} className="mr-2" />
                    {t("marketplace_showcase_title")}
                  </button>
{!isEditorRoute &&
                  <button
                    type="button"
                    onClick={() => navigate("/auth")}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white/92 px-5 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-800 transition-transform duration-200 hover:scale-[1.01] dark:border-zinc-800 dark:bg-zinc-900/84 dark:text-zinc-100"
                  >
                    <UserPlus size={15} className="mr-2" />
                    {t("storely_sell_now")}
                  </button>
}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="marketplace-showcase"
          className="border-zinc-100 py-4 dark:border-zinc-900"
        >
          <ShowcaseStores />
        </section>
      </main>
{!isEditorRoute &&
      <Footer />
}
    </div>
  );
};