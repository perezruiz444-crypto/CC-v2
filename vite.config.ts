import { defineConfig, mergeConfig } from 'vite'
import { defineConfig as defineTestConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const viteConfig = defineConfig({
  plugins: [react(), tailwindcss()],
})

export default mergeConfig(viteConfig, defineTestConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
}))
