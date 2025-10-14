import { Link } from 'react-router-dom';
import { Header } from '../components/header';

const Rosas = () => {
  return (

  <div className=' '> 
    <Header/>
    
    <div className=''>
    

    <div className="flex justify-center  p-6">


      <div className="flex max-w-2xl w-full rounded-lg shadow-lg bg-gray-200  m-2
      transition-transform duration-300 hover:scale-110">
       
        <div className="w-2/6 p-2 bg-sky-50">
          <img 
            src="src/img/2_caixs.JPEG"
            alt="Foto "
            className="w-full h-full object-cover rounded-md"
          />         
        </div>

        
        <div className="w-4/6 p-6 ">
          <h3 className="text-xl font-semibold mt-2">Caixa Luxo 20 Rosas </h3>
          <p className="text-gray-600 mt-5 text-sm">
          <p> Encante com elegância e romantismo! 💖</p>
          Caixa Luxo com 20 Rosas Vermelha, presente ideal para expressar amor e paixão. 
          </p>

        <div className='flex justify-between'>         
          <Link to={"/Box"}className='border rounded p-2 bg-blue-700 mt-5
          text-white'
          type='submit'>detalhes</Link>
        </div>
        </div>       
      </div>

        <div className=" duration-300 hover:scale-110
        flex max-w-2xl w-full rounded-lg shadow-lg bg-gray-200  m-2">
       
        <div className="w-2/6 p-2 bg-sky-50">
          <img 
            src="src/img/buque_20.JPEG"
            alt="Foto "
            className="w-full h-full object-cover rounded-md"
          />
          
        </div>

        
        <div className="w-4/6 p-6">
          <h3 className="text-xl font-semibold mt-2">Bouquet 20 rosas 💐</h3>
          <p className="text-gray-600 mt-5 text-sm">
           Classica que encanta qualquer amante de flore elegante, apaixonante 
           e perfeito para expressar amor em cada detalhe. 
          </p>
        <div className='flex justify-between'>
         <Link to={"/Buque"}className='border rounded p-2  bg-blue-700 mt-5
          text-white'
          type='submit'>detalhes</Link>
        </div>
        </div>
        
      </div>

     

    </div>
    
<div className="flex flex-wrap justify-center gap-8 p-6">
 
 
  <div className="flex flex-col md:flex-row max-w-xl w-full rounded-lg shadow-lg bg-gray-200
  duration-300 hover:scale-110">
    <div className="w-full md:w-2/6 p-2 bg-sky-50 flex items-center">
      <img 
        src="src/img/cetim.JPEG"
        alt="Foto"
        className="w-full h-full object-cover rounded-md"
      />
    </div>
    <div className="w-full md:w-4/6 p-6 flex flex-col justify-between">
      <h3 className="text-xl font-semibold mt-2">Rosa de cetim</h3>
      <p className="text-gray-600 mb-3 text-sm mt-5">
        duradoura e perfeita para eternizar sentimentos com um toque de delicadeza e sofisticação.
      </p>
      <div className='flex justify-between'>
        <Link to={"/Cetim"} className='border rounded p-2 mt-5 bg-blue-700 text-white' type='submit'>
          detalhes
        </Link>
      </div>
    </div>
  </div>

  
  <div className="flex flex-col md:flex-row max-w-xl w-full rounded-lg shadow-lg bg-gray-200
  duration-300 hover:scale-110">
    <div className="w-full md:w-2/6 p-2 bg-sky-50 flex items-center">
    
    </div>
    <div className="w-full md:w-4/6 p-6 flex flex-col justify-between">
      <h1 className="text-xl font-semibold mt-2">Pedido Personalizado</h1>
      <p className="text-gray-600 mb-3 text-sm mt-5">
        Venha para esse campo para fazer um pedido personalizado que não tenha no nosso catálogo.
      </p>
      <button
        type="submit"
        className="border rounded p-2 mt-5 bg-blue-700 text-white"
      >
        Personalizar
      </button>
    </div>
  </div>
</div>

     </div>
</div> 
  )
}

export default Rosas