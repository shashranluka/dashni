import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import { isEditorUser } from "../../utils/roles";

function RequireEditor({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    newRequest
      .get("/auth/me")
      .then((res) => {
        setStatus(isEditorUser(res.data) ? "ok" : "forbidden");
      })
      .catch((err) => {
        setStatus(err?.response?.status === 401 ? "unauth" : "forbidden");
      });
  }, []);

  if (status === "loading") return null;
  if (status === "unauth") return <Navigate to="/login" replace />;
  if (status === "forbidden") return <Navigate to="/listen" replace />;

  return children;
}

export default RequireEditor;
