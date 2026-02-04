import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // Define a base como raiz para garantir que caminhos de assets (js/css) funcionem na Vercel
  base: '/',

  build: {
    outDir: 'dist',
    // Aumenta o limite do aviso de 500kb para 1000kb
    chunkSizeWarningLimit: 1000, 
    // Desativado para proteger seu código-fonte em produção
    sourcemap: false,
    // Limpa a pasta dist antes de cada build para evitar arquivos obsoletos
    emptyOutDir: true,
    // Otimização de entrega de arquivos
    rollupOptions: {
      output: {
        // Divide o código em pedaços menores (chunks) para carregar apenas o necessário
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Garante nomes de arquivos consistentes para melhor cache do navegador
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
    // Minimiza o tamanho final dos arquivos
    minify: 'esbuild',
    target: 'esnext',
  },

  // Configuração para desenvolvimento local suave
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
})