import Footer from "../../components/footer2";
import { HeaderLog } from "../../components/headerlog";

export const StartHome = () => {
    return (
        <div className="bg-[#EAE0D5] h-screen">
            <HeaderLog/>
            <div className="flex justify-between">
                <div className="w-1/2">
            <div className="flex justify-start p-2 ml-6">
                <h1 className="text-7xl font-bold text-black">Builde</h1>
            </div>
            <div className="flex justify-start p-2 ml-6 ">
                <h1 className="text-7xl font-serif text-orange-500 ml-2">Your</h1>
            </div>
            <div className="flex justify-start p-2 ml-6">
                <h1 className="text-7xl font-bold text-black">Website</h1>
            </div>
            <div className="flex justify-start p-2 ml-6">
                <h1 className="text-7xl font-serif text-cyan-700 ml-2">Here.</h1>
            </div>
            <div className="flex flex-col justify-start p-2 ml-6 mt-">
                <p className="text-gray-600 text-xl font-light">Simply and Quickly</p>
                <p className="text-gray-600 text-xl font-light">create your online and professional website</p>
                <p className="text-gray-600 text-xl font-light">start selling today for free</p>
                <p className="text-gray-600 text-xl font-light">without needing to write a single line of code</p>
            </div>
            <button className="mt-6 ml-6 p-4 bg-orange-500 text-black font-semibold rounded-full hover:text-blue-600 transition duration-300">
             Comece Agora - É Grátis!
            </button>
            </div>

            <div className="w-1/2 flex justify-center items-center p-4 rounded-xl">
                <img src="https://blog.ebaconline.com.br/blog/wp-content/uploads/2023/12/image1-6.jpg" 
                alt=""
                className="border-2 border-black rounded-2xl" />
            </div>
            </div>

            <div className="bg-[#EAE0D5] h-screen inset-0"> 
                <div className="mt-20 p-4 flex justify-center">
                    <h1 className="text-black mt-10 text-5xl font-bold">Why Choose Storely?</h1>
                </div>
                <div className="text-gray-600 flex justify-center ">
                    <p >
                        Discover the advantages of using our platform to create your online store easily and efficiently.</p>
                </div>
                {/*1*/}
                <div className="w-full flex justify-center mt-10">
                <div className="w-[80%]  shadow-2xl border-2  rounded-[40px] p-10 flex gap-10">
                    <div className="w-1/2 text-black">
                    <h2 className="text-4xl font-extrabold leading-tight mb-6"> Assembly <br /> </h2> 
                     <p className="text-black text-lg leading-relaxed">
                        Drag and drop elements to build your website visually. 
                        It's as easy as putting together a puzzle..
                    </p>
                    </div>
                
                    <div className="w-1/2 bg-[#1B998B] rounded-[30px] p-6">             
                    <iframe width="400" height="250" src="https://www.youtube.com/embed/tgbNymZ7vqY">
                    </iframe>
                </div>
                </div>
                </div>
                {/*2*/}
                <div className="w-full flex justify-center mt-10">
                <div className="w-[80%] max-w-6xl shadow-2xl border-2 rounded-[40px] p-10 flex gap-10">
                
                    <div className="w-1/2 bg-orange-500 rounded-[30px] p-6">             
                    <iframe width="400" height="250" src="https://www.youtube.com/embed/tgbNymZ7vqY">
                    </iframe>
                </div>
                    <div className="w-1/2 text-black">
                    <h2 className="text-4xl font-extrabold leading-tight mb-6"> Incredible Speed <br /> </h2> 
                     <p className="text-black text-lg leading-relaxed">
                        Your websites load in less than 1 second.  
                         Full focus on SEO and user experience.
                    </p>
                    </div>
                </div>
                </div>
                 {/*3*/}
                <div className="w-full flex justify-center mt-10">
                <div className="w-[80%] max-w-6xl shadow-2xl border-2 rounded-[40px] p-10 flex gap-10">
                    <div className="w-1/2 text-black">
                    <h2 className="text-4xl font-extrabold leading-tight mb-6"> Free Hosting <br /> </h2> 
                     <p className="text-black text-lg leading-relaxed">
                        Don't worry about servers. We take care of everything to keep your website always online..
                    </p>
                    </div>
                
                    <div className="w-1/2 bg-[#1B998B] rounded-[30px] p-6">             
                    <iframe width="400" height="250" src="https://www.youtube.com/embed/tgbNymZ7vqY">
                    </iframe>
                </div>
                </div>
                </div>
                {/*4*/}
                <div className="w-full flex justify-center mt-10">
                <div className="w-[80%] max-w-6xl shadow-2xl border-2 rounded-[40px] p-10 flex gap-10">
                
                    <div className="w-1/2 bg-orange-500 rounded-[30px] p-6">             
                    <iframe width="400" height="250" src="https://www.youtube.com/embed/tgbNymZ7vqY">
                    </iframe>
                </div>
                    <div className="w-1/2 text-black">
                    <h2 className="text-4xl font-extrabold leading-tight mb-6">Premium Templates </h2> 
                     <p className="text-black text-lg leading-relaxed">
                        Hundreds of ready-made templates created by professional designers for various niches.                    </p>
                    </div>
                </div>
                </div>
                 {/*5*/}
                <div className="w-full flex justify-center mt-10">
                <div className="w-[80%] max-w-6xl shadow-2xl border-2 rounded-[40px] p-10 flex gap-10">
                    <div className="w-1/2 text-black">
                    <h2 className="text-4xl font-extrabold leading-tight mb-6">Responsive Design<br /> </h2> 
                     <p className="text-black text-lg leading-relaxed">
                        Your website automatically adapts to any screen: phones, tablets, or desktops.                    </p>
                    </div>
                
                    <div className="w-1/2 bg-[#1B998B] rounded-[30px] p-6">             
                    <iframe width="400" height="250" src="https://www.youtube.com/embed/tgbNymZ7vqY">
                    </iframe>
                </div>
                </div>
                </div>
    
            </div>
      
{/*
            <div className="bg-blue-950 ">
                <div className="flex justify-start p-2 ">
                 <h1 className="mt-20 ml-2 text-3xl font-serif text-blue-600">Some of the most visited websites</h1>
                </div>

                <div className="flex justify-between mt-10">
                    <div className="w-1/2">
                        <img src="" alt="img" />
                    </div>

                    <div className="w-1/2">
                        <h1>Doces da Dinalda</h1>
                        <p>Uma loja online de doces artesanais feitos com amor.</p>
                        <button className="text-purple-500">Ir a loja</button>
                    </div>
                </div>
                <div className="flex justify-between mt-10">
                    <div className="w-1/2">
                        <img src="" alt="img" />
                    </div>

                    <div className="w-1/2">
                        <h1>IcePoint</h1>
                        <p>Uma loja online de venda de todo tipo de gelo para consumo.</p>
                        <button className="text-purple-500">Ir a loja</button>
                    </div>
                </div>

            </div>
            <Footer/>*/}
        </div>
    )
}
