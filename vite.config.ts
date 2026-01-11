import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署时需要设置 base 路径
  // 如果部署到 https://用户名.github.io/仓库名/，需要设置为 '/仓库名/'
  // 如果部署到自定义域名或 https://用户名.github.io/，设置为 '/'
  base: process.env.GITHUB_ACTIONS ? '/resume-forge/' : '/',
})
