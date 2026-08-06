// src/Context/IdProvider.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

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

export const useId = () => {
  return useContext(IdContext);
};
