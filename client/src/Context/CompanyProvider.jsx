// src/Context/CompanyProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";

const CompanyContext = createContext({
  company: null,
  loading: true,
  refresh: () => {},
});

// Fetches the current tenant company (by slug in localStorage) so the UI can
// personalize branding (company name) per organization. Refreshes whenever the
// "auth-changed" event fires (login / setup / logout).
export const CompanyProvider = ({ children }) => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  const refresh = () => setVersion((v) => v + 1);

  useEffect(() => {
    let active = true;

    const load = () => {
      const slug = localStorage.getItem("slug");
      const token = localStorage.getItem("token");

      if (!slug || !token) {
        setCompany(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      fetch(`http://localhost:5000/company/${encodeURIComponent(slug)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((data) => {
          if (active) setCompany(data.company);
        })
        .catch(() => {
          if (active) setCompany(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    };

    load();

    const onAuth = () => load();
    window.addEventListener("auth-changed", onAuth);
    return () => {
      active = false;
      window.removeEventListener("auth-changed", onAuth);
    };
  }, [version]);

  return (
    <CompanyContext.Provider value={{ company, loading, refresh }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  return useContext(CompanyContext);
};
