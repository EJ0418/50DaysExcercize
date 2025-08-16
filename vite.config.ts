import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 根據環境變數判斷是否為生產環境
const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  base: isProduction ? '/50DaysExcercize/' : '/',
  plugins: [react()],
  build: {
    // 確保生成 sourcemap 以便於調試
    sourcemap: true,
  },
});