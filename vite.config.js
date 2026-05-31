import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue' // 1. 必须引入插件

export default defineConfig({
  // 2. 必须在 plugins 数组中启用插件，否则无法解析 .vue 文件
  plugins: [vue()], 

  server: {
    port: 1025, 
    proxy: {
      '/user': {
        target: 'http://localhost:10000',
        changeOrigin: true,
        // 注意：rewrite 会把 /user/api 变成 /api，确保后端接口不需要 /user 前缀
        rewrite: (path) => path.replace(/^\/user/, '')
      },
      '/common': {
        target: 'http://localhost:10000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/common/, '')
      },
      '/api': {
        target: 'http://localhost:10000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/love': {
        target: 'http://localhost:10000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/love/, '')
      }
    }
  }
})