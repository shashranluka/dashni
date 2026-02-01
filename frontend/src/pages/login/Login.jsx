import React, { useState } from 'react';
import './Login.scss';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('შესვლა:', { email, password });
  };

  return (
    <div className="login">
      <div className="login-container">
        <h1>შესვლა</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="ელ-ფოსტა"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="პაროლი"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">შესვლა</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
