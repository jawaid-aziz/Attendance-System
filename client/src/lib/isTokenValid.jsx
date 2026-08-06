import { isTokenExpired } from "./tokenExpire";

export const isTokenValid = () => {
  const token = localStorage.getItem("token");
  return !!token && !isTokenExpired(token);
};
