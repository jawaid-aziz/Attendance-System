// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useRole } from "../Context/RoleProvider";
import { useId } from "../Context/IdProvider"; // If you have IdProvider
import { isTokenExpired } from "@/lib/tokenExpire";
const ProtectedRoute = ({ children, roles }) => {
  const { role, loading: roleLoading } = useRole();
  const { id, loading: idLoading } = useId(); // If using IdProvider
  const token = localStorage.getItem("token"); // Retrieve the token from localStorage

  // If either role or id is loading, show a loading indicator
  if (roleLoading || idLoading) {
    return <div>Loading...</div>; // You can replace this with a spinner or any loading component
  }
  if (!token ||isTokenExpired(token)) {
    localStorage.clear();
    return <Navigate to="/" />;
  }
  // If no token or role/id is missing, redirect to login
  if (!role || !id) {
    return <Navigate to="/"  />;
  }

  // If roles are specified and user's role is not authorized, redirect to unauthorized page
  if (roles && !roles.includes(role)) {
    return <Navigate to="/"  />;
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
