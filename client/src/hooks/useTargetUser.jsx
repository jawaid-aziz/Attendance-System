import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useId } from "../Context/IdProvider";

// Resolve which user a profile/attendance page should show, without putting
// any raw id in the URL. Priority: id passed via navigation state, then the
// "first-last" name slug in the URL (resolved on the server), then your own id.
export const useTargetUser = () => {
  const location = useLocation();
  const { name } = useParams();
  const { id: ownId } = useId();
  const stateUserId = location.state?.userId || null;

  const [targetId, setTargetId] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");

    if (stateUserId) {
      setTargetId(stateUserId);
      setStatus("ready");
      return () => {
        active = false;
      };
    }

    if (name) {
      fetch(
        `http://localhost:5000/byId/getUserByName/${encodeURIComponent(name)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((data) => {
          if (active) {
            setTargetId(data.user.id);
            setStatus("ready");
          }
        })
        .catch(() => {
          if (active) {
            setTargetId(ownId);
            setStatus("ready");
          }
        });
      return () => {
        active = false;
      };
    }

    setTargetId(ownId);
    setStatus("ready");
    return () => {
      active = false;
    };
  }, [stateUserId, name, ownId]);

  return { targetId, status };
};
