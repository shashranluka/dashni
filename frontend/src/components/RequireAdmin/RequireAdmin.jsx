import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";

// Route guard კომპონენტი — ადმინის წვდომის სავალდებულო შემოწმება.
// children-ს ასახავს მხოლოდ დადასტურებული ადმინისთვის, სხვა შემთხვევაში ახდენს redirect-ს.
const RequireAdmin = ({ children }) => {
  // status-ი ასახავს შემოწმების მდგომარეობას:
  // "checking"      — მოთხოვნა ჯერ სრულდება, არაფერი არ ისახება.
  // "allowed"       — ადმინი დადასტურდა, children ისახება.
  // "unauthorized"  — ტოკენი არ არის/ვადაგასული → /login.
  // "forbidden"     — ავტორიზებულია, მაგრამ ადმინი არ არის → /words.
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    // სერვერს ვეკითხებით მიმდინარე მომხმარებლის მონაცემებს cookie-ით.
    // /auth/me აბრუნებს req.user-ს — is_admin ველით ვამოწმებთ უფლებას.
    newRequest
      .get("/auth/me")
      .then((res) => {
        if (res.data?.role === "admin") {
          setStatus("allowed");
        } else {
          // ავტორიზებულია, მაგრამ admin არ არის.
          setStatus("forbidden");
        }
      })
      .catch((err) => {
        // 401 ნიშნავს, რომ ტოკენი არ არის ან ვადაგასულია.
        if (err?.response?.status === 401) {
          setStatus("unauthorized");
        } else {
          // სხვა ნებისმიერი შეცდომა (500, ქსელი) — forbidden-ად ვთვლით.
          setStatus("forbidden");
        }
      });
  }, []);

  // შემოწმების დროს არაფერს ვასახავთ — flash-ის თავიდან ასაცილებლად.
  if (status === "checking") return null;
  if (status === "unauthorized") return <Navigate to="/login" replace />;
  if (status === "forbidden") return <Navigate to="/words" replace />;
  return children;
};

export default RequireAdmin;
