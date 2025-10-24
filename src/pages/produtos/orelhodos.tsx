
import { Header } from "../../components/header";
export  const Orelhodos = () => {
    return(
        <div>
            <Header/>
            <div className="flex justify-between">
            
            {/*parte direita*/}

            <div className="w-1/2 ">
            <div className=" text-justify   p-4 mt-20">
            <p className=" ">
                Estes cupcakes “orelhudos” são uma verdadeira explosão de charme e sabor, 
                perfeitos para encantar qualquer mesa de doces. Com uma massa leve e dourada,
                eles vêm recheados com um creme sedoso e delicado, formando um topo criativo onde 
                pedaços de bolo representam simpáticas orelhinhas, destacando ainda mais a apresentação 
                divertida e única.
                Finalizados com uma suave nevada de açúcar de confeiteiro, 
                cada cupcake oferece uma textura macia aliada ao aroma irresistível de
                 baunilha e um toque de frescor proporcionado pelo recheio cremoso. 
                 São ideais para festas infantis, eventos especiais ou para quem simplesmente 
                 deseja adoçar o dia com uma sobremesa que conquista de primeira pelo visual 
                 criativo e sabor envolvente. Certamente farão qualquer cliente se apaixonar à 
                 primeira mordida!
           </p>  </div>
            <div className="m-4 flex justify-center">
                <p className="border-2 rounded-lg p-2 w-25 ">preco:2000</p>
                
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
            <img src="src/img/bolos/orelhudos.jpg" alt="caixa de rosas"
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
export default Orelhodos