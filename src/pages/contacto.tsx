import { HeaderLog } from "../components/headerlog"


export const Contacto = () =>{
    return(
        <div>
            <HeaderLog/>

            <div className=" bg-linear-to-b from-gray-300 to-gray-100 min-h-screen px-4">
      
      {/* Titulo  */}
      <h1 className=" text-5xl md:text-6xl font-normal mb-4 text-center mt-20">
        CONTACT US
      </h1>

      

      {/* Área do formulario */}
      <div className=" space-y-5 flex  flex-col w-xl mx-auto px-4 mb-20 shadow-2xl ">
        
        {/* Input: Nome */}
        <div className="">
          <input 
            type="text" 
            placeholder="Name:" 
            className="w-full bg-white text-gray-800 px-4 py-3.5 rounded-lg    shadow-sm"
          />
        </div>

        {/* Input: Numero telefone */}
        <div className="">
          <input 
            type="number" 
            placeholder="Number:" 
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
            placeholder="Leve your mensage:" 
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

     <section className="bg-linear-to-b from-neutral-900 to-black py-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* TÍTULO */}
        <div className="flex items-center gap-3 mb-12">
          <span className="text-pink-500 text-2xl">📞</span>
          <h2 className="text-3xl font-bold text-white">Contactos</h2>
        </div>

        {/* CARDS */}
        <div className=" sm:grid-cols-2 lg:grid-cols-4 gap-8 flex justify-center">

          {/* VENDAS */}
          <div className="bg-neutral-800 rounded-2xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Suport1</h3>
            <div className="border-b border-white/10 mb-4"></div>

            <p className="text-blue-400 mb-4">← emailsueile@orn.co.mz</p>
            <p className="text-green-400">📞 +258 82 245 1479</p>
          </div>

          {/* INFORMAÇÕES */}
          <div className="bg-neutral-800 rounded-2xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Suport2</h3>
            <div className="border-b border-white/10 mb-4"></div>

            <p className="text-blue-400 mb-4">← emaildickson@gmail.com</p>
            <p className="text-green-400">📞 +258 844110317</p>
          </div>

          

        </div>
      </div>
    </section>
        </div>
    )
}
export default Contacto