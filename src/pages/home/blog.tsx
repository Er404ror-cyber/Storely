import { HeaderLog } from '../../components/headerlog';
import Footer from '../../components/footer2';
import { ShowcaseStores } from '../../components/blog/ShowcaseStores';

export const Blog = () => {
  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 font-sans antialiased transition-colors duration-300">
      <HeaderLog/>
      
      <main className="max-w-[1440px] pb-8 mx-auto">
        
        {/* HERO SECTION */}
        <section className="px-6 lg:px-12 py-8 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="w-full lg:w-[45%] order-2 lg:order-1 text-center lg:text-left">
            <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-[0.3em] text-[10px] mb-6 block italic">
              Performance Engine & Updates
            </span>
            <h1 className="text-[44px] lg:text-[75px] lg:leading-[1] font-black tracking-tighter mb-8">
              Evolua sua <br /> 
              Loja com <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Dados <br /> Profissionais</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-base lg:text-lg max-w-md mx-auto lg:mx-0 mb-10 leading-relaxed font-medium border-l-2 border-blue-600 pl-5">
              Fique por dentro das últimas funcionalidades e veja como os nossos utilizadores estão a transformar o e-commerce.
            </p>
            <button className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition active:scale-95">
              Ver Novidades
            </button>
          </div>

          <div className="w-full lg:w-[50%] order-1 lg:order-2">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-8 aspect-square">
                <img 
                  src="https://media.licdn.com/dms/image/v2/D4D12AQH9zP6UixRJQw/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1674648769474?e=2147483647&v=beta&t=z6sJu-2SM_Xlupwfi-QvrPrL58S2Nlgas-ob6aPHsfU" 
                  className="w-full h-full object-cover rounded-[3rem] lg:rounded-[4rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl" 
                  alt="Storely Analytics" 
                />
              </div>
              <div className="col-span-4 flex flex-col gap-4">
                <div className="aspect-square">
                  <img src="https://media.licdn.com/dms/image/v2/D4D12AQH9zP6UixRJQw/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1674648769474?e=2147483647&v=beta&t=z6sJu-2SM_Xlupwfi-QvrPrL58S2Nlgas-ob6aPHsfU" className="w-full h-full object-cover rounded-[2rem] lg:rounded-[3rem] border border-zinc-200 dark:border-zinc-800" />
                </div>
                <div className="aspect-square">
                  <img src="https://media.licdn.com/dms/image/v2/D4D12AQH9zP6UixRJQw/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1674648769474?e=2147483647&v=beta&t=z6sJu-2SM_Xlupwfi-QvrPrL58S2Nlgas-ob6aPHsfU" className="w-full h-full object-cover rounded-[2rem] lg:rounded-[3rem] border border-zinc-200 dark:border-zinc-800" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECÇÃO DINÂMICA DE PRODUTOS/LOJAS */}
        <section className="py-6 lg:px-8 border-t border-zinc-100 dark:border-zinc-900 mt-10">
          <div className="px-6 lg:px-0 flex justify-between items-end mb-10 gap-6">
            <div className="max-w-xl">
               <h2 className="text-3xl lg:text-5xl font-black tracking-tighter leading-none italic font-serif">
                Showcase <span className="text-zinc-400">da Comunidade</span>
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-4">
                Produtos publicados recentemente em diversas lojas Storely.
              </p>
            </div>
            <button className="hidden lg:block border border-zinc-200 dark:border-zinc-800 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition">
              Explorar Ecossistema
            </button>
          </div>

          {/* O COMPONENTE SEPARADO ENTRA AQUI */}
          <ShowcaseStores />
          
        </section>

        
        {/* LATEST STORIES (Updates) */}
        <section className="py-20 px-6 lg:px-12 border-t border-gray-200 dark:border-gray-900">
          <h2 className="text-3xl lg:text-4xl font-bold mb-12 italic">Últimos Updates</h2>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7">
              <div className="rounded-[3rem] lg:rounded-[4rem] overflow-hidden aspect-video lg:aspect-auto lg:h-[500px] mb-8">
                <img src="https://images.unsplash.com/photo-1551288049-bbdac8626ad1?w=1000" className="w-full h-full object-cover" />
              </div>
              <span className="text-[#EE6338] font-bold text-[10px] uppercase tracking-widest">Tecnologia</span>
              <h3 className="text-2xl lg:text-4xl font-bold mt-4 mb-6 leading-tight">Novo checkout Storely: Menos fricção, mais vendas.</h3>
              <p className="text-gray-500 text-lg leading-relaxed">Desenvolvemos uma nova arquitetura de pagamentos que reduz o tempo de carregamento em 40%...</p>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-10">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex gap-6 items-center group cursor-pointer">
                  <img src={`https://picsum.photos/300/300?random=${item}`} className="w-24 h-24 lg:w-36 lg:h-36 rounded-[2rem] lg:rounded-[2.5rem] object-cover shrink-0" />
                  <div>
                    <span className="text-[#EE6338] font-bold text-[10px] uppercase tracking-widest">Novidade</span>
                    <h4 className="font-bold text-lg lg:text-xl mt-1 group-hover:text-[#EE6338] transition leading-tight">Como usar estatísticas para prever estoque</h4>
                    <p className="text-gray-400 text-[10px] mt-2 font-bold">FEV 2026 • 5 MIN</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer/>
    </div>
  );
};