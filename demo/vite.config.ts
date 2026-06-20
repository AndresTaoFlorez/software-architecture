import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Relative base so the build works under any path, including the
// GitHub Pages project subpath (username.github.io/onion-architecture/).
// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
})
