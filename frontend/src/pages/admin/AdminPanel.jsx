import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import getCurrentUser from "../../utils/getCurrentUser";
import "./AdminPanel.scss";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("languages");
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
//   console.log("Current User:", currentUser);
  // გადამისამართება თუ არ არის ადმინი
  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>ადმინისტრატორის პანელი</h1>
        <p>მართეთ აპლიკაციის შინაარსი</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={activeTab === "languages" ? "active" : ""} 
          onClick={() => setActiveTab("languages")}
        >
          ენების მართვა
        </button>
        <button 
          className={activeTab === "users" ? "active" : ""} 
          onClick={() => setActiveTab("users")}
        >
          მომხმარებლების მართვა
        </button>
        {/* შეგიძლიათ დაამატოთ სხვა ტაბები საჭიროებისამებრ */}
      </div>

      <div className="admin-content">
        {activeTab === "languages" && <LanguagesManager />}
        {activeTab === "users" && <UsersManager />}
      </div>
    </div>
  );
};

// ენების მართვის კომპონენტი
const LanguagesManager = () => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState(null);

  // ყველა ენის ჩამოტვირთვა
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoading(true);
        const response = await newRequest.get("/languages/admin/all");
        setLanguages(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching languages:", err);
        setError("ენების ჩამოტვირთვა ვერ მოხერხდა. თქვენ მაინც შეგიძლიათ დაამატოთ ახალი ენა.");
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  // ენის დამატება/რედაქტირების ფორმა
  const LanguageForm = ({ language = null, onSubmit, onCancel }) => {
    const isEditing = !!language;
    const [formData, setFormData] = useState({
      code: language?.code || "",
      name: language?.name || "",
      vowels: (language?.vowels || []).join(","),
      alphabet: (language?.alphabet || []).join(","),
      isActive: language?.isActive !== false
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    };

    const validateForm = () => {
      const errors = {};
      if (!formData.code.trim()) errors.code = "ენის კოდი აუცილებელია";
      if (!formData.name.trim()) errors.name = "ენის დასახელება აუცილებელია";
      
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setSubmitting(true);
      try {
        // ფორმატირება მასივებად
        const preparedData = {
          ...formData,
          vowels: formData.vowels.split(",").map(v => v.trim()).filter(Boolean),
          alphabet: formData.alphabet.split(",").map(a => a.trim()).filter(Boolean)
        };
        
        await onSubmit(preparedData);
        
      } catch (err) {
        console.error("Error submitting language:", err);
        setFormErrors(prev => ({ ...prev, submit: err.response?.data?.message || "შეცდომა ენის შენახვისას" }));
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <form className="language-form" onSubmit={handleSubmit}>
        <h3>{isEditing ? "ენის რედაქტირება" : "ახალი ენის დამატება"}</h3>
        
        <div className="form-group">
          <label htmlFor="code">ენის კოდი:</label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            disabled={isEditing} // რედაქტირებისას კოდის შეცვლა არ შეიძლება
            className={formErrors.code ? "error" : ""}
          />
          {formErrors.code && <div className="error-message">{formErrors.code}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="name">ენის დასახელება:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={formErrors.name ? "error" : ""}
          />
          {formErrors.name && <div className="error-message">{formErrors.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="vowels">ხმოვნები (მძიმით გამოყოფილი):</label>
          <input
            type="text"
            id="vowels"
            name="vowels"
            value={formData.vowels}
            onChange={handleChange}
            placeholder="მაგ: a,e,i,o,u"
          />
        </div>

        <div className="form-group">
          <label htmlFor="alphabet">ანბანი (მძიმით გამოყოფილი):</label>
          <textarea
            id="alphabet"
            name="alphabet"
            value={formData.alphabet}
            onChange={handleChange}
            placeholder="მაგ: a,b,c,d,e,f,g,h,i,j,k..."
            rows={4}
          />
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            აქტიური
          </label>
        </div>

        {formErrors.submit && <div className="error-message submit-error">{formErrors.submit}</div>}

        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? "მიმდინარეობს..." : (isEditing ? "განახლება" : "დამატება")}
          </button>
          <button type="button" onClick={onCancel} disabled={submitting}>
            გაუქმება
          </button>
        </div>
      </form>
    );
  };

  // ენის დამატება
  const handleAddLanguage = async (languageData) => {
    try {
      const response = await newRequest.post("/languages", languageData);
      setLanguages(prev => [...prev, response.data]);
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding language:", error);
      throw error;
    }
  };

  // ენის განახლება
  const handleUpdateLanguage = async (languageData) => {
    try {
      const response = await newRequest.put(`/languages/${languageData.code}`, languageData);
      setLanguages(prev => 
        prev.map(lang => lang.code === languageData.code ? response.data : lang)
      );
      setEditingLanguage(null);
    } catch (error) {
      console.error("Error updating language:", error);
      throw error;
    }
  };

  // ენის წაშლა
  const handleDeleteLanguage = async (code) => {
    if (!window.confirm(`დარწმუნებული ხართ, რომ გსურთ ენის "${code}" წაშლა?`)) {
      return;
    }
    
    try {
      await newRequest.delete(`/languages/${code}`);
      setLanguages(prev => prev.filter(lang => lang.code !== code));
    } catch (error) {
      console.error("Error deleting language:", error);
      alert("ენის წაშლა ვერ მოხერხდა. გთხოვთ, სცადოთ მოგვიანებით.");
    }
  };

  // აქ ცვლილება - ჩატვირთვის ინდიკატორი ცალკე დავაბრუნოთ, მაგრამ მთავარი კონტენტი ყოველთვის გამოჩნდეს
  return (
    <div className="languages-manager">
      <div className="languages-header">
        <h2>ენების მართვა</h2>
        <button onClick={() => setShowAddForm(true)}>+ ახალი ენის დამატება</button>
      </div>

      {/* ჩატვირთვის ინდიკატორი */}
      {loading && <div className="loading-indicator">ენების სია იტვირთება...</div>}
      
      {/* შეცდომის შეტყობინება, მაგრამ არ ბლოკავს კონტენტს */}
      {error && <div className="error-banner">{error}</div>}

      {/* ფორმები ყოველთვის ხელმისაწვდომია */}
      {showAddForm && (
        <div className="form-container">
          <LanguageForm 
            onSubmit={handleAddLanguage} 
            onCancel={() => setShowAddForm(false)} 
          />
        </div>
      )}
      
      {editingLanguage && (
        <div className="form-container">
          <LanguageForm 
            language={editingLanguage} 
            onSubmit={handleUpdateLanguage} 
            onCancel={() => setEditingLanguage(null)} 
          />
        </div>
      )}

      {/* ენების ცხრილი ჩნდება მხოლოდ თუ ჩატვირთვა დასრულდა */}
      {!loading && (
        <div className="languages-list">
          <table>
            <thead>
              <tr>
                <th>კოდი</th>
                <th>დასახელება</th>
                <th>ხმოვნები</th>
                <th>ანბანი</th>
                <th>სტატუსი</th>
                <th>მოქმედებები</th>
              </tr>
            </thead>
            <tbody>
              {languages.map(lang => (
                <tr key={lang.code} className={!lang.isActive ? "inactive" : ""}>
                  <td>{lang.code}</td>
                  <td>{lang.name}</td>
                  <td>
                    <div className="vowels-preview">
                      {lang.vowels && lang.vowels.length > 0 
                        ? lang.vowels.join(", ") 
                        : <em>არ არის მითითებული</em>}
                    </div>
                  </td>
                  <td>
                    <div className="alphabet-preview">
                      {lang.alphabet && lang.alphabet.length > 0 
                        ? (lang.alphabet.length > 10 
                            ? `${lang.alphabet.slice(0, 10).join(", ")}...` 
                            : lang.alphabet.join(", "))
                        : <em>არ არის მითითებული</em>}
                    </div>
                  </td>
                  <td>
                    <span className={`status ${lang.isActive ? "active" : "inactive"}`}>
                      {lang.isActive ? "აქტიური" : "არააქტიური"}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button 
                        className="edit"
                        onClick={() => setEditingLanguage(lang)}
                      >
                        რედაქტირება
                      </button>
                      <button 
                        className="delete"
                        onClick={() => handleDeleteLanguage(lang.code)}
                      >
                        წაშლა
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {languages.length === 0 && (
                <tr>
                  <td colSpan="6" className="no-data">
                    {error ? "ენების სიის ჩატვირთვა ვერ მოხერხდა" : "ენები არ არის დამატებული"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// მომხმარებლების მართვის კომპონენტი
const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // მომხმარებლების ჩამოტვირთვა
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await newRequest.get("/users/admin");
        setUsers(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("მომხმარებლების ჩამოტვირთვა ვერ მოხერხდა");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ძიების ფუნქციონალი და გვერდების ნავიგაცია დარჩება უცვლელი
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // მომხმარებლის აქტიურობის შეცვლა
  const handleToggleActive = async (userId, isCurrentlyActive) => {
    try {
      const response = await newRequest.put(`/users/${userId}/toggle-active`, {
        isActive: !isCurrentlyActive
      });
      
      setUsers(prev => 
        prev.map(user => user._id === userId ? { ...user, isActive: !isCurrentlyActive } : user)
      );
    } catch (error) {
      console.error("Error toggling active status:", error);
      alert("სტატუსის შეცვლა ვერ მოხერხდა. გთხოვთ, სცადოთ მოგვიანებით.");
    }
  };

  // მომხმარებლის როლის შეცვლა (მოდერატორი/ჩვეულებრივი)
  const handleToggleModerator = async (userId, isCurrentlyModerator) => {
    try {
      const response = await newRequest.put(`/users/${userId}/toggle-moderator`, {
        isModerator: !isCurrentlyModerator
      });
      
      setUsers(prev => 
        prev.map(user => user._id === userId ? { ...user, isModerator: !isCurrentlyModerator } : user)
      );
    } catch (error) {
      console.error("Error toggling moderator status:", error);
      alert("როლის შეცვლა ვერ მოხერხდა. გთხოვთ, სცადოთ მოგვიანებით.");
    }
  };

  // გვერდის ცვლილება
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="users-manager">
      <div className="users-header">
        <h2>მომხმარებლების მართვა</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="მოძებნეთ მომხმარებელი..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // დავაბრუნოთ პირველ გვერდზე ძიებისას
            }}
            className="search-input"
          />
        </div>
      </div>

      {loading && <div className="loading-indicator">მომხმარებლების სია იტვირთება...</div>}
      
      {error && <div className="error-banner">{error}</div>}

      {!loading && (
        <div className="users-list">
          <table>
            <thead>
              <tr>
                <th>სახელი</th>
                <th>ელ. ფოსტა</th>
                <th>რეგისტრაციის თარიღი</th>
                <th>სტატუსი</th>
                <th>როლი</th>
                <th>მოქმედებები</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map(user => (
                <tr key={user._id} className={!user.isActive ? "inactive" : ""}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status ${user.isActive ? "active" : "inactive"}`}>
                      {user.isActive ? "აქტიური" : "არააქტიური"}
                    </span>
                  </td>
                  <td>
                    <span className={`role ${user.isAdmin ? "admin" : user.isModerator ? "moderator" : "user"}`}>
                      {user.isAdmin 
                        ? "ადმინისტრატორი" 
                        : user.isModerator 
                          ? "მოდერატორი" 
                          : "მომხმარებელი"}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      {/* ადმინის ღილაკის ნაცვლად მოდერატორის ღილაკი */}
                      {!user.isAdmin && ( // ადმინებს ვერ შევუცვლით როლს
                        <button
                          className={user.isModerator ? "remove-moderator" : "make-moderator"}
                          onClick={() => handleToggleModerator(user._id, user.isModerator)}
                        >
                          {user.isModerator ? "მოდერატორის წართმევა" : "მოდერატორად დანიშვნა"}
                        </button>
                      )}
                      <button
                        className={user.isActive ? "deactivate" : "activate"}
                        onClick={() => handleToggleActive(user._id, user.isActive)}
                      >
                        {user.isActive ? "დეაქტივაცია" : "აქტივაცია"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="no-data">
                    {searchTerm 
                      ? "მოძებნილი მომხმარებელი ვერ მოიძებნა" 
                      : "მომხმარებლები არ არის დამატებული"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1}
            className="pagination-button"
          >
            &laquo; წინა
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`pagination-button ${currentPage === i + 1 ? "active" : ""}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => paginate(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            შემდეგი &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;