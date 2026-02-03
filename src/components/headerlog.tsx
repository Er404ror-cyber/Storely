 import {Link} from 'react-router-dom';
export const HeaderLog = () => {
   
    return (
    <header>
      {/* CONTAINER PRINCIPAL */}
      <div className='flex justify-between p-6 max-w-7xl mx-auto z-10 bg-transparent rounded-b-2xl'>
     <div>
      
       {/* LOGO À ESQUERDA */}
       <Link to="/" className="">
          <h1 className="text-2xl font-bold bg-linear-to-r from-blue-500 to-gray-200 bg-clip-text text-transparent">
            STORELY
          </h1>
        </Link>
     </div>

     <div> 
     <nav className="absolute left-1/2 -translate-x-1/2 flex gap-8 font-medium text-lg">
          <Link to="/" className="hover:bg-linear-to-r hover:from-blue-500 hover:to-gray-200 hover:bg-clip-text hover:text-transparent text-black">Home </Link>
          <Link to="/blog" className="hover:bg-linear-to-r hover:from-blue-500 hover:to-gray-200 hover:bg-clip-text hover:text-transparent text-black">Blog </Link>
          <Link to="/duvidas" className="hover:bg-linear-to-r hover:from-blue-500 hover:to-gray-200 hover:bg-clip-text hover:text-transparent text-black">Duvidas</Link>          
          </nav>
     </div>

     <div>
     <Link to='/auth' 
      className="bg-blue-500 text-gray-800 p-2 rounded-2xl font-medium ">Login</Link> 
            
     </div>
  </div>
      {/* CONTAINER PRINCIPAL */}


        
     

    </header>
  );
}