// src/Context/IdProvider.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

const IdContext = createContext();

const readId = () => localStorage.getItem('id');

export const IdProvider = ({ children }) => {
  const [id, setId] = useState(readId());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setId(readId());
    setLoading(false);

    // Keep the context in sync with login/logout without a reload.
    const onAuth = () => setId(readId());
    window.addEventListener('auth-changed', onAuth);
    return () => window.removeEventListener('auth-changed', onAuth);
  }, []);

  return (
    <IdContext.Provider value={{ id, setId, loading }}>
      {children}
    </IdContext.Provider>
  );
};

IdProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useId = () => {
  return useContext(IdContext);
};
