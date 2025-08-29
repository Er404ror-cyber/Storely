import { Header } from "../components/header"


export const Contacto = () =>{
    return(
        <div>
            <Header/>

            <div className="flex justify-between">    
                <div className="w-1/2 flex justify-center mt-32 ">

                <form action="">
                    <h2>Nome:</h2>
                    <label htmlFor="nome" className="text-gray-700 font-semibold"></label>
                    <input type="text" required placeholder="Digite seu nome" 
                    className="border-gray-300 border hover:bg-black/5 transition-all duration-300 ease-in-out p-2 
                    rounded mt-1" />

                    <h2>e-mail:</h2>
                    <label htmlFor="e-mail" className="text-gray-700 font-semibold"></label>
                    <input type="email"  required placeholder="Digite seu e-mail" 
                    className="border-gray-300 border hover:bg-black/5 transition-all duration-300 ease-in-out p-2 
                    rounded mt-1" />

                     <h2>Deixe o seu pedido:</h2>
                    <label htmlFor="mensagem" className="text-gray-700 font-semibold"></label>
                    <input type="text"  required placeholder="Deixe seu pedido" 
                    className="border-gray-300 border hover:bg-black/5 transition-all duration-300 ease-in-out p-2 
                    rounded mt-1" />

                    <button type="submit" 
                    className="border border-black  hover: bg-blue-500 transition-all duration-300
                    ease-in-out p-2 rounded grid mt-6 ml-12">Submeter</button>

                </form>

                </div>

                <div className="w-1/2 h-screen bg-gradient-to-r from-pink-300 to-red-400">
                <img src="src/img/casal.JPEG" alt="foto"
                className="h-120 items-center" />
                    
                </div>`
            </div>
        </div>
    )
}
export default Contacto