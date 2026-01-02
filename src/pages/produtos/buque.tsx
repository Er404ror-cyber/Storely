import { Header } from "../../components/headeroficial";
export  const Buque = () => {
   return(
        <div>
            <Header/>
            <div className="flex justify-between">
            
            {/*parte direita*/}

            <div className="w-1/2 ">
            <div className="text-justify p-4 mt-20">
            <p className="">
            Temos um bouque clássico formado por dezenas de rosas vermelhas, 
            cuidadosamente envoltas em papel branco estilizado, trazendo o charme 
            das flores frescas e a atmosfera refinada dos arranjos artesanais feitos 
            para ocasiões especiais.
            </p>

            <p className="mt-2">Detalhes:</p>
            <div className="ml-4">
            <li>Buque de 20 rosas (personalizavel)</li>
            <li>Papel de embrulho branco</li>
            <li>Mensagem personalizada opcional</li>
            
            </div>
            </div>
            <div className="m-4 flex justify-center">
                <p className="border-2 rounded-lg p-2 w-25 ">preco: 1500,00 mt</p>
                
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
            <img src="src/img/buque_20.JPEG" alt="caixa de rosas"
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
export default Buque