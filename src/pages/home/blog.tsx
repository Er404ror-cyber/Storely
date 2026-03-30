import { HeaderLog } from '../../components/headerlog';
import Footer from '../../components/footer2';
import { ShowcaseStores } from '../../components/blog/ShowcaseStores';
import { useNavigate } from 'react-router-dom';
import { Store, ShoppingBag, Sparkles, UserPlus, Search } from 'lucide-react';
import { useTranslate } from "../../context/LanguageContext";

export const Blog = () => {
  const navigate = useNavigate();
  const { t } = useTranslate();

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
      <HeaderLog />

      <main className="mx-auto max-w-[1440px] pb-10">
      <section className="px-0 pt-20 sm:px-6  lg:px-8 ">
  <div className="relative overflow-hidden sm:rounded-[2rem] border border-zinc-200/80 bg-white  dark:border-zinc-800/80 dark:bg-zinc-950">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.08),transparent_24%),linear-gradient(to_bottom,rgba(255,255,255,0.98),rgba(244,244,245,0.96))] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_22%),linear-gradient(to_bottom,rgba(9,9,11,0.98),rgba(24,24,27,0.97))]" />
    </div>

    <div className="relative px-5 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-4">
      <div className="max-w-4xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300">
          <Sparkles size={12} />
          {t("marketplace_hero_badge")}
        </div>

        <h1 className="max-w-3xl text-[2rem] font-black leading-[0.96] tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-[2.45rem] lg:text-[3.15rem]">
          {t("marketplace_hero_title_line_1")}{" "}
          <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-fuchsia-500 bg-clip-text text-transparent">
            {t("marketplace_hero_title_line_2")}
          </span>
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-[15px]">
          {t("marketplace_hero_subtitle")}
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/85 px-3 py-2 text-[11px] font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300">
            <ShoppingBag size={14} className="text-blue-600" />
            {t("marketplace_hero_point_products")}
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/85 px-3 py-2 text-[11px] font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300">
            <Store size={14} className="text-fuchsia-600" />
            {t("marketplace_hero_point_stores")}
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/85 px-3 py-2 text-[11px] font-bold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300">
            <Search size={14} className="text-cyan-600" />
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

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white/85 px-5 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-800 transition-transform duration-200 hover:scale-[1.01] dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-100"
          >
            <UserPlus size={15} className="mr-2" />
            {t("storely_sell_now")}
          </button>
        </div>
      </div>
    </div>
  </div>
</section>
        <section 
        
        
          id="marketplace-showcase"
        className=" border-zinc-100 py-4  dark:border-zinc-900">
         
          <ShowcaseStores />
        </section>
      </main>

      <Footer />
    </div>
  );
};