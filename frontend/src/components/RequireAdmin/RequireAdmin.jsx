import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../../hooks/useAuth";
import { isAdminUser } from "../../utils/roles";

// Route guard — მხოლოდ admin-ს უშვებს.
// მონაცემებს AuthContext-იდან იღებს, ანუ საკუთარ /auth/me მოთხოვნას აღარ აგზავნის.
function RequireAdmin({ children }) {
  const { user, loading } = useAuth();

  // სანამ პასუხი არ მოსულა, არაფერს ვასახავთ — თორემ გვერდი გაიელვებდა.
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdminUser(user)) return <Navigate to="/" replace />;

  return children;
}

RequireAdmin.propTypes = {
  children: PropTypes.node,
};

export default RequireAdmin;
