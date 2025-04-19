import React, { useState } from "react";
import "./Login.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginTryCounter, setLoginTryCounter] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    console.log(e, "e");
    e.preventDefault();
    try {
      const res = await newRequest.post("/auth/login", { username, password });
      console.log("res", res);
      localStorage.setItem("currentUser", JSON.stringify(res.data));
      navigate("/");
    } catch (err) {
      setError(err.response.data);
      setLoginTryCounter(loginTryCounter+" ისევ")
    }
  };

  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <h1>შესვლა</h1>
        <label htmlFor="">მომხმარებლის სახელი</label>
        <input
          name="username"
          type="text"
          required="true"
          placeholder=""
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="">პაროლი</label>
        <input
          name="password"
          type="password"
          required="true"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && error}{loginTryCounter}
      </form>
    </div>
  );
}

export default Login;
