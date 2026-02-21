import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      manifest: {
        name: 'Storely — Sem código / Sem limites',
        short_name: 'Storely',
        description:
          'A plataforma definitiva para quem busca performance extrema, Sem código, Sem limites',

        theme_color: '#000000',
        background_color: '#000000',

        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',

        icons: [
          {
            src: '/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/storelyy\.vercel\.app\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'storely-cache',
            },
          },
        ],
      },

      devOptions: {
        enabled: true,
      },
    }),
  ],

  base: '/',

  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    emptyOutDir: true,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    minify: 'esbuild',
    target: 'esnext',
  },

  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
})