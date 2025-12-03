import { Link } from "react-router-dom";

export const Header = () =>{
    return(
        <header className="bg-indigo-600  p-6 ">
            <nav>
                <ul>
                    <div>
            
                        <div className="flex justify-center space-x-10 ">
                            <div className="">
                            <Link to={"/"}
                            className="text-white font-medium text-2xl  hover:text-purple-400 
                            ease-in-out transition-colors duration-300 ">
                           Home
                            </Link>
                            </div>

                            <Link to={"/Rosas"}
                            className="text-white font-medium text-2xl  hover:text-purple-400 
                            ease-in-out transition-colors duration-300">
                            rosas   
                            </Link>

                            <Link to={"/Contacto"}
                            className="text-white font-medium text-2xl  hover:text-purple-400 
                            ease-in-out transition-colors duration-300">
                            contacto   
                            </Link>
                            
                        </div>
                        
                    </div>
                </ul>
            </nav>
        </header>
    )
}