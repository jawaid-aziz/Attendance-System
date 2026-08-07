import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/auth": "http://localhost:5000",
      "/admin": "http://localhost:5000",
      "/attend": "http://localhost:5000",
      "/byId": "http://localhost:5000",
      "/superadmin": "http://localhost:5000",
      "/health": "http://localhost:5000",
    },
  },
})
