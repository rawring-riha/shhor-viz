import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  base: '/shhor-viz/', // Replace with your actual repository name
  build: {
    outDir: 'dist'
  }
})