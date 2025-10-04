
import { Header } from "../../components/header";
export  const Box = () => {
    return(
        <div>
            <Header/>
            <div className="flex justify-between">


            <div className="w-1/2 ">
            <p className="text-center p-2 mt-50 ">
                detalhes da flor detalhes da flor detalhes da flor 
                detalhes da flor detalhes da flor detalhes da flor 
                detalhes da flor detalhes da flor detalhes da flor 
                detalhes da flor detalhes da flor detalhes da flor 
                detalhes da flor detalhes da flor detalhes da flor 
                detalhes da flor detalhes da flor detalhes da flor 
                detalhes da flor detalhes da flor detalhes da flor   
            </p>
            
            <div className="m-4 flex justify-between">
                <p className="border-2 rounded-lg p-2 w-25 ml-50">preco:2000</p>
                <button className="border-2 bg-blue-500 text-white rounded-lg p-2 mr-40">encomendar</button>
            </div>
          
            </div>

            <div className="w-1/2 flex justify-center " >
            <img src="src/img/caixa_de_20.JPEG" alt="caixa de rosas"
            className="w-60 h-90 shadow-2xl rounded-2xl mt-20 " />
            </div>
            
            </div>
              <div className="flex justify-end mr-65 m-5">

                {/*aqui nesse botao e para ser um link para meu whatsap no icone*/}
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
    )

} 
export default Box