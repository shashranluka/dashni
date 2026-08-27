import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import { isPrivateContributorUser } from "../../utils/roles";

// არსებული route guard-ების მსგავსად children React-ის ჩადგმული კონტენტია.
// eslint-disable-next-line react/prop-types
function RequirePrivateContributor({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    newRequest
      .get("/auth/me")
      .then((res) => {
        setStatus(isPrivateContributorUser(res.data) ? "ok" : "forbidden");
      })
      .catch((err) => {
        setStatus(err?.response?.status === 401 ? "unauth" : "forbidden");
      });
  }, []);

  if (status === "loading") return null;
  if (status === "unauth") return <Navigate to="/login" replace />;
  if (status === "forbidden") return <Navigate to="/" replace />;

  return children;
}

export default RequirePrivateContributor;
