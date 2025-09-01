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
                <img src="src/img/casal.JPEG" alt="Foto" 
                className="border border-black rounded-md transition-all duration-1000 
                ease-in-out m-5 hover:border-purple-800 w-auto h-96 ml-50 " />
                    <h3 className="text-xl font-semibold mt-2 mb-4 text-center">Informações de Contato</h3>
                    <p className="mb-2 text-center"><strong>Telefone:</strong> +258 83 374 2053</p>
                    <p className="mb-2 text-center"><strong>Email:</strong> dicksontembe42@gmail.com</p>
                    <p className="mb-2 text-center"><strong>Endereço:</strong> Malhapsene</p>
                    
                </div>`
            </div>
        </div>
    )
}
export default Contacto