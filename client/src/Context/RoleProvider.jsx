import React, { createContext, useContext, useState, useEffect } from "react";

const RoleContext = createContext();

export const useRole = () => useContext(RoleContext);

export const RoleProvider = ({ children }) => {
    const [role, setRole] = useState(() => {
      // Get initial value from localStorage
      return localStorage.getItem("role") || null;
    });

    useEffect(() => {
        // Store the value in localStorage whenever it changes
        if (role) {
          localStorage.setItem("role", role);
        } else {
          localStorage.removeItem("role");
        }
      }, [role]);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};
