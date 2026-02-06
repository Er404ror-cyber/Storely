import { createBrowserRouter } from 'react-router-dom';
import { AdminLayout } from './layout/AdminLayout';
import Dashboard from './dashboard/dashboard';
import { PagesList } from './dashboard/PagesList';
import { Editor } from './dashboard/PageEditor';
import { Products } from './dashboard/Products';
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
    path: '/contacto',
    element: <Contacto/>,
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
      { path: 'produtos', element: <Products /> },
      { path: 'configuracoes', element: <AdminHeaderSettings /> },
    ],
  },

  // 🌍 ÁREA PÚBLICA (LOJA)
  {
    path: '/:storeSlug',
    // O ScrollToTop envolve o PublicLayout e a PageView
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
            path: ':pageSlug',
            element: <PageView />, 
          },
        ],
      },
    ],
  },
]); 