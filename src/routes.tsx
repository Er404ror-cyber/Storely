import { createBrowserRouter } from 'react-router-dom';
import { AdminLayout } from './layout/AdminLayout';
import Dashboard from './dashboard/dashboard';
import { PagesList } from './dashboard/PagesList';
import { Editor } from './dashboard/PageEditor';
import { AdminHeaderSettings } from './components/configGeral';
import { AuthPage } from './auth/auth';
import { PublicLayout } from './layout/publicLayout';
import { PageView } from './pages/user/pageview';
import { StartHome } from './pages/home/startHome';
import { ScrollToTop } from './components/scrollToTop';
import { Duvidas } from './pages/home/duvidas';
import { Faq } from './pages/faq';
import { Contacto } from './pages/contacto';
import { Blog } from './pages/home/blog';
import { ProductDetails } from './dashboard/ProdutcsDetails';
import { ProductsList } from './dashboard/Products';


export const route = createBrowserRouter([
  {
  path: '/',
  element: <StartHome />,
  },

  {
  path: '/blog',
  element: <Blog />,
  },

  {
    path: '/Duvidas',
    element: <Duvidas />,
  },

  {
    path: '/faq',
    element: <Faq />,
  },

  {
    path: '/auth',
    element: <AuthPage />,
  },
  // 🔐 ÁREA DO VENDEDOR (ADMIN)
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'paginas', element: <PagesList /> },
      { path: 'editor/:pageId', element: <Editor /> },
      { path: 'produtos', element: <ProductsList /> },
      { path: 'produtos/:productId', element: <ProductDetails /> },
            { path: 'configuracoes', element: <AdminHeaderSettings /> },
    ],
  },

 // 🌍 ÁREA PÚBLICA (LOJA)
{
  path: '/:storeSlug',
  element: <ScrollToTop />, 
  children: [
    {
      element: <PublicLayout />,
      children: [
        {
          index: true, 
          element: <PageView />, 
        },
        {
          // Esta rota cuida de /loja/contato ou /loja/servicos
          path: ':pageSlug',
          children: [
            {
              index: true,
              element: <PageView />,
            },
            {
           
              path: ':productId',
              element: <ProductDetails />, 
            },
          ]
        },
      ],
    },
  ],
},
]); 