import { jwtDecode } from "jwt-decode";// Install using: npm install jwt-decode

export const isTokenValid = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token); // Decode the token
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
    return decoded.exp > currentTime; // Check if token has expired
  } catch (error) {
    console.error("Invalid token:", error);
    return false;
  }
};
