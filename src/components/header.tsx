import { Link } from "react-router-dom";

export const Header = () =>{
    return(
        <header className="bg-black h-20 p-6 ">
            <nav>
                <ul>
                    <div>
            
                        <div className="flex justify-end ">
                            <Link to={"/"}>
                            <img src="src/img/OIP.webp" alt="Logo Rosa" 
                            className="w-10 h-10 mr-auto" />
                            </Link>
                            
                            <Link to={"/Rosas"}
                            className="text-white font-medium text-2xl ml-8 hover:text-red-200 
                            ease-in-out transition-colors duration-300">
                            rosas   
                            </Link>

                            <Link to={"/Contacto"}
                            className="text-white font-medium text-2xl ml-8 hover:text-red-200 
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