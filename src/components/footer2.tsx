import  { useState, useEffect } from 'react';
import { useTranslate } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
    const { t } = useTranslate();
  
  const mascotImages = [
    "/img/Mascote.png",
    "/img/Mascote2.png",
    "/img/Mascote4.png"
  ];
  const navLinks = [
    { name: t('nav_home'), path: '/' },
    { name: t('nav_blog'), path: '/blog' },
    { name: t('nav_support'), path: '/duvidas' },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // Intervalo longo (6 segundos) para que a troca não seja frenética
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % mascotImages.length);
    }, 6000); 

    return () => clearInterval(interval);
  }, [mascotImages.length]);

  return (
    <footer className="relative bg-[#fcfcfc] dark:bg-[#050505] text-slate-600 dark:text-slate-400 mt-32 transition-colors duration-500">
      
      {/* LINHA DIVISÓRIA */}
      <div className="absolute top-0 left-0 w-full h-px bg-slate-200 dark:bg-white/10 z-20">
          <div className="absolute left-1/2 -translate-x-1/2 -top-[1px] w-64 h-[3px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent "></div>
      </div>

      {/* MASCOTE COM CROSS-FADE ULTRA SUTIL */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[80%] md:-translate-y-[82%] z-30 pointer-events-none">
        <div className="relative h-80 md:h-[400px] w-[300px] md:w-[500px] flex justify-center items-end">
          {mascotImages.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`Mascot ${index}`}
              /* duration-[2500ms] cria uma transição de 2.5 segundos, extremamente lenta */
              className={`absolute md:static bottom-0 h-full w-auto object-contain transition-opacity duration-[1500ms] ease-in-out ${
                index === activeIndex ? "opacity-100" : "opacity-0"
              }`}
              style={{
                // Garante que as imagens fiquem exatamente uma sobre a outra
                willChange: 'opacity'
              }}
            />
          ))}
        </div>
      </div>

      {/* CONTEÚDO DO FOOTER */}
      <div className="w-full bg-white dark:bg-[#080808] pt-24 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-12">
            
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
              <h3 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent mb-4">
                STORELY
              </h3>
              <p className="text-sm font-medium opacity-60 max-w-xs leading-relaxed">
                Criando interfaces que respiram inovação e performance absoluta.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center">
              <nav className="relative z-10 flex gap-6 px-6 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm ">
              {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={` relative group
                  text-xs font-bold uppercase tracking-widest hover:text-cyan-500 transition-colors
                  ${
                  location.pathname === link.path ? 'text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 h-[2px] bg-slate-900 dark:bg-white transition-all ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
            ))}
              </nav>
            </div>

            <div className="lg:col-span-4 flex justify-center lg:justify-end gap-4">
              {['whatsapp', 'instagram', 'twitter', 'github'].map(icon => (
                <a 
                  key={icon} 
                  href="#" 
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 transition-all shadow-sm"
                >
                  <img src={`/img/${icon}.png`} alt={icon} className="h-4 w-4 opacity-70 dark:invert" />
                </a>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">
            <span>© {currentYear} Storely Universe</span>
            <div className="flex gap-6 italic">
              <a href="#" className="hover:text-cyan-500 transition-all">Privacidade</a>
              <a href="#" className="hover:text-cyan-500 transition-all">Termos de uso</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;