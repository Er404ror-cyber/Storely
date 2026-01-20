import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // Para Vercel e domínio padrão
  base: '/',

  build: {
    outDir: 'dist',
    sourcemap: false, // evita expor código em produção
  },
})
