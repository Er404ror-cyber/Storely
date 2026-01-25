import { Building2, CircleQuestionMark, Home, LucideVerified, Users } from "lucide-react";
import { HeaderLog } from "../../components/headerlog";

export const Faq = () => {
    return (
        <div className="bg-linear-to-b from-gray-300 to-gray-100 h-screen ">
            <HeaderLog/>
            
            <div className="text-center mt-40 ">
                <p className="text-4xl text-black font-medium">We are here to help clear up your debts</p>
                <p className="text-lg text-black mt-4">If you have any doubts, concerns, or just want to have a
                </p>
                <p className="text-lg text-black">chat with our team, feel free, you're in the right place.</p>
            </div>
            
            <div>
             <div className="flex justify-between mt-10">                   
                    <div className="w-1/3 text-white flex justify-end">
                        <div className="p-10 bg-orange-500/30 rounded-2xl w-60 h-45">
                            <Users size={32} className="bg-amber-800 p-2 rounded-2xl "/>
                            <h2 className="text-xl font-light mt-4 text-black">Talk to our team</h2>
                          
                        </div>
                    </div>
                    <div className="w-1/3 text-white flex justify-center">
                        <div className="p-10 bg-orange-500/30 rounded-2xl w-60 h-45">
                            <CircleQuestionMark size={32} className="bg-amber-800 p-2 rounded-2xl "/>
                            <h2 className="text-xl font-light mt-4 text-black">Frequently Asked Questions</h2>
                          
                        </div>
                    </div>
                    <div className="w-1/3 text-white flex justify-start">
                        <div className="p-10 bg-orange-500/30 rounded-2xl w-60 h-45">
                            <LucideVerified size={32} className="bg-amber-800 p-2 rounded-2xl "/>
                            <h2 className="text-xl font-light mt-4 text-black">Our news blog</h2>
                          
                        </div>
                    </div>                
                </div>
            </div>

             <div className="h-screen mt-20 flex items-center justify-center bg-linear-to-b from-gray-100 to-gray-300">
      <div className=" bg-orange-500/30 rounded-3xl flex overflow-hidden shadow-2xl">

        <div className="w-1/2">
          <img
            src="https://tse2.mm.bing.net/th/id/OIP.A_FCkPjO6XXaafMD1XPq3gHaEK?rs=1&pid=ImgDetMain&o=7&rm=3"
            alt="Imagem"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-1/2 p-10 text-black">
          <h2 className="text-4xl font-medium mb-3">
            Fale Conosco
          </h2>

          <p className="text-black mb-8">
            Preencha os campos abaixo e entraremos em contato o mais breve possível.
          </p>

          <form className="flex flex-col gap-4">

            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Nome"
                className="w-1/2 p-3 rounded-xl bg-gray-300 border border-gray-700 outline-none "
              />
              <input
                type="email"
                placeholder="Email"
                className="w-1/2 p-3 rounded-xl bg-gray-300 border border-gray-700 outline-none"
              />
            </div>

            <textarea
              placeholder="Sua mensagem"
              className="h-40 p-3 rounded-xl bg-gray-300 border border-gray-700 outline-none resize-none"
            />

            <div className="flex gap-4 mt-4">
              <button
                type="button"
                className="w-1/2 py-3 rounded-xl bg-white text-gray-800 font-medium hover:bg-blue-600"
              >
                Enviar por Email
              </button>

              <button
                type="button"
                className="w-1/2 py-3 rounded-xl bg-white text-gray-800 font-medium hover:bg-green-600"
              >
                Enviar por WhatsApp
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>

            <div className="bg-linear-to-b from-gray-300 to-gray-100 h-screen ">
                densevolvedores da Plataforma Storely

            </div>
            
        </div>
    );
} 