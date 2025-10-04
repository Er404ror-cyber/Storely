import { Link } from 'react-router-dom';
import { Header } from '../components/header';

const Rosas = () => {
  return (

  <div className='h-screen bg-gray-200'> 
    <Header/>
    
    <div className=''>
     <div className="transition-transform duration-300 hover:scale-110 max-w-md mx-auto bg-white shadow-md rounded-lg p-6 my-8">
        <h1 className="text-3xl font-bold text-center mb-4">Pedido Personalizado</h1>
        <p className="text-center text-gray-700 mb-6">
          Venha para esse campo para fazer um pedido personalizado que não tenha no nosso catálogo.
        </p>
        <button
          type="submit"
          className="block mx-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-3 transition"
        >
          Personalizar
        </button>
      </div>

    <div className="flex items-center justify-center  p-6 ">

     



      <div className="flex max-w-2xl w-full rounded-lg shadow-lg bg-white  m-2
      transition-transform duration-300 hover:scale-110">
       
        <div className="w-2/6 p-2 bg-sky-50">
          <img 
            src="src/img/2_caixs.JPEG"
            alt="Foto "
            className="w-full h-full object-cover rounded-md"
          />
          
        </div>

        
        <div className="w-4/6 p-6 ">
          <h3 className="text-xl font-semibold mb-2">Flower box</h3>
          <p className="text-gray-600 mb-3 text-sm">
            rosas de caixa rosas de caixa rosas de caixa rosas de caixa rosas de caixa rosas de caixa
            rosas de caixa rosas de caixa v rosas de caixa
          </p>
        <div className='flex justify-between'>
         
          <Link to={"/Box"}className='border rounded p-1 bg-blue-700
          text-white'
          type='submit'>detalhes</Link>
        </div>
        </div>
        
      </div>

        <div className="transition-transform duration-300 hover:scale-110
        flex max-w-2xl w-full rounded-lg shadow-lg bg-white  m-2">
       
        <div className="w-2/6 p-2 bg-sky-50">
          <img 
            src="src/img/buque_20.JPEG"
            alt="Foto "
            className="w-full h-full object-cover rounded-md"
          />
          
        </div>

        
        <div className="w-4/6 p-6">
          <h3 className="text-xl font-semibold mb-2">Flower box</h3>
          <p className="text-gray-600 mb-3 text-sm">
            rosas de caixa rosas de caixa rosas de caixa rosas de caixa rosas de caixa rosas de caixa
            rosas de caixa rosas de caixa v rosas de caixa
          </p>
        <div className='flex justify-between'>
         <Link to={"/Buque"}className='border rounded p-2  bg-blue-700
          text-white'
          type='submit'>detalhes</Link>
        </div>
        </div>
        
      </div>

      <div className="transition-transform duration-300 hover:scale-110
      flex max-w-2xl w-full rounded-lg shadow-lg bg-white ">
       
        <div className="w-2/6 p-2 bg-sky-50">
          <img 
            src="src/img/cetim.JPEG"
            alt="Foto "
            className="w-full h-full object-cover rounded-md"
          />
          
        </div>

        
        <div className="w-4/6 p-6">
          <h3 className="text-xl font-semibold mb-2">Flower box</h3>
          <p className="text-gray-600 mb-3 text-sm">
            rosas de caixa rosas de caixa rosas de caixa rosas de caixa rosas de caixa rosas de caixa
            rosas de caixa rosas de caixa v rosas de caixa
          </p>
        <div className='flex justify-between'>
         <Link to={"/Cetim"}className='border rounded p-2  bg-blue-700
          text-white'
          type='submit'>detalhes</Link>
        </div>
        </div>
        
      </div>


    </div>

    <div className="flex items-center justify-center  p-6 ">
            <div className="transition-transform duration-300 hover:scale-110
            flex max-w-2xl w-full rounded-lg shadow-lg bg-white m-2">
            
                <div className="w-2/6 p-2 bg-sky-50">
                <img 
                    src="src/img/1_boque.JPEG"
                    alt="Foto "
                    className="w-full h-full object-cover rounded-md"
                />
                
                </div>

                
                <div className="w-4/6 p-6">
                <h3 className="text-xl font-semibold mb-2">Flower box</h3>
                <p className="text-gray-600 mb-3 text-sm">
                    rosas de caixa rosas de caixa rosas de caixa rosas de caixa rosas de caixa rosas de caixa
                    rosas de caixa rosas de caixa v rosas de caixa
                </p>
                <div className='flex justify-between'>
         <Link to={"/Bu10"} className='border rounded p-2  bg-blue-700
          text-white'
          type='submit'>detalhes</Link>
        </div>
                </div>                            
            </div>

            <div className="transition-transform duration-300 hover:scale-110
            flex max-w-2xl w-full rounded-lg shadow-lg bg-white m-2">
            
                <div className="w-2/6 p-2 bg-sky-50">
                <img 
                    src="src/img/caixa_de_10.JPEG"
                    alt="Foto "
                    className="w-full h-full object-cover rounded-md"
                />
                
                </div>

                
                <div className="w-4/6 p-6">
                <h3 className="text-xl font-semibold mb-2">Flower box</h3>
                <p className="text-gray-600 mb-3 text-sm">
                    rosas de caixa rosas de caixa rosas de caixa rosas de caixa rosas de caixa rosas de caixa
                    rosas de caixa rosas de caixa v rosas de caixa
                </p>
                <div className='flex justify-between'>
         <Link to={"/ca10"} className='border rounded p-2  bg-blue-700
          text-white'
          type='submit'>detalhes</Link>
        </div>
                </div>                            
            </div>

            <div className="transition-transform duration-300 hover:scale-110
            flex max-w-2xl w-full rounded-lg shadow-lg bg-white m-2">
            
                <div className="w-2/6 p-2 bg-sky-50">
                <img 
                    src="src/img/mix.JPEG"
                    alt="Foto "
                    className="w-full h-full object-cover rounded-md"
                />
                
                </div>

                
                <div className="w-4/6 p-6">
                <h3 className="text-xl font-semibold mb-2">Flower box</h3>
                <p className="text-gray-600 mb-3 text-sm">
                    rosas de caixa rosas de caixa rosas de caixa rosas de caixa rosas de caixa rosas de caixa
                    rosas de caixa rosas de caixa v rosas de caixa
                </p>
                  <div className='flex justify-between'>
         <Link to={"/Mix"} className='border rounded p-2  bg-blue-700
          text-white'
          type='submit'>detalhes</Link>
        </div>
                </div>                            
            </div>
     </div>
     </div>
</div> 
  )
}

export default Rosas