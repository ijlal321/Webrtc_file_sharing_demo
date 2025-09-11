import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // allowedHosts: ['all', '770b685aa734.ngrok-free.app'],  
    // proxy: {
    //   '/ws': {
    //     target: 'http://localhost:8080',  // your WebSocket backend
    //     ws: true,                         // proxy WebSockets
    //     changeOrigin: true
    //   }
    // }
  }
})
