import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../../hooks/useAuth";
import { isPrivateContributorUser } from "../../utils/roles";

// Route guard — მხოლოდ private contributor-ს ან admin-ს უშვებს.
// მონაცემებს AuthContext-იდან იღებს, ანუ საკუთარ /auth/me მოთხოვნას აღარ აგზავნის.
function RequirePrivateContributor({ children }) {
  const { user, loading } = useAuth();

  // სანამ პასუხი არ მოსულა, არაფერს ვასახავთ — თორემ გვერდი გაიელვებდა.
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isPrivateContributorUser(user)) return <Navigate to="/" replace />;

  return children;
}

RequirePrivateContributor.propTypes = {
  children: PropTypes.node,
};

export default RequirePrivateContributor;
