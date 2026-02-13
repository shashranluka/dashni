import React, { useState } from 'react';
import newRequest from '../../utils/newRequest';
import { trackSignUp } from '../../utils/analytics';
import './Register.scss';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await newRequest.post('auth/register', formData);
      console.log('წარმატებული რეგისტრაცია:', res.data);
      
      trackSignUp('email');
      
      alert('რეგისტრაცია წარმატებით დასრულდა!');
      
      // ფორმის გასუფთავება
      setFormData({
        username: '',
        email: '',
        password: ''
      });
    } catch (err) {
      console.error('რეგისტრაციის შეცდომა:', err);
      setError(err.response?.data?.message || 'რეგისტრაცია ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="register">
      <div className="register-container">
        <h1>რეგისტრაცია</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>მომხმარებლის სახელი <span className="required">*</span></label>
            <input
              type="text"
              name="username"
              placeholder="მომხმარებლის სახელი"
              value={formData.username}
              onChange={handleChange}
              required
              />
          </div>
          <div className="form-field">
            <label>ელ-ფოსტა <span className="required">*</span></label>
            <input
              type="email"
              name="email"
              placeholder="ელ-ფოსტა"
              value={formData.email}
              onChange={handleChange}
              required
              />
          </div>
          <div className="form-field">
            <label>პაროლი <span className="required">*</span></label>
            <input
              type="password"
              name="password"
              placeholder="პაროლი"
              value={formData.password}
              onChange={handleChange}
              required
              />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'რეგისტრაცია მიმდინარეობს...' : 'რეგისტრაცია'}
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}

export default Register;
