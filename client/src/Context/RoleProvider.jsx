// src/Context/RoleProvider.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

const RoleContext = createContext();

const readRole = () => localStorage.getItem('role');

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(readRole());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRole(readRole());
    setLoading(false);

    // Keep the context in sync with login/logout without a reload.
    const onAuth = () => setRole(readRole());
    window.addEventListener('auth-changed', onAuth);
    return () => window.removeEventListener('auth-changed', onAuth);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole, loading }}>
      {children}
    </RoleContext.Provider>
  );
};

RoleProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useRole = () => {
  return useContext(RoleContext);
};
