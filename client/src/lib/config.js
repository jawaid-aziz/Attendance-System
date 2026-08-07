// Central API base URL. Set VITE_API_URL to point at a deployed backend.
// In dev, requests are same-origin and proxied to the API server by Vite
// (see vite.config.js), avoiding CORS entirely.
export const API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "" : "http://localhost:5000");
