import { useEffect, useState } from "react";
import { API_URL } from "../lib/config";

// Module-level cache: fetch each user once per session and reuse the result
// across mounts (Header, Clocking, etc.) instead of re-requesting on every
// render/mount of each component.
const cache = new Map();

// Returns the logged-in profile object ({ id, firstName, ... }) for `id`,
// or null while loading / on failure.
export const useUser = (id) => {
  const [user, setUser] = useState(cache.get(id) || null);

  useEffect(() => {
    if (!id) return;
    if (cache.has(id)) {
      setUser(cache.get(id));
      return;
    }
    let active = true;
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/byId/getUser/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (active) {
          cache.set(id, data.user);
          setUser(data.user);
        }
      })
      .catch(() => {
        if (active) setUser(null);
      });
    return () => {
      active = false;
    };
  }, [id]);

  return user;
};
