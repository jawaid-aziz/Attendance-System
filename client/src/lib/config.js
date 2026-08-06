// Central API base URL. Set VITE_API_URL in client/.env to point at a
// deployed backend (e.g. https://api.example.com). Falls back to local dev.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
