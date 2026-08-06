import { isTokenExpired } from "./tokenExpire";
import { API_URL } from "./config";

// Small helper for authenticated fetch calls. No hooks here — on an invalid
// or expired token it clears storage and redirects to the login page.
const redirectToLogin = () => {
  localStorage.clear();
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  if (!token || isTokenExpired(token)) {
    redirectToLogin();
    throw new Error("Token expired. Please log in again.");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${url}`, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401) {
      redirectToLogin();
      throw new Error("Session expired. Please log in again.");
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Something went wrong.");
  }

  return response.json();
};
