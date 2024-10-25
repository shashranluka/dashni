import React, { useState } from "react";
import upload from "../../utils/upload";
import "./Register.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";

function Register() {
  const [file, setFile] = useState(null);
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    // img: "",
    // country: "",
    isSeller: false,
    desc: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  const handleSeller = (e) => {
    setUser((prev) => {
      return { ...prev, isSeller: e.target.checked };
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = await upload(file);
    try {
      console.log(user);
      await newRequest.post("/auth/register", {
        ...user,
        // img: url,
      });
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="register">
      <form onSubmit={handleSubmit}>
        <div className="form">
          <h1>ახალი ანგარიშის შექმნა</h1>
          <label htmlFor="">მომხმარებლის სახელი</label>
          <input
            name="username"
            type="text"
            placeholder=""
            onChange={handleChange}
          />
          <label htmlFor="">მომხმარებლის ელ. ფოსტა</label>
          <input
            name="email"
            type="email"
            placeholder=""
            onChange={handleChange}
          />
          <label htmlFor="">პაროლი</label>
          <input name="password" type="password" onChange={handleChange} />
          <div className="toggle">
            <label htmlFor="">მენტორი</label>
            <label className="switch">
              <input type="checkbox" onChange={handleSeller} />
              <span className="slider round"></span>
            </label>
          </div>
          <label htmlFor="">ტელეფონის ნომერი</label>
          <input
            name="phone"
            type="text"
            placeholder=""
            onChange={handleChange}
          />
          <label htmlFor="">დამატებითი ინფორმაცია</label>
          <textarea
            placeholder=""
            name="desc"
            id=""
            cols="30"
            rows="10"
            onChange={handleChange}
          ></textarea>
          <button type="submit">რეგისტრაცია</button>
        </div>
        {/* <div className="right">
          <h1>I want to become a seller</h1>
          <div className="toggle">
            <label htmlFor="">Activate the seller account</label>
            <label className="switch">
              <input type="checkbox" onChange={handleSeller} />
              <span className="slider round"></span>
            </label>
          </div>
          <label htmlFor="">Phone Number</label>
          <input
            name="phone"
            type="text"
            placeholder="+1 234 567 89"
            onChange={handleChange}
          />
          <label htmlFor="">Description</label>
          <textarea
            placeholder="A short description of yourself"
            name="desc"
            id=""
            cols="30"
            rows="10"
            onChange={handleChange}
          ></textarea>
        </div> */}
      </form>
    </div>
  );
}

export default Register;
