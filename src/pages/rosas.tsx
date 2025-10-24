import { Link } from 'react-router-dom';
import { Header } from '../components/header';

const Rosas = () => {
  return (

  <div className=' '> 
    <Header/>
    
    <div className=''>
    

    <div className="flex justify-center  p-6">

{/*caixa de 20*/}
      <div className="flex  w-full rounded-lg shadow-lg bg-gray-200  m-2
      transition-transform duration-300 hover:scale-110">
       
        <div className="w-2/6 p-2 bg-sky-50">
          <img 
            src="src/img/2_caixs.JPEG"
            alt="Foto "
            className="w-50 h-full object-cover rounded-md"
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

{/*bolo de 2 camadas*/}
       <div className="flex  w-full rounded-lg shadow-lg bg-gray-200  m-2
      transition-transform duration-300 hover:scale-110">
       
        <div className="w-2/6 p-2 bg-sky-50">
          <img 
            src="src/img/bolos/normal.jpg"
            alt="Foto "
            className="w-50 h-full object-cover rounded-md"
          />         
        </div>

        
        <div className="w-4/6 p-6 ">
          <h3 className="text-xl font-semibold mt-2">Bolo normal </h3>
          <p className="text-gray-600 mt-5 text-sm">
          <p> Bolo perfeito para pequenas celebrar pquenas ocasioes ou 
            degustar sozinho
          </p>
          
          </p>

        <div className='flex justify-between'>         
          <Link to={"/Normal"}className='border rounded p-2 bg-blue-700 mt-5
          text-white mt-15'
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

        {/*buque de 20*/}
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
    

    {/*segunda parte*/}
  <div className="flex  justify-center gap-8 p-6">
 
{/*bolo de 2 camadas */}
     <div className="flex  w-full rounded-lg shadow-lg bg-gray-200  m-2
      transition-transform duration-300 hover:scale-110">
       
        <div className="w-2/6 p-2 bg-sky-50">
          <img 
            src="src/img/bolos/2_camadas.jpg"
            alt="Foto "
            className="w-50 h-full object-cover rounded-md"
          />         
        </div>

        
        <div className="w-4/6 p-6 ">
          <h3 className="text-xl font-semibold mt-2">Bolo de 2 camadas </h3>
          <p className="text-gray-600 mt-5 text-sm">
          Um bolo maior para convivios maiores que vai satisfazer a todos convidados           
          </p>

        <div className='flex justify-between'>         
          <Link to={"/Camadas"}className='border rounded p-2 bg-blue-700 mt-5
          text-white mt-15'
          type='submit'>detalhes</Link>
        </div>
        </div>       
      </div>



 {/*rosas de cetim */}
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

 
{/*bolo quadrado*/}
  <div className="flex  w-full rounded-lg shadow-lg bg-gray-200  m-2
      transition-transform duration-300 hover:scale-110">
       
        <div className="w-2/6 p-2 bg-sky-50">
          <img 
            src="src/img/bolos/quadrado.jpg"
            alt="Foto "
            className="w-50 h-full object-cover rounded-md"
          />         
        </div>

        
        <div className="w-4/6 p-6 ">
          <h3 className="text-xl font-semibold mt-2">Bolo quadrado </h3>
          <p className="text-gray-600 mt-5 text-sm">
         Bolo grande perfeito para grandes celebracoes que envolvam muitos convidados 

          </p>

        <div className='flex justify-between'>         
          <Link to={"/Quadrado"}className='border rounded p-2 bg-blue-700 mt-5
          text-white mt-15'
          type='submit'>detalhes</Link>
        </div>
        </div>       
      </div>

    
</div>


{/*terceira parte*/}
    <div className='flex justify-center p-6'>
  {/*biscoitos*/}
    <div className="flex  w-full rounded-lg shadow-lg bg-gray-200  m-2
      transition-transform duration-300 hover:scale-110">
       
        <div className="w-2/6 p-2 bg-sky-50">
          <img 
            src="src/img/bolos/biscoitos.jpg"
            alt="Foto "
            className="w-50 h-full object-cover rounded-md"
          />         
        </div>

        
        <div className="w-4/6 p-6 ">
          <h3 className="text-xl font-semibold mt-2">Biscoitos</h3>
          <p className="text-gray-600 mt-5 text-sm">
         Biscoitos de chocolate e amanteigados cobertos de chocolate 
          </p>

        <div className='flex justify-between'>         
          <Link to={"/Biscoito"}className='border rounded p-2 bg-blue-700 mt-5
          text-white mt-15'
          type='submit'>detalhes</Link>
        </div>
        </div>       
      </div>

   {/*orelhudos*/}
    <div className="flex  w-full rounded-lg shadow-lg bg-gray-200  m-2
      transition-transform duration-300 hover:scale-110">
       
        <div className="w-2/6 p-2 bg-sky-50">
          <img 
            src="src/img/bolos/orelhudos.jpg"
            alt="Foto "
            className="w-50 h-full object-cover rounded-md"
          />         
        </div>

        
        <div className="w-4/6 p-6 ">
          <h3 className="text-xl font-semibold mt-2">Oreludos</h3>
          <p className="text-gray-600 mt-5 text-sm">
        Cupcakes fofos com creme de custarde e acucar polvilhado por cima
          </p>

        <div className='flex justify-between'>         
          <Link to={"/Orelhodos"}className='border rounded p-2 bg-blue-700 mt-5
          text-white mt-15'
          type='submit'>detalhes</Link>
        </div>
        </div>       
      </div>



{/*bombom*/}
    <div className="flex  w-full rounded-lg shadow-lg bg-gray-200  m-2
      transition-transform duration-300 hover:scale-110">
       
        <div className="w-2/6 p-2 bg-sky-50">
          <img 
            src="src/img/bolos/bombom.jpg"
            alt="Foto "
            className="w-50 h-full object-cover rounded-md"
          />         
        </div>

        
        <div className="w-4/6 p-6 ">
          <h3 className="text-xl font-semibold mt-2">Bombom</h3>
          <p className="text-gray-600 mt-5 text-sm">
          Bombons caseiros recheados de chocolate por dentro e decoracao personalizada 
          </p>

        <div className='flex justify-between'>         
          <Link to={"/Bombom"}className='border rounded p-2 bg-blue-700 mt-5
          text-white mt-15'
          type='submit'>detalhes</Link>
        </div>
        </div>       
      </div>

      </div>


    {/*quarta parte*/}
    <div className='flex justify-center p-6'>
      {/*gulabos*/}
    <div className="flex  w-full rounded-lg shadow-lg bg-gray-200  m-2
      transition-transform duration-300 hover:scale-110">
       
        <div className="w-2/6 p-2 bg-sky-50">
          <img 
            src="src/img/bolos/gulabos.jpg"
            alt="Foto "
            className="w-50 h-full object-cover rounded-md"
          />         
        </div>

        
        <div className="w-4/6 p-6 ">
          <h3 className="text-xl font-semibold mt-2">Gulabos</h3>
          <p className="text-gray-600 mt-5 text-sm">
            Gulabos polvilhados de coco ralado 
          </p>

        <div className='flex justify-between'>         
          <Link to={"/Gulabos"}className='border rounded p-2 bg-blue-700 mt-5
          text-white mt-15'
          type='submit'>detalhes</Link>
        </div>
        </div>       
      </div>



{/*bolo no pote*/}
    <div className="flex  w-full rounded-lg shadow-lg bg-gray-200  m-2
      transition-transform duration-300 hover:scale-110">
       
        <div className="w-2/6 p-2 bg-sky-50">
          <img 
            src="src/img/bolos/pote.jpg"
            alt="Foto "
            className="w-50 h-full object-cover rounded-md"
          />         
        </div>

        
        <div className="w-4/6 p-6 ">
          <h3 className="text-xl font-semibold mt-2">bolo no pote</h3>
          <p className="text-gray-600 mt-5 text-sm">
            Bolo no pote de diferentes sabores recheados de cremes e granolas
          </p>

        <div className='flex justify-between'>         
          <Link to={"/Pote"}className='border rounded p-2 bg-blue-700 mt-5
          text-white mt-15'
          type='submit'>detalhes</Link>
        </div>
        </div>       
      </div>


{/*marmita*/}
    <div className="flex  w-full rounded-lg shadow-lg bg-gray-200  m-2
      transition-transform duration-300 hover:scale-110">
       
        <div className="w-2/6 p-2 bg-sky-50">
          <img 
            src="src/img/bolos/marmita.jpg"
            alt="Foto "
            className="w-50 h-full object-cover rounded-md"
          />         
        </div>

        
        <div className="w-4/6 p-6 ">
          <h3 className="text-xl font-semibold mt-2">Marmita</h3>
          <p className="text-gray-600 mt-5 text-sm">
          Uma marmita de bolo de chocolate com cobertura e granulados
          </p>

        <div className='flex justify-between'>         
          <Link to={"/Marmita"}className='border rounded p-2 bg-blue-700 mt-5
          text-white mt-15'
          type='submit'>detalhes</Link>
        </div>
        </div>       
      </div>

    </div>


{/*quinta parte*/}
    <div className='flex justify-center p-6'>
      {/*mini bolo*/}
    <div className="flex  w-full rounded-lg shadow-lg bg-gray-200  m-2
      transition-transform duration-300 hover:scale-110">
       
        <div className="w-2/6 p-2 bg-sky-50">
          <img 
            src="src/img/bolos/mini.jpg"
            alt="Foto "
            className="w-50 h-full object-cover rounded-md"
          />         
        </div>

        
        <div className="w-4/6 p-6 ">
          <h3 className="text-xl font-semibold mt-2">Mini bolo</h3>
          <p className="text-gray-600 mt-5 text-sm">
            Mini bolos em takewas 
          </p>

        <div className='flex justify-between'>         
          <Link to={"/Mini"}className='border rounded p-2 bg-blue-700 mt-5
          text-white mt-15'
          type='submit'>detalhes</Link>
        </div>
        </div>       
      </div>


      {/*combos*/}
    <div className="flex  w-full rounded-lg shadow-lg bg-gray-200  m-2
      transition-transform duration-300 hover:scale-110">
       
        <div className="w-2/6 p-2 bg-sky-50">
          <img 
            src="src/img/bolos/dois.jpg"
            alt="Foto "
            className="w-50 h-full object-cover rounded-md"
          />         
        </div>

        
        <div className="w-4/6 p-6 ">
          <h3 className="text-xl font-semibold mt-2">Combos</h3>
          <p className="text-gray-600 mt-5 text-sm">
            Um combo de mini bolo e Cupcakes em uma caixa decorada
          </p>

        <div className='flex justify-between'>         
          <Link to={"/Combo"}className='border rounded p-2 bg-blue-700 mt-5
          text-white mt-15'
          type='submit'>detalhes</Link>
        </div>
        </div>       
      </div>


      {/*pedido personalizado*/}
 
  <div className="flex  w-full rounded-lg shadow-lg bg-gray-200
  duration-300 hover:scale-110">
   
    <div className="w-full  p-6 flex flex-col justify-between">
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