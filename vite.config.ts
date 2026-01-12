import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署时需要设置 base 路径
  // 必须与 GitHub 仓库名大小写完全一致
  base: process.env.GITHUB_ACTIONS ? '/ResumeForge/' : '/',
})
