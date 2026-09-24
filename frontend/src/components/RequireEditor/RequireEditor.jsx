import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../../hooks/useAuth";
import { isEditorUser } from "../../utils/roles";

// Route guard — მხოლოდ editor-ს ან admin-ს უშვებს.
// მონაცემებს AuthContext-იდან იღებს, ანუ საკუთარ /auth/me მოთხოვნას აღარ აგზავნის.
function RequireEditor({ children }) {
  const { user, loading } = useAuth();

  // სანამ პასუხი არ მოსულა, არაფერს ვასახავთ — თორემ გვერდი გაიელვებდა.
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isEditorUser(user)) return <Navigate to="/" replace />;

  return children;
}

RequireEditor.propTypes = {
  children: PropTypes.node,
};

export default RequireEditor;
