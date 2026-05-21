import { useState } from "react";
import newRequest from "../../utils/newRequest";
import "./LexiconsForAdmin.scss";

function LexiconsForAdmin({ currentUser }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [saving, setSaving] = useState({});

  // მხოლოდ admin-ს
  if (!currentUser || currentUser.role !== "admin") return <div>Admin only</div>;

  const handleSearch = async () => {
    try {
      const params = { q: search, fromAdmin: true };
      const res = await newRequest.get("/lexicons/search", { params });
      setResults(res.data?.rows || []);
    } catch (err) {
      setResults([]);
      // სურვილის შემთხვევაში დაამატე შეცდომის შეტყობინება
    }
  };

  const toggleShowToUsers = async (lexicon) => {
    setSaving((prev) => ({ ...prev, [lexicon.id]: true }));
    try {
      const updated = { ...lexicon, show_to_users: !lexicon.show_to_users };
      await newRequest.patch(`/lexicons/${lexicon.id}`, { show_to_users: updated.show_to_users });
      setResults(results.map(l => l.id === lexicon.id ? updated : l));
    } finally {
      setSaving((prev) => ({ ...prev, [lexicon.id]: false }));
    }
  };

  return (
    <div className="lexicons-admin-container">
      <h2>ლექსიკონების ძებნა (მხოლოდ ადმინისთვის)</h2>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="ტექსტის ძებნა"
      />
      <button onClick={handleSearch}>ძებნა</button>
      {results.length > 0 && (() => {
        const visible = results.filter(l => l.show_to_users).length;
        const hidden = results.length - visible;
        return (
          <div style={{ margin: "1rem 0", color: "#1976d2", fontWeight: 500 }}>
            ნაპოვნი ჩანაწერები: {results.length} | <span style={{color:'#388e3c'}}>ჩანს: {visible}</span> | <span style={{color:'#d32f2f'}}>არ ჩანს: {hidden}</span>
          </div>
        );
      })()}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>ტექსტი</th>
            <th>ლექსიკონი</th>
            <th>ჩანს მომხმარებლებისთვის</th>
          </tr>
        </thead>
        <tbody>
          {results.map(lexicon => (
            <tr key={lexicon.id}>
              <td>{lexicon.id}</td>
              <td>{lexicon.text}</td>
              <td>{lexicon.lexicon_name}</td>
              <td>
                <input
                  type="checkbox"
                  checked={!!lexicon.show_to_users}
                  disabled={!!saving[lexicon.id]}
                  onChange={() => toggleShowToUsers(lexicon)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LexiconsForAdmin;