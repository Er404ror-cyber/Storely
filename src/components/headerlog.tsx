import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Monitor, ShieldCheck, Zap, HelpCircle, Globe, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast'; 
import { useTranslate } from '../context/LanguageContext';

export const HeaderLog = () => {
  const { t, lang, setLang } = useTranslate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');
  const location = useLocation();

  // Labels Traduzidos
  const getThemeLabel = () => {
    if (themeMode === 'light') return t('theme_light');
    if (themeMode === 'dark') return t('theme_dark');
    return t('theme_auto');
  };
  
  const getThemeDescription = () => {
    if (themeMode === 'auto') {
      const isNight = new Date().getHours() >= 18 || new Date().getHours() < 6;
      return isNight ? t('theme_desc_night') : t('theme_desc_day');
    }
    return t('theme_desc_manual');
  };

  // Função para trocar idioma com Toast
  const handleLangChange = () => {
    const newLang = lang === 'pt' ? 'en' : 'pt';
    setLang(newLang);
    toast.success(newLang === 'pt' ? 'Idioma: Português' : 'Language: English', {
      id: 'lang',
      icon: '🌎',
      style: { borderRadius: '12px', background: '#1e293b', color: '#fff', fontSize: '12px' }
    });
  };

  const applyAutoTheme = useCallback((showNotification = false) => {
    const isNight = new Date().getHours() >= 18 || new Date().getHours() < 6;
    document.documentElement.classList.toggle('dark', isNight);
    
    if (showNotification) {
      toast.success(`${t('theme_auto')}: ${isNight ? '🌙' : '☀️'}`, {
        id: 'theme',
        style: { borderRadius: '12px', background: '#1e293b', color: '#fff' }
      });
    }
  }, [t]);

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as any) || 'auto';
    setThemeMode(saved);
    if (saved === 'auto') applyAutoTheme(false);
    else document.documentElement.classList.toggle('dark', saved === 'dark');

    const interval = setInterval(() => {
      if (localStorage.getItem('theme') === 'auto') applyAutoTheme(false);
    }, 60000);
    return () => clearInterval(interval);
  }, [applyAutoTheme]);

  const toggleTheme = () => {
    const modes: ('light' | 'dark' | 'auto')[] = ['light', 'dark', 'auto'];
    const next = modes[(modes.indexOf(themeMode) + 1) % modes.length];

    const update = () => {
      setThemeMode(next);
      localStorage.setItem('theme', next);
      if (next === 'auto') applyAutoTheme(true);
      else {
        document.documentElement.classList.toggle('dark', next === 'dark');
        toast.success(next === 'dark' ? t('theme_dark') : t('theme_light'), { id: 'theme' });
      }
    };

    if (document.startViewTransition) document.startViewTransition(update);
    else update();
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  const navLinks = [
    { name: t('nav_home'), path: '/' },
    { name: t('nav_blog'), path: '/blog' },
    { name: t('nav_support'), path: '/duvidas' },
  ];

  const currentPage = navLinks.find(link => link.path === location.pathname)?.name || "Menu";

  return (
    <>
      <header 
        className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
          scrolled || isOpen
            ? 'bg-white/95 dark:bg-zinc-950/90 border-b border-gray-100 dark:border-slate-800 py-3' 
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex justify-between items-center">
          
          <div className="z-[110] flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-white dark:text-slate-900 font-bold text-xs">ST</span>
              </div>
              <h1 className="text-xl font-black tracking-[0.2em] text-slate-900 dark:text-white hidden md:block">STORELY</h1>
            </Link>
            
            {!isOpen && (
              <div className="md:hidden flex items-center gap-2 text-slate-400">
                <span className="text-xs uppercase tracking-widest font-bold">/</span>
                <span className="text-xs uppercase tracking-widest font-bold text-slate-900 dark:text-white animate-in fade-in slide-in-from-left-2">{currentPage}</span>
              </div>
            )}
          </div>

          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[12px] uppercase tracking-[0.2em] font-bold transition-all relative group ${
                  location.pathname === link.path ? 'text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 h-[2px] bg-slate-900 dark:bg-white transition-all ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-5 z-[110]">
            <div className="relative hidden lg:block  group">
   

    <button 
      onClick={handleLangChange}
      className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-50 dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-500/20 transition-all active:scale-95 hover:border-indigo-500 transform-gpu shadow-sm shadow-indigo-500/5"
    >
      <div className="relative">
        <Globe size={14} className="text-indigo-500" />
        {/* Ponto de notificação/alerta visual */}
        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-white dark:border-zinc-950 animate-bounce" />
      </div>
      
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-white">
        {lang === 'pt' ? 'PT' : 'EN'}
      </span>
      
      <div className="hidden xl:block h-3 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />
      
      <span className="hidden xl:block text-[10px] font-medium text-slate-600 dark:text-gray-100">
        {lang === 'pt' ? 'Português' : 'English'}
      </span>
    </button>
    
  </div>

            {/* TEMA DESKTOP */}
            <div className="relative group"> 
              <button onClick={toggleTheme} className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-transparent hover:border-indigo-500/30 transition-all active:scale-90 transform-gpu">
                <div className="text-slate-600 dark:text-slate-300">
                  {themeMode === 'light' && <Sun size={18} className="text-amber-500 fill-amber-500/10" />}
                  {themeMode === 'dark' && <Moon size={18} className="text-indigo-400 fill-indigo-400/10" />}
                  {themeMode === 'auto' && <Monitor size={18} className="text-slate-500" />}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-[10px] font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter">{getThemeLabel()}</p>
                </div>
              </button>

              <div className="absolute top-full mt-3 right-0 w-48 p-3 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all pointer-events-none z-[120]">
  {/* Título do Modo (Light, Dark, Auto) */}
  <p className="text-[11px] font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-wider">
    {getThemeLabel()}
  </p>
  
  {/* Descrição Dinâmica baseada no Idioma */}
  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
    {themeMode === 'auto' 
      ? `${t('theme_desc_auto_base')} ${getThemeDescription()}`
      : t('theme_desc_manual')}
  </p>
  
  {/* Rodapé do Tooltip (Clique para alternar) */}
  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[9px] text-slate-400 italic">
    {t('theme_click_toggle')}
  </div>
</div>
            </div>

            <Link 
              to="/auth" 
              className="hidden lg:flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:opacity-90 transition-all shadow-sm"
            >
              <LayoutDashboard size={14} />
              {t('btn_dashboard')}
            </Link>

            <button className="lg:hidden p-2 text-slate-900 dark:text-white" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <div className={`fixed inset-0 z-[90] lg:hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-white dark:bg-zinc-950" />
        <div className="relative flex flex-col h-full pt-28 px-8 pb-8">
          
        <div className="flex items-center justify-between mb-12 opacity-90">
  {/* Título da Navegação com a linha */}
  <div className="flex items-center gap-4 flex-1">
    <span className="text-[10px] font-black tracking-[0.3em] uppercase dark:text-white whitespace-nowrap">
      {t('menu_nav')}
    </span>
    <div className="h-px w-full bg-slate-200 dark:bg-slate-700" />
  </div>

  {/* Botão de Troca de Idioma com Label no Idioma Oposto */}
  <div className="relative  group">
    {/* Label Dinâmica: Sugere o idioma contrário ao que está ativo */}
    <span className="absolute -top-6 right-0 text-[7px] font-black text-indigo-500 uppercase tracking-[0.2em] animate-pulse whitespace-nowrap">
      {lang === 'pt' ? 'Switch to English' : 'Mudar para Português'}
    </span>

    <button 
      onClick={handleLangChange}
      className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-50 dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-500/20 transition-all active:scale-95 hover:border-indigo-500 transform-gpu shadow-sm shadow-indigo-500/5"
    >
      <div className="relative">
        <Globe size={14} className="text-indigo-500" />
        {/* Ponto de notificação/alerta visual */}
        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-white dark:border-zinc-950 animate-bounce" />
      </div>
      
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-white">
        {lang === 'pt' ? 'PT' : 'EN'}
      </span>
      
      <div className="h-3 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />
      
      <span className="text-[10px] font-medium text-slate-600 dark:text-gray-100">
        {lang === 'pt' ? 'Português' : 'English'}
      </span>
    </button>
  </div>
</div>
          
          <nav className="flex flex-col gap-2">
            {navLinks.map((link, i) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 py-3 transition-all duration-500 ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}
                  style={{ transitionDelay: `${100 + i * 40}ms` }}
                >
                  <span className={`text-4xl font-bold tracking-tighter ${isActive ? 'text-indigo-600' : 'text-slate-900 dark:text-white'}`}>{link.name}</span>
                  {isActive && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                </Link>
              );
            })}
          </nav>

          <div className={`mt-auto transition-all duration-500 transform-gpu ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
         

           

            <div className="flex flex-col gap-3">
              <Link to="/auth" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-3 w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase active:scale-[0.98] transition-transform">
                <Zap size={18} className="fill-current" />
                {t('btn_dashboard')}
              </Link>
              <button onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 w-full py-4 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200/60 dark:border-slate-800/60 active:opacity-70 transition-opacity duration-200">{t('btn_close')}</button>
            </div>
            
            <div className="flex flex-col items-center gap-3 mt-4 py-2 select-none">
              <div className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800/50" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 flex items-center gap-2">
                © {new Date().getFullYear()} Storely <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-800" /> {t('footer_rights')}
              </p>
               <div className="flex items-center gap-6  px-1">
              <Link to="/suporte" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500"><HelpCircle size={14} />{t('nav_support')}</Link>
              <Link to="/termos" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500"><ShieldCheck size={14} />{t('nav_privacy')}</Link>
            </div>
            </div>

            
          </div>
        </div>
      </div>
    </>
  );
};