import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [svelte(), cloudflare()],
  base: '/shhor-viz/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
  publicDir: 'public'
})