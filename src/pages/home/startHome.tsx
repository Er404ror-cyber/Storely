import Footer from "../../components/footer2";
import React, { memo, useState, useEffect, useRef } from 'react';
import { HeaderLog } from "../../components/headerlog";
import { Link } from 'react-router-dom';

// --- INTERFACES (TypeScript) ---

interface FeatureProps {
    title: string;
    desc: string;
    icon: React.ReactNode;
}


interface ProjectProps {
    category: string;
    title: string;
    description: string;
    url: string;
}
// --- SUB-COMPONENTES ---

// Memo impede re-render se as props não mudarem
const FeatureCard = memo(({ title, desc, icon }: FeatureProps) => (
    <div className="p-8 rounded-[2rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 group">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 tracking-tight">{title}</h3>
        <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm sm:text-base">{desc}</p>
    </div>
));

const ProjectCard: React.FC<ProjectProps> = memo(({ category, title, description, url }) => {
    const [shouldRender, setShouldRender] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShouldRender(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const openSite = () => window.open(url, '_blank', 'noopener,noreferrer');

    return (
        <div className="group rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            
            {/* AREA DO PREVIEW - CARREGAMENTO SOB DEMANDA */}
            <div 
                ref={containerRef}
                onClick={openSite}
                className="relative aspect-video bg-zinc-100 dark:bg-zinc-800 cursor-pointer"
            >
                {shouldRender ? (
                    <div className="absolute inset-0 pointer-events-none" 
                         style={{ width: '200%', height: '200%', transform: 'scale(0.5)', transformOrigin: '0 0' }}>
                        <iframe 
                            src={url}
                            title={title}
                            className="w-full h-full border-none rounded-t-3xl"
                            loading="lazy"
                            scrolling="no"
                            sandbox="allow-scripts allow-same-origin" 
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-800 animate-pulse" />
                )}

               
                <div className="absolute inset-0 z-20 bg-transparent" />
            </div>

            <div className="p-4">
                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">{category}</span>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mt-1">{title}</h3>
                <p className="text-zinc-500 text-[11px] mt-1 line-clamp-2">{description}</p>
                <button 
                    onClick={openSite}
                    className="mt-4 w-full py-2 text-[10px] font-black border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer uppercase tracking-tighter"
                >
                    Explorar Website
                </button>
            </div>
        </div>
    );
});
// --- COMPONENTE PRINCIPAL ---

export const StartHome: React.FC = () => {
    return (
        <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-blue-500 selection:text-white">
            <HeaderLog />

            {/* HERO SECTION */}
           <section className="relative pt-20 pb-16 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white dark:bg-zinc-950">


    <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            
            {/* TEXTO: Ordem 1 no Celular e Desktop */}
            <div className="relative z-10 order-1">
                {/* Tag de Destaque - Centralizada no Celular */}
                <div className="flex justify-start lg:justify-start mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Performance Engine</span>
                    </div>
                </div>

                {/* Título: Ajuste de tamanho responsivo */}
                <h1 className="text-[2.75rem] leading-[0.9] sm:text-7xl lg:text-8xl font-black tracking-tighter mb-6 text-zinc-900 dark:text-white">
                    Construa <br />
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Seu</span> Website <br />
                    <span className="text-zinc-400 dark:text-zinc-400 italic font-serif">Aqui.</span>
                </h1>

                {/* Descrição com borda lateral */}
                <div className="max-w-md border-l-2 border-blue-600 pl-5 mb-8">
                    <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg font-medium leading-snug">
                        A plataforma definitiva para quem busca performance extrema. 
                        <span className="text-zinc-900 dark:text-zinc-100 font-bold block mt-1">
                            Sem código. Sem limites.
                        </span>
                    </p>
                </div>

                {/* Botões: Full width no celular, inline no Desktop */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Link to={"/auth"}>
                    
                    <button className="w-full sm:w-auto px-8 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black rounded-2xl transition-transform active:scale-95 shadow-lg cursor-pointer text-sm">
                        COMEÇAR AGORA
                    </button>
                    </Link>
                    <Link to={"/blog"}>
                    <button className="w-full sm:w-auto px-8 py-4 border border-zinc-200 dark:border-zinc-800 font-bold rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors active:scale-95 text-zinc-600 dark:text-zinc-200 cursor-pointer text-sm">
                        VER GALERIA
                    </button>
                    </Link>
                </div>
            </div>

            {/* IMAGEM: Ordem 2 no Celular (Fica abaixo do texto) */}
            <div className="relative order-2 w-full mt-4 lg:mt-0 group">
                {/* Moldura do Navegador */}
                <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1.5 shadow-xl sm:p-2">
                    
                    {/* Barra de Topo Mockup */}
                    <div className="flex items-center gap-1 px-3 py-2 border-zinc-100 dark:border-zinc-800">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                    </div>
                    
                    {/* Container da Imagem Real */}
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        <img 
                            src="https://www.nitrahost.com/images/website-builder.png" 
                            alt="Preview da Plataforma"
                            className="w-full h-full object-cover"
                            loading="eager"
                            decoding="async"
                        />
                    </div>
                </div>

                {/* Badge de Performance - Escondido em celulares muito pequenos para não poluir */}
                <div className="absolute -bottom-4 -left-4 bg-white dark:bg-zinc-900 px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg hidden sm:flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-[10px]">
                        100
                    </div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter leading-none">
                        Desktop <br/> <span className="text-zinc-900 dark:text-white text-xs">Score</span>
                    </p>
                </div>
            </div>

        </div>
    </div>
</section>

            {/* FEATURES SECTION */}
            <section className="py-24 bg-zinc-50 dark:bg-zinc-900/30 border-y border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16">
                        <p className="text-blue-600 dark:text-blue-400 font-bold tracking-[0.2em] uppercase text-xs mb-2">Funcionalidades</p>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Tudo em um só lugar.</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard 
                            title="Editor Drag & Drop" 
                            desc="Construa visualmente sem tocar em uma linha de código. Simples, intuitivo e poderoso."
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        />
                        <FeatureCard 
                            title="SEO Nativo" 
                            desc="Sua página já nasce otimizada para os motores de busca, garantindo melhor visibilidade."
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        />
                        <FeatureCard 
                            title="Hospedagem Edge" 
                            desc="Sites carregados instantaneamente em qualquer lugar do mundo com nossa CDN premium."
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        />
                    </div>
                </div>
            </section>

            {/* SHOWCASE SECTION */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-950">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="max-w-xl">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] mb-8">
                        Excelência em <br /> 
                        <span className="text-zinc-400 dark:text-zinc-600 italic font-serif">cada pixel.</span>
                    </h2>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-4 text-lg font-medium">
                                Explore websites de alta performance criados por nossa comunidade de designers e empreendedores.
                            </p>
                        </div>
                        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800 hidden lg:block mx-12 mb-6" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    <ProjectCard 
                        category="E-commerce Engine"
                        title="Vercel Commerce"
                        url="https://demo.vercel.store"
                        description="Uma infraestrutura de comércio eletrônico focada em velocidade de carregamento e conversão otimizada para o varejo moderno."                    />
                    <ProjectCard 
                        category="Design Systems"
                        title="Tailwind Components"
                        url="https://storelyy.vercel.app/tio/"
                        description="Arquitetura de interface escalável, demonstrando a versatilidade de nossos componentes nativos e fidelidade visual."                    />
                    </div>
                </div>
            </section>

            {/* FOOTER CALL TO ACTION */}
           {/* --- FINAL CTA SECTION (DESIGN REFINADO) --- */}
<section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    {/* Círculos de luz decorativos ao fundo */}
    <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-blue-500/20 rounded-full  pointer-events-none" />
    <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full pointer-events-none" />

    <div className="max-w-5xl mx-auto relative">
        <div className="relative p-8 md:p-20 rounded-[3.5rem] overflow-hidden border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50  shadow-2xl shadow-blue-500/10 dark:shadow-black">
            
            {/* Conteúdo Centralizado */}
            <div className="relative z-10 flex flex-col items-center text-center">
                <span className="px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mb-8">
                    Acesso Instantâneo
                </span>
                
                <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.95] mb-8 text-zinc-900 dark:text-white">
                    Pronto para <br />
                    <span className="italic font-serif text-blue-600 dark:text-blue-500">dominar</span> a web?
                </h2>
                
                <p className="max-w-md text-zinc-500 dark:text-zinc-400 text-lg mb-12 leading-relaxed">
                    Junte-se a milhares de criadores e coloque seu projeto no ar em menos de 10 minutos. 
                    <span className="font-bold text-zinc-900 dark:text-zinc-100"> Sem custos ocultos.</span>
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Link to={"/auth"}>
                
                    <button className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3 group cursor-pointer">
                        CRIAR MEU SITE AGORA
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </Link>    
                    <div className="flex -space-x-3 items-center ml-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-300 dark:bg-zinc-800" />
                        ))}
                        <p className="ml-6 text-sm font-bold text-zinc-400">
                            +12k membros
                        </p>
                    </div>
                </div>

            </div>

            {/* Linhas decorativas sutis */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent -3xl opacity-50" />
        </div>
    </div>
</section>
            <Footer/>
        </div>
    );
};