import { useState, useMemo, memo } from 'react';
import type { FC } from 'react';
import { Header } from '../../components/headeroficial';
import ProdutoCard from '../../components/rosas/card';
import { produtos } from '../../data/produtos';

import type { Produto } from '../../types/details'; 

interface SectionHeaderProps {
  title: string;
}

const SectionHeader = memo(({ title }: SectionHeaderProps) => (
  <div className="flex items-center gap-4 mb-10 mt-16 first:mt-0">
    <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
      {title}
    </h2>
    <div className="h-[2px] flex-1 bg-gradient-to-r from-rose-500 to-transparent opacity-30"></div>
  </div>
));

SectionHeader.displayName = 'SectionHeader';

const Rosas: FC = () => {
  const [filtroAtivo, setFiltroAtivo] = useState<string>('Todos');

  // 2. Removido o 'any' e usando o tipo importado corretamente
  const categorias = useMemo<string[]>(() => 
    ['Todos', ...new Set((produtos as Produto[]).map((p) => p.categoria))], 
  []);

  const produtosAgrupados = useMemo(() => {
    // 3. Tipagem precisa para evitar o erro de indexação (Record<string, Produto[]>)
    const agrupados: Record<string, Produto[]> = {};
    
    const listaProdutos = produtos as Produto[];

    for (const produto of listaProdutos) {
      if (filtroAtivo !== 'Todos' && produto.categoria !== filtroAtivo) continue;
      
      const cat = produto.categoria;
      if (!agrupados[cat]) agrupados[cat] = [];
      agrupados[cat].push(produto);
    }
    return agrupados;
  }, [filtroAtivo]);

  const handlePersonalizarClick = () => {
    const phoneNumber = '258822451479';
    
    const message = 'Olá! Vi os presentes no site e gostaria de solicitar uma personalização exclusiva. Pode me ajudar a montar algo especial?';
    
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.focus();
  };

  return (
    <div className='bg-[#fafafa] min-h-screen pb-20 font-sans selection:bg-rose-100'>
      <Header />
      
      <header className="relative w-full overflow-hidden  min-h-[420px] md:min-h-[480px] flex items-center bg-[#fafafa]">
  {/* Layer de Imagem: Otimização total com transform-gpu */}
  <div className="absolute inset-0 z-0 transform-gpu">
    <img 
      src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=60&w=1200" 
      alt="Arranjo de Rosas Premium" 
      className="w-full h-full object-cover opacity-40 md:opacity-100"
      loading="eager"
      decoding="async"
    />
    {/* Gradiente Sólido: Mais rápido que Backdrop-blur para a CPU */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#fafafa] via-[#fafafa]/50 to-transparent"></div>
  </div>

  <div className="relative z-10 container mx-auto px-6 py-12">
    <div className="max-w-2xl ">
      {/* Badge Minimalista */}
      <div className="inline-flex items-center gap-2 mb-4">
        <span className="w-8 h-[1px] bg-rose-500"></span>
        <span className="text-rose-600 font-bold text-[10px] uppercase antialiased">
          Premium Experience
        </span>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-4  leading-[0.95] antialiased">
        PRESENTES QUE <br />
        <span className="text-rose-600 ">MARCAM.</span>
      </h1>
      
      <p className="text-gray-500 text-base md:text-lg max-w-lg leading-snug antialiased mb-8">
        Arranjos florais e cestas exclusivas criadas para transformar momentos em memórias.
      </p>

      {/* Botão de Ação Rápida (Otimizado para toque) */}
      <div className="flex flex-wrap gap-4">
        <div className="h-1.5 w-16 bg-rose-600 rounded-full"></div>
      </div>
    </div>
  </div>


  <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-rose-100/30 rounded-full  pointer-events-none"></div>
</header>

      <nav className="sticky top-12 z-40 bg-white/80  border-b border-gray-100 py-2 shadow-sm">
        <div className="container mx-auto px-6 overflow-x-auto no-scrollbar">
          <div className="flex justify-center min-w-max gap-3">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setFiltroAtivo(cat)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  filtroAtivo === cat 
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' 
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-rose-400 hover:text-rose-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className='container mx-auto px-6 py-12'>
        {Object.entries(produtosAgrupados).map(([categoria, itens]) => (
          <section key={categoria} className="mb-20 animate-in fade-in duration-700">
            <SectionHeader title={categoria} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 md:gap-10">
              {itens.map((produto) => (
                <div key={produto.id} className="will-change-transform hover:translate-y-[-4px] transition-transform duration-300">
                   <ProdutoCard produto={produto} />
                </div>
              ))}
            </div>
          </section>
        ))}

        <section 
          onClick={handlePersonalizarClick}
          className="group relative overflow-hidden bg-rose-600 rounded-[2.5rem] p-10 md:p-20 flex flex-col md:flex-row items-center justify-between cursor-pointer transition-all duration-500 hover:shadow-[0_20px_50px_rgba(225,29,72,0.3)]"
        >
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              NÃO ACHOU O <br/> <span className="text-rose-200">PRESENTE IDEAL?</span>
            </h2>
            <p className="text-rose-100 text-xl font-medium max-w-lg mb-8 md:mb-0">
              Personalizamos cestas, kits e buquês de acordo com seu orçamento e gosto.
            </p>
          </div>
          
          <div className="relative z-10 bg-white text-rose-600 px-12 py-6 rounded-2xl font-black text-xl hover:scale-105 transition-transform duration-300 shadow-2xl">
            CRIAR AGORA
          </div>

          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500 rounded-full blur-[100px] opacity-50 -mr-20 -mt-20 group-hover:opacity-70 transition-opacity"></div>
        </section>
      </main>
    </div>
  );
};

export default Rosas;