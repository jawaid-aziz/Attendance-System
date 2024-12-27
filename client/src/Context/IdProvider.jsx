// src/Context/IdProvider.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

const IdContext = createContext();

export const IdProvider = ({ children }) => {
  const [id, setId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedId = localStorage.getItem('id');
    if (storedId) {
      setId(storedId);
    }
    setLoading(false);
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
