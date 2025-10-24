import { Link } from "react-router-dom";
import { Header } from "../components/header";


export const Home = () => {
  return (
    <div>
      <Header/>

      
      <div className="relative h-[80vh]">
        {/* Imagem de fundo */}
        <img 
          src="src/img/bolos/entrada.jpg" 
          alt="Campo de rosas"
          className="w-full h-full object-cover"
        />

        {/* Texto sobre a imagem */}
        <div className="absolute inset-0 flex flex-col items-center justify-center 
        text-center text-white bg-black/30">
          <div className=" hover:text-purple-400 
            duration-1000 transition-colors ease-in-out">
          <h1 className="text-5xl font-bold mb-4">
            🌹 Bem-vindo aos doces da Dinalda 🌹
          </h1>
          <p className="text-lg text-center">
            Descubra a beleza do mundo de docuras e rosas que cativam a rodos que experimentam.
          </p>
          </div>
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
              src="src/img/bolos/coracao.jpg" 
              alt="Rosa 2" 
              className="w-60 h-auto border-2 border-purple-400 rounded-lg 
              transition-transform duration-300 hover:scale-110"
            />
            <h1 className="mt-2 font-mono hover:text-purple-400 
            duration-300 transition-colors ease-in-out">Bolos personalizados</h1>
          </Link>

          <Link to={"/Rosas"} className="m-4 text-center">
            <img 
              src="src/img/bolos/combo.jpg" 
              alt="Rosa 3" 
              className="w-60 h-auto border-2 border-purple-400 rounded-lg 
              transition-transform duration-300 hover:scale-110"
            />
            <h1 className="mt-2 font-mono hover:text-purple-400 
            duration-300 transition-colors ease-in-out">Biscoitos</h1>
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

