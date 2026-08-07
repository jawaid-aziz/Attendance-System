// Central API base URL. Set VITE_API_URL to point at a deployed backend
// (required for production builds; vite.config.js fails the build without it).
// In dev, requests are same-origin and proxied to the API server by Vite
// (see vite.config.js), avoiding CORS entirely.
export const API_URL = import.meta.env.VITE_API_URL || "";
