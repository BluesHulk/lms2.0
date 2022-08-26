import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
const { resolve } = require('path')


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  resolve: {
    alias: {
      // 别名配置
      '@': resolve(__dirname, 'src')
    }
  },
  define: {
    // 'process.env': {
    //   'VITE_APP_BASE_API': '/api'
    // }
  },
  css: {
    preprocessorOptions: {
			scss: {
				additionalData: '@import "@/assets/styles/variable.scss";'
			}
		}
  },
  build: {
    target: 'es2020',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020'
    }
  },
  server: {
    // 服务器主机名
    host: '0.0.0.0',
    // host: 'localhost',
    // 指定开发服务器端口。注意：如果端口已经被使用，Vite 会自动尝试下一个可用的端口，所以这可能不是开发服务器最终监听的实际端口
    port: 3000,
    // 设为 true 时若端口已被占用则会直接退出，而不是尝试下一个可用端口
    strictPort: false,
    // 服务器启动时自动在浏览器中打开应用程序,当此值为字符串时，会被用作 URL 的路径名
    open: false,
    // 自定义代理规则
    proxy: {
      // 选项写法
      // '/api/tenant-lms-account-provide': {
      //   target: 'http://192.168.19.59:50002',
      //   changeOrigin: true,
      //   ws: true,
      //   rewrite: path => path.replace(/^\/api\/tenant-lms-account-provide/, '')
      // },
      '/api': {
        target: 'http://192.168.17.221:30570',
        // target: 'http://192.168.17.237:30530',
        changeOrigin: true,
        ws: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
})