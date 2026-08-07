import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === "production" && !process.env.VITE_API_URL) {
    throw new Error(
      "VITE_API_URL must be set when building for production " +
        "(e.g. VITE_API_URL=https://api.example.com npm run build). " +
        "Without it the client would call the localhost dev server."
    );
  }
  return {
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
  }
})
