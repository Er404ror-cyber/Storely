 import {Link} from 'react-router-dom';
export const HeaderLog = () => {
   
    return (
    <header>
      {/* CONTAINER PRINCIPAL */}
      <div className='flex justify-between p-6 max-w-7xl mx-auto z-10 bg-transparent rounded-b-2xl'>
     <div>
      
       {/* LOGO À ESQUERDA */}
       <Link to="/" className="">
          <h1 className="text-2xl font-bold bg-linear-to-r from-orange-500 to-cyan-800 bg-clip-text text-transparent">
            STORELY
          </h1>
        </Link>
     </div>

     <div> 
     <nav className="absolute left-1/2 -translate-x-1/2 flex gap-8 font-medium text-lg">
          <Link to="" className="hover:bg-linear-to-r hover:from-blue-500 hover:to-purple-600 hover:bg-clip-text hover:text-transparent text-black">Sobre </Link>
          <Link to="/faq" className="hover:bg-linear-to-r hover:from-blue-500 hover:to-purple-600 hover:bg-clip-text hover:text-transparent text-black">Duvidas</Link>          
          <Link to="" className="hover:bg-linear-to-r hover:from-blue-500 hover:to-purple-600 hover:bg-clip-text hover:text-transparent text-black">Contatos</Link>          
          </nav>
     </div>

     <div>
     <Link to='/auth' 
      className="bg-orange-500 text-gray-800 p-2 rounded-2xl font-medium ">Login</Link> 
            
     </div>
  </div>
      {/* CONTAINER PRINCIPAL */}


        
     

    </header>
  );
}