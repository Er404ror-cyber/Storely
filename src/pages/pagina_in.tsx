import { Link } from "react-router-dom";
import { Header } from "../components/header";


export const Home = () => {
  return (
    <div>
      <Header/>

      
      <div className="relative h-[80vh]">
        {/* Imagem de fundo */}
        <img 
          src="src/img/campo_rosas.webp" 
          alt="Campo de rosas"
          className="w-full h-full object-cover"
        />

        {/* Texto sobre a imagem */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white bg-black/30">
          <h1 className="text-5xl font-bold mb-4">
            🌹 Bem-vindo ao Campo das Rosas 🌹
          </h1>
          <p className="text-lg max-w-2xl">
            Descubra a beleza das rosas com nossos arranjos exclusivos e especiais para você.
          </p>
          <button className="bg-fuchsia-300 p-3 border border-white rounded-lg m-8">ver mais</button>
        </div>
      </div>

      {/* Seção das mixi exibicao*/}
      <div className="bg-gradient-to-r from-white to-pink-300 py-16">
        <div className="flex justify-center flex-wrap">

          <Link to={"/Rosas"} className="m-4 text-center">
            <img 
              src="src/img/2_caixs.JPEG" 
              alt="Rosa 1" 
              className="w-60 h-auto border-2 border-purple-400 rounded-lg 
              transition-transform duration-300 hover:scale-110"
            />                                          
            <h1 className="mt-2 font-mono hover:text-purple-400 
            duration-300 transition-colors ease-in-out">Caixa de Rosas</h1>
          </Link>

          <Link to={"/Rosas"} className="m-4 text-center">
            <img 
              src="src/img/cetim.JPEG" 
              alt="Rosa 2" 
              className="w-60 h-auto border-2 border-purple-400 rounded-lg 
              transition-transform duration-300 hover:scale-110"
            />
            <h1 className="mt-2 font-mono hover:text-purple-400 
            duration-300 transition-colors ease-in-out">Rosas de Setim</h1>
          </Link>

          <Link to={"/Rosas"} className="m-4 text-center">
            <img 
              src="src/img/mix.JPEG" 
              alt="Rosa 3" 
              className="w-60 h-auto border-2 border-purple-400 rounded-lg 
              transition-transform duration-300 hover:scale-110"
            />
            <h1 className="mt-2 font-mono hover:text-purple-400 
            duration-300 transition-colors ease-in-out">Bouquet de Rosas</h1>
          </Link>

        </div>
      </div>

      {/* Motivo de escolher nossa loja*/}
       <div className="flex justify-between  bg-gradient-to-r from-white to-pink-300 ">
        <div className="w-1/2 flex flex-col 
        items-center ">
        <div className="w-90 h-60 bg-gray-100 rounded-2xl shadow-md flex flex-col 
        items-center justify-center  ">
          <img 
            src="src/img/entregador_mota.webp" 
            alt="Entregador" 
            className="w-20 h-20 mb-2 "
          />
          <p className="text-sm font-bold">Delivery</p>
          <p className="text-center">
            Serviço de entrega rápido e seguro       Serviço de entrega rápido e seguro 
            Serviço de entrega rápido e seguro 
            Serviço de entrega rápido e seguro 

          </p>
        </div>
        </div>
        
        

        
        <div className="w-1/2 flex flex-col 
        items-center ">
        <div className="w-90 h-60 bg-gray-100 rounded-2xl shadow-md flex flex-col 
        items-center justify-center  ">
          <img 
            src="src/img/entregador_mota.webp" 
            alt="Entregador" 
            className="w-20 h-20 mb-2 "
          />
          <p className="text-sm font-bold">Delivery</p>
          <p className="text-center">
            Serviço de entrega rápido e seguro       Serviço de entrega rápido e seguro 
            Serviço de entrega rápido e seguro 
            Serviço de entrega rápido e seguro 

          </p>
        </div>
        </div>

        </div>
        

        </div>

     
    
  )
}

export default Home;

