import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop py-2'
          : 'bg-transparent py-4'
      }`}
    >
      {/* CONTAINER PRINCIPAL */}
      <div className="relative flex items-center px-6 max-w-7xl mx-auto">
        
        {/* LOGO À ESQUERDA */}
        <Link to="/" className="z-10">
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Dinalda 🌹
          </span>
        </Link>

        {/* MENU CENTRALIZADO */}
        <nav className="absolute left-1/2 -translate-x-1/2 flex gap-8 font-medium text-lg">
          <Link to="/" className="hover:text-pink-500 transition-colors">Início </Link>
          <Link to="/rosas" className="hover:text-pink-500 transition-colors">Catálogo</Link>          
          <Link to="/Contacto" className="hover:text-pink-500 transition-colors">Contato</Link>
            
          
        </nav>

      </div>
    </header>
  );
};
