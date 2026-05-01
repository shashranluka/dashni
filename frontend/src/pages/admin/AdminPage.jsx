import { useEffect, useState } from "react";
import newRequest from "../../utils/newRequest";
import "./AdminPage.scss";

// ადმინ პანელი — ყველა მომხმარებლის სია is_active toggle-ითა და role dropdown-ით.
// ადმინს შეუძლია ნებისმიერი მომხმარებლის გააქტიურება და როლის შეცვლა,
// გარდა საკუთარი თავისა (isSelf row-ი გათიშულია).
const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // saving — ობიექტი { [userId]: true/false }, რათა თითოეულ row-ს ცალ-ცალკე
  // ჰქონდეს loading მდგომარეობა შენახვის დროს.
  const [saving, setSaving] = useState({});
  // currentUserId — საჭიროა საკუთარი row-ის გასათიშად.
  const [currentUserId, setCurrentUserId] = useState(null);

  // კომპონენტის mount-ზე პარალელურად ვიღებთ:
  // 1) /auth/me — მიმდინარე ადმინის id, isSelf-ის გამოსათვლელად.
  // 2) /auth/users — ყველა მომხმარებლის სია ცხრილისთვის.
  useEffect(() => {
    newRequest.get("/auth/me").then((res) => setCurrentUserId(res.data?.id));
    newRequest
      .get("/auth/users")
      .then((res) => setUsers(res.data))
      .catch(() => setError("მომხმარებლების ჩატვირთვა ვერ მოხერხდა"))
      .finally(() => setLoading(false));
  }, []);

  // ადგილობრივად ცვლის is_active checkbox-ის მნიშვნელობას სერვერზე გაგზავნამდე.
  const toggleActive = (userId) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u))
    );
  };

  // ადგილობრივად ცვლის role dropdown-ის მნიშვნელობას სერვერზე გაგზავნამდე.
  const changeRole = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  // შენახვის ღილაკის handler — PATCH-ს უგზავნის სერვერს კონკრეტული მომხმარებლის
  // მიმდინარე is_active და role მნიშვნელობებს.
  // წარმატების შემთხვევაში state-ს სერვერის პასუხით ანახლებს (single source of truth).
  // შეცდომის შემთხვევაში alert-ს ასახავს სერვერის შეტყობინებით.
  const save = async (user) => {
    setSaving((prev) => ({ ...prev, [user.id]: true }));
    try {
      const res = await newRequest.patch(`/auth/users/${user.id}/permissions`, {
        is_active: user.is_active,
        role: user.role,
      });
      // სერვერის დაბრუნებული განახლებული ობიექტით ვანაცვლებთ ძველ row-ს.
      setUsers((prev) => prev.map((u) => (u.id === user.id ? res.data : u)));
    } catch (err) {
      alert(err?.response?.data?.message || "შეცდომა შენახვისას");
    } finally {
      // შენახვა დასრულდა — ღილაკი კვლავ აქტიური გახდება.
      setSaving((prev) => ({ ...prev, [user.id]: false }));
    }
  };
  console.log("AdminPage render:", { users, loading, error, saving });
  if (loading) return <div className="admin-page"><p>იტვირთება...</p></div>;
  if (error) return <div className="admin-page"><p className="admin-error">{error}</p></div>;

  return (
    <div className="admin-page">
      <h1>ადმინ პანელი</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>მომხმარებელი</th>
            <th>ელ-ფოსტა</th>
            <th>აქტიური</th>
            <th>როლი</th>
            <th>შენახვა</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <tr key={user.id} className={isSelf ? "admin-table__self" : ""}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={!!user.is_active}
                    disabled={isSelf}
                    onChange={() => toggleActive(user.id)}
                  />
                </td>
                <td>
                  <select
                    className="admin-role-select"
                    value={user.role || "user"}
                    disabled={isSelf}
                    onChange={(e) => changeRole(user.id, e.target.value)}
                  >
                    <option value="user">user</option>
                    <option value="editor">editor</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>
                  <button
                    className="admin-save-btn"
                    disabled={isSelf || saving[user.id]}
                    onClick={() => save(user)}
                  >
                    {saving[user.id] ? "..." : "შენახვა"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
