import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Vite config
export default defineConfig(({ mode }) => {
  const emitSourcemaps = mode === 'development'

  return {
    base: process.env.FIGMA_PUBLIC_URL
      ? `${process.env.FIGMA_PUBLIC_URL}/`
      : '/',

    build: {
      sourcemap: emitSourcemaps ? 'inline' : false,
      minify: !emitSourcemaps,
    },

    plugins: [
      vue(),
      tailwindcss(),
    ],

    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})