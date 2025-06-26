import React, { useState } from "react";
import "./Login.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginTryCounter, setLoginTryCounter] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // მეილის ვალიდაციის ფუნქცია
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // მეილის ფორმატის შემოწმება
    if (!isValidEmail(email)) {
      setError("გთხოვთ, შეიყვანოთ მეილის სწორი ფორმატი");
      return;
    }

    setError(null);
    setIsLoading(true);
    
    try {
      // ვაგზავნით მეილს username-ის ნაცვლად
      const res = await newRequest.post("/auth/login", { email, password });
      
      localStorage.setItem("currentUser", JSON.stringify(res.data));
      navigate("/");
    } catch (err) {
      // შეცდომის დამუშავება
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError("დაფიქსირდა შეცდომა შესვლისას. გთხოვთ, სცადოთ მოგვიანებით.");
      }
      setLoginTryCounter(loginTryCounter + " ისევ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <h1>შესვლა</h1>
        
        <label htmlFor="email">ელ-ფოსტა</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="example@mail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={error && error.includes("მეილის") ? "input-error" : ""}
        />

        <label htmlFor="password">პაროლი</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={error && error.includes("პაროლი") ? "input-error" : ""}
        />
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? "იტვირთება..." : "შესვლა"}
        </button>
        
        {error && <div className="error-message">{error}</div>}
        {loginTryCounter && <div className="login-counter">{loginTryCounter}</div>}
      </form>
    </div>
  );
}

export default Login;
