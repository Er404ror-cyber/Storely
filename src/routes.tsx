import { createBrowserRouter } from "react-router-dom";
import { Home } from "./pages/pagina_in";
import Rosas from "./pages/rosas";
import { Contacto } from "./pages/contacto";
import Box from "./pages/produtos/box";
import Cetim from "./pages/produtos/cetim";
import Buque from "./pages/produtos/buque";
export const route = createBrowserRouter ([
    {
        path: "/",
        element: <Home/>,
      },
      {
        path:"/Rosas",
        element:<Rosas/>,
      },
      {
        path:"/Contacto",
        element:<Contacto/>,
      },
      {
        path: "/Box",
        element: <Box/>,
      },
      {
        path: "/Cetim",
        element: <Cetim/>,
      },
      {
        path: "/Buque",
        element: <Buque/>,
      },
      
    
      
      
])