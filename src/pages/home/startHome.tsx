import { HeaderLog } from "../../components/headerlog";

export const StartHome = () => {
    return (
        <div className="bg-blue-950 h-screen">
            <HeaderLog/>
            <div className="flex justify-between">
                <div className="w-1/2">
            <div className="flex justify-start p-2 ml-2">
                <h1 className="text-8xl font-bold text-white">Builde</h1>
            </div>
            <div className="flex justify-start p-2 ml-2 ">
                <h1 className="text-8xl font-serif bg-linear-to-r from-blue-600 to-white bg-clip-text text-transparent ml-2">Your</h1>
            </div>
            <div className="flex justify-start p-2 ml-2">
                <h1 className="text-8xl font-bold text-white">Website</h1>
            </div>
            <div className="flex justify-start p-2 ml-2">
                <h1 className="text-8xl font-serif bg-linear-to-r from-pink-400 to-white bg-clip-text text-transparent ml-2">Here.</h1>
            </div>
            <div className="flex flex-col justify-start p-2 ml-2 mt-">
                <p className="text-gray-300 text-xl font-light">Simply and Quickly</p>
                <p className="text-gray-300 text-xl font-light">create your online and professional website</p>
                <p className="text-gray-300 text-xl font-light">start selling today for free</p>
                <p className="text-gray-300 text-xl font-light">without needing to write a single line of code</p>
            </div>
            <button className="mt-6 ml-4 px-6 py-3 bg-white text-purple-500 font-semibold rounded-full hover:text-blue-600 transition duration-300">
             Comece Agora - É Grátis!
            </button>
            </div>

            <div className="w-1/2 flex justify-center items-center p-4">
                <img src="https://blog.ebaconline.com.br/blog/wp-content/uploads/2023/12/image1-6.jpg" 
                alt=""
                className="border-2 border-purple-500 rounded" />
            </div>
            </div>

            <div className="bg-black h-screen">
            <div className="mt-20 p-4 flex justify-center">
                <h1 className="text-blue-600 mt-10 text-5xl font-serif">Features</h1>
            </div>
            <div className="text-white flex justify-center ">
                <p >
                    Everything our platform offers to make your experience the best</p>
            </div>
                
                <div className="flex justify-between mt-10">
                    
                    <div className="w-1/3 text-white flex justify-center">
                        <div className="p-10 bg-gray-800 rounded-2xl w-90">
                            <img src="public\img\drop.png" alt="imagem" className="w-10" />
                            <h2 className="text-xl font-bold mt-4 text-pink-400">Assembly</h2>
                            <p className="mt-2">Drag and drop elements to build your website visually. 
                                It's as easy as putting together a puzzle..</p>
                        </div>
                    </div>

                    <div className="w-1/3 text-white flex justify-center">
                        <div className="p-10 bg-gray-800 rounded-2xl w-90">
                            <img src="public\img\fastt.png" alt="imagem" className="w-10" />
                            <h2 className="text-xl font-bold mt-4 text-pink-400">Incredible Speed</h2>
                            <p className="mt-2">Your websites load in less than 1 second.  
                                Full focus on SEO and user experience.</p>
                        </div>
                    </div>
                
                    <div className="w-1/3 text-white flex justify-center">
                        <div className="p-10 bg-gray-800 rounded-2xl w-90">
                            <img src="public\img\nav.png" alt="imagem" className="w-10 " />
                            <h2 className="text-xl font-bold mt-4 text-pink-400 r">Free Hosting</h2>
                            <p className="mt-2">Don't worry about servers. We take care of everything to keep your website always online..</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between mt-10">
                    
                    <div className="w-1/3 text-white flex justify-center">
                        <div className="p-10 bg-gray-800 rounded-2xl w-90">
                            <img src="public\img\template.png" alt="imagem" className="w-10" />
                            <h2 className="text-xl font-bold mt-4 text-pink-400">Premium Templates</h2>
                            <p className="mt-2">Hundreds of ready-made templates created by professional designers for various niches.</p>
                        </div>
                    </div>

                    <div className="w-1/3 text-white flex justify-center">
                        <div className="p-10 bg-gray-800 rounded-2xl w-90">
                            <img src="public\img\desig.png" alt="imagem" className="w-10" />
                            <h2 className="text-xl font-bold mt-4 text-pink-400">Responsive Design</h2>
                            <p className="mt-2">Your website automatically adapts to any screen: phones, tablets, or desktops.</p>
                        </div>
                    </div>

                    <div className="w-1/3 text-white flex justify-center">
                        <div className="p-10 bg-gray-800 rounded-2xl w-90">
                            <img src="public\img\supp.jpeg" alt="imagem" className="w-10 " />
                            <h2 className="text-xl font-bold mt-4 text-pink-400 r">24/7 Support</h2>
                            <p className="mt-2">Questions? Our team is ready to help you anytime, day or night.</p>
                        </div>
                    </div>
                </div>

            </div>

            <div className="bg-blue-950 h-screen">
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
            <footer>
            <div className="text-gray-400 p-4 h-20 ">
                <img src="https://wallpapercave.com/wp/wp2632423.jpg" 
                alt="img"
                className="w-full h-full object-cover scale-105 h-s"/>
                <p className="text-center mt-3">© 2026 STORRLY. All rights reserved.</p>
            </div>
        </footer>
        </div>
    )
}
