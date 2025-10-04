import { createBrowserRouter } from "react-router-dom";
import { Home } from "./pages/pagina_in";
import Rosas from "./pages/rosas";
import { Contacto } from "./pages/contacto";
import Box from "./pages/produtos/box";
import Cetim from "./pages/produtos/cetim";
import Buque from "./pages/produtos/buque";
import Bu10 from "./pages/produtos/bu10";
import Ca10 from "./pages/produtos/ca10";
import Mix from "./pages/produtos/mix";
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
      {
        path: "/Bu10",
        element: <Bu10/>,
      },
     {
      path: "/Ca10",
      element: <Ca10/>,
     },
     {
      path: "/Mix",
      element: <Mix/>,
     },
      
      
])