import { Link } from "react-router-dom";
import { Header } from "../components/headeroficial";


export const Home = () => {
  return (
    <div>
      <Header/>

      
      <div className="relative h-[80vh]">
        {/* Imagem de fundo */}
        <img 
          src="public\img\bolos\intro.jpg" 
          alt="Campo de rosas"
          className="w-full h-full object-cover"
        />

        {/* Texto sobre a imagem */}
        <div className="absolute inset-0 flex flex-col items-center justify-center 
        text-center text-white bg-black/30">
          <div className=" hover:text-purple-400 
            duration-1000 transition-colors ease-in-out">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-lg">
          Doces da <span className="text-purple-400 italic">Dinalda</span>
        </h1>
          <p className="text-lg text-center">
            Descubra a beleza do mundo de docuras e rosas que cativam a rodos que experimentam.
          </p>
          </div>
        </div>
      </div>

      {/* Seção das mixi exibicao*/}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-300 py-16">
        
          <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Mini Exibição 💮</h2>
           <p className="mt-6 text-gray-600 max-w-xl mx-auto">
            Uma prévia das nossas criações mais amadas, feitas com ingredientes premium e muito carinho.
          </p>
</div>
        <div className="flex justify-center flex-wrap">
          <Link to={"/Rosas"} className="m-4 text-center">
            <img 
              src="public\img\caixa_de_10.JPEG" 
              alt="Rosa 1" 
              className="w-60 h-auto border-2 border-purple-400 rounded-lg 
              transition-transform duration-300 hover:scale-110"
            />                                          
            <h1 className="mt-2 font-serif hover:text-purple-400 
            duration-300 transition-colors ease-in-out">Caixa de Rosas</h1>
          </Link>

          <Link to={"/Rosas"} className="m-4 text-center">
            <img 
              src="public\img\bolos\coracao.jpg" 
              alt="Rosa 2" 
              className="w-60 h-auto border-2 border-purple-400 rounded-lg 
              transition-transform duration-300 hover:scale-110"
            />
            <h1 className="mt-2 font-serif hover:text-purple-400 
            duration-300 transition-colors ease-in-out">Bolos personalizados</h1>
          </Link>

          <Link to={"/Rosas"} className="m-4 text-center">
            <img 
              src="public\img\bolos\combo.jpg" 
              alt="Rosa 3" 
              className="w-60 h-auto border-2 border-purple-400 rounded-lg 
              transition-transform duration-300 hover:scale-110"
            />
            <h1 className="mt-2 font-serif hover:text-purple-400 
            duration-300 transition-colors ease-in-out">Biscoitos</h1>
          </Link>

        </div>
      </div>

      {/* Motivo de escolher nossa loja*/}
      <section className=" bg-gradient-to-r from-blue-50 to-indigo-300">
    <h2 className="text-center text-4xl font-bold mb-14">Por que escolher a Petal🌹</h2>
       <div className="flex justify-between  ">
        
      {/*primeiro cartao*/}
        <div className="w-1/2 flex flex-col mb-6 items-center ">
        <div className="w-90 h-60 bg-gray-100 rounded-2xl shadow-md flex flex-col 
        items-center justify-center  border-2 border-purple-300">
          <img 
            src="public\img\delivery.png" 
            alt="Entregador" 
            className="w-20 h-20 mb-2 "
          />
          <p className="text-sm font-bold">Delivery</p>
          <p className="text-center">
           Serviço de delivery seguro e pontual, garantindo que seus doces cheguem frescos e impecáveis.
          </p>
        </div>
        </div>
        
        

        {/*segundo cartao*/}
        <div className="w-1/2 flex flex-col mb-6 items-center ">
        <div className="w-90 h-60 bg-gray-100 rounded-2xl shadow-md flex flex-col 
        items-center justify-center border-2 border-purple-300 ">
          <img 
            src="public\img\personalizacao.png" 
            alt="Entregador" 
            className="w-20 h-20 mb-2 "
          />
          <p className="text-sm font-bold">Personalização Total</p>
          <p className="text-center">
            acilidade de customizar seus pedidos para aniversários, casamentos ou ocasiões especiais.
          </p>
        </div>
        </div>

        </div></section>
        
         <section className="bg-gradient-to-r from-blue-50 to-indigo-300 py-20 text-center ">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6 italic">Transforme seus momentos em doçura</h2>
          <p className="text-lg mb-8 opacity-90">
            Cada doce é uma obra de arte feita à mão, pronta para encantar seus sentidos e perfumar seu dia com a delicadeza das rosas.
          </p>
          <button className="bg-white text-pink-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-pink-50 transition-all shadow-xl">
            Fazer Encomenda no WhatsApp
          </button>
        </div>
      </section>

        </div>

     
    
  )
}

export default Home;

