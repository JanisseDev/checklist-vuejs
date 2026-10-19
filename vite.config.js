import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: "/checklist-vuejs/",
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Checklist',
        short_name: 'Checklist',
        description: 'A private checklist app: no account, no cloud, your lists stay on your device.',
        theme_color: '#f6f9ef',
        background_color: '#f6f9ef',
        display: 'standalone',
        icons: [
          {
            src: 'app-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'app-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'app-icon-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
