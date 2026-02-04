import { RouterProvider } from "react-router-dom";
import { route } from "./routes";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <Toaster 
        position="bottom-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 3000, // O toast some sozinho após 4 segundos
          style: {
            background: '#1e293b', // Fundo escuro elegante (Slate-800)
            color: '#fff',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            padding: '12px 24px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#6366f1', // Ícone Indigo
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // Ícone Vermelho para erros (ex: nome duplicado)
              secondary: '#fff',
            },
          },
        }} 
      />
      <RouterProvider router={route} />
    </>
  );
};

export default App;