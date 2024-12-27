// src/Context/RoleProvider.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve role from localStorage when the component mounts
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      setRole(storedRole);
    }
    setLoading(false);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole, loading }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  return useContext(RoleContext);
};
