import './utils/themeInit.js'; // <--- IMPORTANTE: Deve ser um dos primeiros
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);