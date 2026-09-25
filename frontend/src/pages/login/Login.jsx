import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import newRequest from '../../utils/newRequest';
import { useAuth } from '../../hooks/useAuth';
import './Login.scss';

function Login() {
  const { refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await newRequest.post('auth/login', { email, password });

      // მომხმარებელს სერვერიდან ვკითხულობთ და არა login-ის პასუხიდან —
      // ასე ერთი წყარო რჩება და როლიც ყოველთვის აქტუალურია.
      await refresh();

      navigate('/');
    } catch (err) {
      console.error('შესვლის შეცდომა:', err);
      setError(err.response?.data?.message || 'შესვლა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login-container">
        <h1>შესვლა</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>ელ-ფოსტა <span className="required">*</span></label>
            <input
              type="email"
              placeholder="ელ-ფოსტა"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label>პაროლი <span className="required">*</span></label>
            <input
              type="password"
              placeholder="პაროლი"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'შესვლა მიმდინარეობს...' : 'შესვლა'}
          </button>
        </form>
        <div className="register-link">
          <p>არ გაქვს ანგარიში? <Link to="/register">დარეგისტრირდი</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
