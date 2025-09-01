
import { Header } from "../components/header"



export const Home = () =>{
    return(
    
        <div>
            <Header/>
            <div className="flex justify-between bg-gradient-to-r from-pink-300 to-red-400 h-screen">
                <div className="w-1/2 ">
                <h1 className="flex justify-center text-4xl mt-40 animate-bounce">Bem vindo a petal rose🌹</h1>
                <div className="text-justify p-8 font-serif text-2xl ">
                    
                    <p>Nosso espaço foi criado com muito carinho para que você encontre as rosas mais belas 🌸, frescas 🌿 e cheias de significado ✨.</p>
                    <p>Cada pétala carrega um toque especial de amor, cuidado e elegância 💐.</p>
                    <p>Sinta-se em casa, explore nossas coleções e deixe-se envolver pelo perfume e encanto das rosas 🌹💕.</p>
                </div>
                </div>
                
             <div className="w-1/2 flex justify-center mt-32">
                    <img src="src/img/intro.JPEG" className="border border-black rounded-2xl m-5  h-96 " alt="" />
             </div> 
             

             </div>
        </div>
    )
}
export default Home