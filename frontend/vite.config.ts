import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
	vue(),
	tailwindcss()
],
  server: {
    host: '0.0.0.0',  // Écouter sur toutes les interfaces
    port: 2000        // Port pour Docker
  }
})