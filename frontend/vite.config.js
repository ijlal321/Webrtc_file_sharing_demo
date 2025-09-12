import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['all', 'odsyd-2400-adc5-437-4f00-d88c-2be-47c1-f8c0.a.free.pinggy.link'],  
    // proxy: {
    //   '/ws': {
    //     target: 'http://localhost:8080',  // your WebSocket backend
    //     ws: true,                         // proxy WebSockets
    //     changeOrigin: true
    //   }
    // }
  }
})
