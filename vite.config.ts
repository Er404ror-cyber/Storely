import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Garanta que o plugin do React está aqui
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/', // ISSO É CRUCIAL: Garante que os caminhos de arquivos sejam absolutos
  build: {
    outDir: 'dist',
  }
})