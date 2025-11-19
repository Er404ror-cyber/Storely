import { createBrowserRouter } from "react-router-dom";
import { Home } from "./pages/pagina_in";
import Rosas from "./pages/novo/rosas";
import { Contacto } from "./pages/contacto";
import Box from "./pages/produtos/box";
import Cetim from "./pages/produtos/cetim";
import Buque from "./pages/produtos/buque";
import Normal from "./pages/produtos/normal";
import Camadas from "./pages/produtos/camadas";
import Quadrado from "./pages/produtos/quadrado";
import Biscoito from "./pages/produtos/biscoito";
import Orelhodos from "./pages/produtos/orelhodos";
import Bombom from "./pages/produtos/bombom";
import Gulabos from "./pages/produtos/gulabos";
import Pote from "./pages/produtos/pote";
import Marmita from "./pages/produtos/marmita";
import Mini from "./pages/produtos/mini";
import Combo from "./pages/produtos/combo";
import DetalhesProduto from "./pages/novo/detalhes";
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
        path:"/rosas/:id",
        element:<DetalhesProduto/>,
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
        path: "/Normal",
        element: <Normal/>,
      },
      {
        path: "/Camadas",
        element: <Camadas/>,
      },
      {
        path: "/Quadrado",
        element: <Quadrado/>,
      },
      {
        path: "/Biscoito",
        element: <Biscoito/>,
      },
      {
        path: "/Orelhodos",
        element: <Orelhodos/>,
      },
      {
        path: "/Bombom",
        element: <Bombom/>,
      },
      {
        path: "/Gulabos",
        element: <Gulabos/>,
      },
      {
        path: "/Pote",
        element: <Pote/>,
      },
      {
        path: "/Marmita",
        element: <Marmita/>,
      },
      {
        path: "/Mini",
        element: <Mini/>,
      },
      {
        path: "/Combo",
        element: <Combo/>,
      },
     
    
      
      
])