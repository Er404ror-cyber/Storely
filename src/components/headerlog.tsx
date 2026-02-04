import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Monitor } from 'lucide-react';
import toast from 'react-hot-toast'; 
export const HeaderLog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const getThemeLabel = () => {
    if (themeMode === 'light') return 'Modo Claro';
    if (themeMode === 'dark') return 'Modo Escuro';
    return 'Automático (Horário)';

  };
  
  const getThemeDescription = () => {
    if (themeMode === 'auto') {
      const isNight = new Date().getHours() >= 18 || new Date().getHours() < 6;
      return isNight ? 'Ativado: Noite (18h-06h)' : 'Ativado: Dia (06h-18h)';
    }
    return 'Definido manualmente';
  };
 
// Definimos 'auto' como valor inicial padrão
const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');
const location = useLocation();


const applyAutoTheme = useCallback((showNotification = false) => {
  const isNight = new Date().getHours() >= 18 || new Date().getHours() < 6;
  document.documentElement.classList.toggle('dark', isNight);
  
  if (showNotification) {
    toast.success(`Auto: ${isNight ? 'Noite' : 'Dia'}`, {
      id: 'theme',
      icon: isNight ? '🌙' : '☀️',
      style: { borderRadius: '12px', background: '#1e293b', color: '#fff' }
    });
  }
}, []);

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
      toast.success(next === 'dark' ? 'Modo Escuro' : 'Modo Claro', { 
        id: 'theme', 
        icon: next === 'dark' ? '🌙' : '☀️' 
      });
    }
  };

  if (document.startViewTransition) document.startViewTransition(update);
  else update();
};
  // 2. Controle de Scroll e Bloqueio
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: 'Suporte', path: '/duvidas' },
  ];

  // Encontrar o nome da página atual para mostrar no mobile
  const currentPage = navLinks.find(link => link.path === location.pathname)?.name || "Menu";

  return (
    <>
      <header 
        className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
          scrolled || isOpen
            ? 'bg-white/95 dark:bg-slate-950/90  border-b border-gray-100 dark:border-slate-800 py-3' 
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex justify-between items-center">
          
          {/* LOGO E INDICADOR MOBILE */}
          <div className="z-[110] flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-white dark:text-slate-900 font-bold text-xs">ST</span>
              </div>
              <h1 className="text-xl font-black tracking-[0.2em] text-slate-900 dark:text-white hidden sm:block">
                STORELY
              </h1>
            </Link>
            
            {/* INDICADOR DE PÁGINA NO CELULAR */}
            {!isOpen && (
              <div className="md:hidden flex items-center gap-2 text-slate-400">
                <span className="text-xs uppercase tracking-widest font-bold">/</span>
                <span className="text-xs uppercase tracking-widest font-bold text-slate-900 dark:text-white animate-in fade-in slide-in-from-left-2">
                  {currentPage}
                </span>
              </div>
            )}
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[13px] uppercase tracking-[0.15em] font-bold transition-all relative group ${
                  location.pathname === link.path ? 'text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 h-[2px] bg-slate-900 dark:bg-white transition-all ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
            ))}
          </nav>

          {/* ACTIONS (Toggle + Auth) */}
          <div className="flex items-center gap-4 md:gap-8 z-[110]">
          <div className="relative group"> 
    {/* Container para o botão e o balão explicativo */}
    <button 
                onClick={toggleTheme}
                className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-transparent hover:border-indigo-500/30 transition-all active:scale-90 transform-gpu"
              >
                <div className="text-slate-600 dark:text-slate-300">
                  {themeMode === 'light' && <Sun size={18} className="text-amber-500 fill-amber-500/10" />}
                  {themeMode === 'dark' && <Moon size={18} className="text-indigo-400 fill-indigo-400/10" />}
                  {themeMode === 'auto' && <Monitor size={18} className="animate-pulse-slow" />}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-[10px] font-bold text-slate-900 dark:text-white leading-none">
                    {themeMode === 'auto' ? 'Auto' : themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
                  </p>
                </div>
              </button>

    {/* TOOLTIP EXPLICATIVO (Aparece no Hover) */}
    <div className="absolute top-full mt-3 right-0 w-48 p-3 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all pointer-events-none z-[120]">
      <p className="text-[11px] font-bold text-slate-900 dark:text-white mb-1">
        {getThemeLabel()}
      </p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
        {themeMode === 'auto' 
          ? `Muda sozinho conforme o horário. ${getThemeDescription()}`
          : 'Este modo permanecerá ativo até que você altere para Automático.'}
      </p>
      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[9px] text-slate-400 italic">
        Clique para alternar
      </div>
    </div>
  </div>
            <Link to="/auth" className="hidden md:block text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Log in
            </Link>
            
            <Link 
              to="/auth" 
              className="hidden md:block px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest rounded-full hover:opacity-90 transition-all shadow-sm shadow-slate-200 dark:shadow-none"
            >
              Get Started
            </Link>

            {/* MOBILE MENU TOGGLE */}
            <button 
              className="md:hidden p-2 text-slate-900 dark:text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <div 
        className={`fixed inset-0 bg-white dark:bg-slate-950 z-[90] md:hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full pt-32 px-10 pb-10">
          <span className="text-slate-300 dark:text-slate-700 text-[11px] font-black tracking-[0.3em] uppercase mb-8">Navegação</span>
          
          <div className="flex flex-col gap-6">
            {navLinks.map((link, i) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-4xl font-bold tracking-tighter transition-all duration-300 ${
                  location.pathname === link.path ? 'text-slate-900 dark:text-white pl-4 border-l-4 border-slate-900 dark:border-white' : 'text-slate-400'
                } ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="mt-auto space-y-4">
            <Link 
              to="/auth"
              onClick={() => setIsOpen(false)}
              className="block w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-center rounded-2xl font-bold text-lg"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};