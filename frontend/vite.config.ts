import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/socket.io': 'http://localhost:3000'
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true, // Supprime les avertissements des dépendances
        silenceDeprecations: [
          'legacy-js-api',
          'import',
          'global-builtin'
        ],
        // Alternative : masquer tous les avertissements
        logger: {
          warn: () => {},
          debug: () => {}
        }
      }
    }
  }
})
