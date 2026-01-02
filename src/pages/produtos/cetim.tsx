import { Header } from "../../components/headeroficial";
export  const Cetim = () => {
    return(
        <div>
            <Header/>
            <div className="flex justify-between">
            
            {/*parte direita*/}

            <div className="w-1/2 ">

            <div className="text-justify p-4 mt-20 ">
            <p className="">
               rosa confeccionada em cetim, com acabamento 
               impecável e aparência delicada. Este tipo de flor artificial 
               une estética e durabilidade, sendo perfeita para decorações 
               sofisticadas, lembrancinhas ou ambientes onde se deseja beleza 
               permanente sem perder o encanto das rosas naturais.
            </p>

            <p className="mt-2 ">Detalhes:</p>
            <div className="ml-4">
                <li>Rosas de cetim variaveis de tamanho e tipo</li>
                <li>Embruldas no papel </li>
                <li>Mensagem personalizavel opcional</li>
            </div>
            </div>
            <div className="m-4 flex justify-center">
                <p className="border-2 rounded-lg p-2 w-25 ">preco: 75,00 mt cada</p>
                
            </div>

              <div className="flex justify-center ">
                    <form action="">
                        <h2>Deixe-nos sua mensagem:</h2>
                            <label htmlFor="mensagem" className="text-gray-700 font-semibold"></label>
                            <input type="text"  required placeholder="Deixe seu pedido" 
                            className="border-gray-300 border hover:bg-black/5 transition-all duration-300 ease-in-out p-2 
                            rounded mt-1 " />
                    </form>
                    </div>

                    <div className="flex justify-center m-2">
                    <button className="p-2 text-white bg-blue-500 rounded-lg w-30">encomendar</button>
                    </div>

            </div>


            {/*esquerda*/}

            <div className="w-1/2  " >
            <div className="flex justify-center">
            <img src="src/img/cetim.JPEG" alt="caixa de rosas"
            className="w-90 h-96 shadow-2xl rounded-2xl mt-20 " />
            </div>

{/*aqui nesse botao e para ser um link para meu whatsap no icone*/}
            
            <div className="flex justify-end mr-65 ">

            <button type="submit">
                <img src="src/img/whatsapp.jpg" alt="" 
                className="h-8 "/>
            </button>
             <button type="submit">
                <img src="src/img/ig.webp" alt="" 
                className="h-15 "/>
            </button>
      
            </div>

            </div>
            
            </div>
              

            


        </div>
    )
} 
export default Cetim