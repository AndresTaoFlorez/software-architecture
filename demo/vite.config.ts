import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { templateCompilerOptions } from '@tresjs/core'

// Relative base so the build works under any path, including the
// GitHub Pages project subpath (username.github.io/onion-architecture/).
// templateCompilerOptions teaches the Vue compiler about TresJS's
// custom <Tres*> elements so they don't trigger "unknown element" warnings.
// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue({ ...templateCompilerOptions })],
})
