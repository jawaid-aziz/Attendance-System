import { isTokenExpired } from "./tokenExpire";
import { useNavigate } from "react-router-dom";

export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  if (!token || isTokenExpired(token)) {
    localStorage.clear();
    navigate("/"); // Redirect to login page
    throw new Error("Token expired. Please log in again.");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Something went wrong.");
  }

  return response.json();
};