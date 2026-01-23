 import {Link} from 'react-router-dom';
export const HeaderLog = () => {
   
    return (
    <header>
      {/* CONTAINER PRINCIPAL */}
      <div className='flex justify-between p-6 max-w-7xl mx-auto z-10 bg-purple-500/40 rounded-b-2xl'>
     <div>
      
       {/* LOGO À ESQUERDA */}
       <Link to="/" className="">
          <h1 className="text-2xl font-bold bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Logo Aqui
          </h1>
        </Link>
     </div>

     <div> 
     <nav className="absolute left-1/2 -translate-x-1/2 flex gap-8 font-medium text-lg">
          <Link to="" className="hover:bg-linear-to-r hover:from-blue-500 hover:to-purple-600 hover:bg-clip-text hover:text-transparent">Sobre </Link>
          <Link to="" className="hover:bg-linear-to-r hover:from-blue-500 hover:to-purple-600 hover:bg-clip-text hover:text-transparent">Duvidas</Link>          
          <Link to="" className="hover:bg-linear-to-r hover:from-blue-500 hover:to-purple-600 hover:bg-clip-text hover:text-transparent">Contatos</Link>          
          </nav>
     </div>

     <div>
     <Link to='/auth' 
      className="bg-white text-gray-800 p-2 rounded-2xl font-medium ">Login</Link> 
            
     </div>
  </div>
      {/* CONTAINER PRINCIPAL */}


        
     

    </header>
  );
}