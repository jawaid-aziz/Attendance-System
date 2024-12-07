import React, { createContext, useContext, useState, useEffect } from "react";

const IdContext = createContext();

export const useId = () => useContext(IdContext);

export const IdProvider = ({ children }) => {
    const [id, setId] = useState(() => {
      // Get initial value from localStorage
      return localStorage.getItem("id") || null;
    });

    useEffect(() => {
        // Store the value in localStorage whenever it changes
        if (id) {
          localStorage.setItem("id", id);
        } else {
          localStorage.removeItem("id");
        }
      }, [id]);

  return (
    <IdContext.Provider value={{ id, setId }}>
      {children}
    </IdContext.Provider>
  );
};
