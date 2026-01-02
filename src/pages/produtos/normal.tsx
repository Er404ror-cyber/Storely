
import { Header } from "../../components/headeroficial";
export  const Camadas = () => {
    return(
        <div>
            <Header/>
            <div className="flex justify-between">
            
            {/*parte direita*/}

            <div className="w-1/2 ">
            <div className=" text-justify   p-4 mt-20">
            <p className=" ">
                Imagine o sabor, a textura e a beleza se unindo em um verdadeiro 
                espetáculo de confeitaria, é um convite para transformar momentos 
                simples em lembranças inesquecíveis. Cada fatia revela uma explosão 
                de sabores que derretem na boca, levando alegria ao paladar e encantando 
                os olhos com o capricho dos detalhes artesanais. Feito com ingredientes 
                selecionados e uma dose generosa de carinho, nossos bolos são pensados 
                para tornar qualquer ocasião mais doce, especial e única.
                Encomende o bolo dos seus sonhos, com decoração personalizada e 
                sabor inesquecível, e surpreenda seus convidados com uma experiência 
                que vai muito além do esperado—afinal, momentos especiais pedem um toque 
                de doçura verdadeira, feito à mão para você celebrar com emoção e satisfação 
                em cada mordida.
            </p>
            
            
            
            </div>
            <div className="m-4 flex justify-center">
                <p className="border-2 rounded-lg p-2 w-25 ">preco: 600,00 mt</p>
                
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
            <img src="src/img/bolos/normal.jpg" alt="caixa de rosas"
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
export default Camadas