 import {Link} from 'react-router-dom';
export const HeaderLog = () => {
   
    return (
    <header>
      {/* CONTAINER PRINCIPAL */}
      <div className="relative flex items-center p-6 max-w-7xl mx-auto z-10 bg-purple-500/10 rounded-b-2xl ">
        
        {/* LOGO À ESQUERDA */}
        <Link to="/" className="">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Logo Aqui
          </span>
        </Link>

        {/* MENU CENTRALIZADO */}
        <nav className="absolute left-1/2 -translate-x-1/2 flex gap-8 font-medium text-lg">
          <Link to="" className="hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:bg-clip-text hover:text-transparent">Sobre </Link>
          <Link to="" className="hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:bg-clip-text hover:text-transparent">Duvidas</Link>          
          <Link to="" className="hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:bg-clip-text hover:text-transparent">Contatos</Link>          
          <button to="/auth" className="hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:bg-clip-text hover:text-transparent">Login</button>          
        </nav>

      </div>
    </header>
  );
}