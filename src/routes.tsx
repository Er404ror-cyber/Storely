import { createBrowserRouter } from 'react-router-dom';

import { ScrollToTop } from './components/scrollToTop';

// Layouts
import { AdminLayout } from './layout/AdminLayout';
import { PublicLayout } from './layout/publicLayout';

// Admin
import Dashboard from './dashboard/dashboard';
import { PagesList } from './dashboard/PagesList';
import { Editor } from './dashboard/PageEditor';
import { ProductsList } from './dashboard/Products';
import { ProductDetails } from './dashboard/ProdutcsDetails';
import { AdminSettings } from './components/configGeral';

// Auth
import { AuthPage } from './auth/auth';
import { AuthCallback } from './auth/AuthCallback';
import { ResetPasswordPage } from './auth/ResetPasswordPage';

// Public pages
import { PageView } from './pages/user/pageview';
import { StartHome } from './pages/home/startHome';
import { Blog } from './pages/home/blog';
import { Duvidas } from './pages/home/duvidas';
import { Faq } from './pages/faq';

export const route = createBrowserRouter([
  {
    path: '/',
    element: <ScrollToTop />,
    children: [
      {
        index: true,
        element: <Blog />,
      },
      {
        path: 'blog',
        element: <StartHome />,
      },
      {
        path: 'Duvidas',
        element: <Duvidas />,
      },
      {
        path: 'faq',
        element: <Faq />,
      },
      {
        path: 'auth',
        element: <AuthPage />,
      },
      {
        path: 'auth/callback',
        element: <AuthCallback />,
      },
      {
        path: 'auth/reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'paginas', element: <PagesList /> },
          { path: 'editor/:pageId', element: <Editor /> },
          { path: 'produtos', element: <ProductsList /> },
          { path: 'produtos/:productId', element: <ProductDetails /> },
          { path: 'configuracoes', element: <AdminSettings /> },
          { path: 'explore', element: <Blog /> },
        ],
      },
      {
        path: ':storeSlug',
        element: <PublicLayout />,
        children: [
          {
            index: true,
            element: <PageView />,
          },
          {
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
            ],
          },
        ],
      },
    ],
  },
]);