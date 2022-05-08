import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'vuex4': path.resolve(__dirname, './vuex4'),
      '@': path.resolve(__dirname, './src')
    }
  }
})
