import { useEffect, useState } from "react";
import { API_URL } from "../lib/config";

// Fetches the company's timezone and office-open flag once, then ticks the
// current time every second so dashboard clocks stay live.
export const useServerTime = (slug) => {
  const [state, setState] = useState({
    timezone: null,
    isAllowedTime: null,
    now: new Date(),
  });

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/attend/server-time?slug=${slug}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (active) {
          setState((prev) => ({
            ...prev,
            timezone: data.timezone,
            isAllowedTime: data.isAllowedTime,
          }));
        }
      })
      .catch(() => {
        /* clock keeps running off the client clock */
      });

    const interval = setInterval(() => {
      if (active) setState((prev) => ({ ...prev, now: new Date() }));
    }, 1000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [slug]);

  return state;
};
