import { isTokenValid } from "@/lib/isTokenValid";
import { getHomePath } from "@/lib/getHomePath";
import { Navigate } from "react-router-dom";

// Evaluated at render time (not module load) so the login/setup guards track
// the current auth state instead of being frozen at app start.
export const PublicOnly = ({ children }) => {
  return isTokenValid() ? <Navigate to={getHomePath()} replace /> : children;
};
