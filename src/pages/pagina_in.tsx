import { Link } from "react-router-dom";
import { Header } from "../components/header";


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
          <h1 className="text-5xl font-bold mb-4">
            🌹 Bem-vindo aos doces da Dinalda 🌹
          </h1>
          <p className="text-lg text-center">
            Descubra a beleza do mundo de docuras e rosas que cativam a rodos que experimentam.
          </p>
          </div>
        </div>
      </div>

      {/* Seção das mixi exibicao*/}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-300 py-16">
        
          <h1 className="text-center font-mono m-10">mini exibicao💮</h1>
        <div className="flex justify-center flex-wrap">
          <Link to={"/Rosas"} className="m-4 text-center">
            <img 
              src="public\img\caixa_de_10.JPEG" 
              alt="Rosa 1" 
              className="w-60 h-auto border-2 border-purple-400 rounded-lg 
              transition-transform duration-300 hover:scale-110"
            />                                          
            <h1 className="mt-2 font-mono hover:text-purple-400 
            duration-300 transition-colors ease-in-out">Caixa de Rosas</h1>
          </Link>

          <Link to={"/Rosas"} className="m-4 text-center">
            <img 
              src="public\img\bolos\coracao.jpg" 
              alt="Rosa 2" 
              className="w-60 h-auto border-2 border-purple-400 rounded-lg 
              transition-transform duration-300 hover:scale-110"
            />
            <h1 className="mt-2 font-mono hover:text-purple-400 
            duration-300 transition-colors ease-in-out">Bolos personalizados</h1>
          </Link>

          <Link to={"/Rosas"} className="m-4 text-center">
            <img 
              src="public\img\bolos\combo.jpg" 
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
      <h1 className="text-center font-mono bg-gradient-to-r from-blue-50 to-indigo-300 p-10">
        Porque a Petal🌹
        </h1>
       <div className="flex justify-between  bg-gradient-to-r from-blue-50 to-indigo-300 ">
        
      {/*primeiro cartao*/}
        <div className="w-1/2 flex flex-col 
        items-center ">
        <div className="w-90 h-60 bg-gray-100 rounded-2xl shadow-md flex flex-col 
        items-center justify-center  ">
          <img 
            src="public\img\entregador_mota.webp" 
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
        
        

        {/*segundo cartao*/}
        <div className="w-1/2 flex flex-col 
        items-center ">
        <div className="w-90 h-60 bg-gray-100 rounded-2xl shadow-md flex flex-col 
        items-center justify-center  ">
          <img 
            src="public\img\entregador_mota.webp" 
            alt="Entregador" 
            className="w-20 h-20 mb-2 "
          />
          <p className="text-sm font-bold">Pedidos custumizaveis</p>
          <p className="text-center">
            Facilidade de personalizar seus pedidos conforme suas preferências e ocasiões especiais.
            Facilidade de personalizar seus pedidos conforme suas preferências e ocasiões especiais.
            

          </p>
        </div>
        </div>

        </div>
        

        </div>

     
    
  )
}

export default Home;

