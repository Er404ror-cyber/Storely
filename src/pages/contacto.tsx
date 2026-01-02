import { Header } from "../components/headeroficial"


export const Contacto = () =>{
    return(
        <div>
            <Header/>

            <div className="   ">
      
      {/* Titulo  */}
      <h1 className=" text-5xl md:text-6xl font-normal mb-4 text-center mt-6">
        CONTACTE-NOS
      </h1>

      

      {/* Área do formulario */}
      <div className=" space-y-5 flex  flex-col w-xl mx-auto px-4 mb-20">
        
        {/* Input: Nome */}
        <div className="">
          <input 
            type="text" 
            placeholder="Nome:" 
            className="w-full bg-white text-gray-800 px-4 py-3.5 rounded-lg    shadow-sm"
          />
        </div>

        {/* Input: Numero telefone */}
        <div className="">
          <input 
            type="number" 
            placeholder="Numero de telefone:" 
            className="w-full bg-white text-gray-800 px-4 py-3.5 rounded-lg    shadow-sm"
          />
        </div>

        {/* Input: Email */}
        <div className="">
          <input 
            type="email" 
            placeholder="Email:" 
            className="w-full bg-white text-gray-800 px-4 py-3.5 rounded-lg    shadow-sm"
          />
        </div>

        {/* Textarea: Menssagem */}
        <div className="w-full">
          <textarea 
            placeholder="Mensagem:" 
            rows={6}
            className="w-full bg-white text-gray-800 px-4 py-3.5 rounded-lg    shadow-sm "
          ></textarea>
        </div>

        {/* Botão */}
        <div className="w-full pt-2">
          <button className="bg-blue-400 hover:bg-blue-600 text-white font-bold py-4 px-10 rounded-lg shadow-md transition-colors ease-in-out">
            Enviar
          </button>
        </div>

      </div>
    </div>
        </div>
    )
}
export default Contacto