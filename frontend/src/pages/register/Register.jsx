import React, { useState } from "react";
import upload from "../../utils/upload";
import "./Register.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate, Link } from "react-router-dom"; // დავამატეთ Link კომპონენტი

function Register() {
  const [file, setFile] = useState(null);
  // isSeller სტეიტი ავტომატურად true-ია, რადგან ჯერჯერობით რეგისტრაციის დროს მომხმარებელი უნდა იყოს შემქმნელი
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    isSeller: true,
    desc: "",
  });

  // დავამატოთ შეცდომების სტეიტები
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [emailExists, setEmailExists] = useState(false); // სპეციფიკური სტეიტი მეილისთვის

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // თუ მომხმარებელი ცვლის ელ-ფოსტას, წავშალოთ შეცდომა
    if (name === 'email' && emailExists) {
      setEmailExists(false);
    }
    
    setUser((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const handleSeller = (e) => {
    setUser((prev) => {
      return { ...prev, isSeller: e.target.checked };
    });
  };

  // ვალიდაციის ფუნქცია
  const validateForm = () => {
    const newErrors = {};

    // ელ.ფოსტის ვალიდაცია
    if (!user.email) {
      newErrors.email = "ელ. ფოსტა აუცილებელია";
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = "ელ. ფოსტა არასწორი ფორმატისაა";
    }

    // მეტსახელის ვალიდაცია
    if (!user.username) {
      newErrors.username = "მეტსახელი აუცილებელია";
    } else if (user.username.length < 3) {
      newErrors.username = "მეტსახელი უნდა შეიცავდეს მინიმუმ 3 სიმბოლოს";
    }

    // პაროლის ვალიდაცია
    if (!user.password) {
      newErrors.password = "პაროლი აუცილებელია";
    } else if (user.password.length < 6) {
      newErrors.password = "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // handleSubmit ფუნქციის განახლება
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setEmailExists(false);

    // ვალიდაციის შემოწმება
    if (!validateForm()) {
      return; // თუ ვალიდაცია ვერ გაიარა, ფუნქცია წყდება
    }

    try {
      // const url = file ? await upload(file) : null;
      await newRequest.post("/auth/register", user);
      navigate("/login"); // წარმატებული რეგისტრაციის შემდეგ გადავიდეთ login გვერდზე
    } catch (err) {
      console.error("რეგისტრაციის შეცდომა:", err);
      
      // თუ შეცდომა 409-ია და ეხება ელ-ფოსტას
      if (err.response?.status === 409 && 
          err.response?.data?.message?.includes("ელ-ფოსტით")) {
        setEmailExists(true); // ჩავრთოთ ელ-ფოსტის არსებობის ფლაგი
      } else {
        // სხვა შეცდომების შემთხვევაში
        setSubmitError(
          err.response?.data?.message || "რეგისტრაციისას დაფიქსირდა შეცდომა"
        );
      }
    }
  };

  return (
    <div className="register">
      <form onSubmit={handleSubmit}>
        <div className="form">
          <h1>ახალი ანგარიშის შექმნა</h1>
          
          {/* ელ-ფოსტის ველი გაუმჯობესებული შეცდომებით */}
          <div className="input-group">
            <label htmlFor="email">ელ. ფოსტა *</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="მაგ: your.email@example.com"
              onChange={handleChange}
              className={errors.email || emailExists ? "input-error" : ""}
            />
            
            {/* ვაჩვენოთ შეცდომის მესიჯი მეილის ველთან */}
            {errors.email && <span className="error-message">{errors.email}</span>}
            
            {/* ვაჩვენოთ მინიშნება უკვე რეგისტრირებული მეილისთვის */}
            {emailExists && (
              <div className="email-exists-error">
                <span className="error-message">ამ ელ-ფოსტით მომხმარებელი უკვე არსებობს</span>
                <Link to="/login" className="login-link">შესვლა</Link>
              </div>
            )}
          </div>
          
          <div className="input-group">
            <label htmlFor="username">მეტსახელი *</label>
            <input
              id="username"
              name="username"
              required
              type="text"
              placeholder="მინ. 3 სიმბოლო"
              onChange={handleChange}
              className={errors.username ? "input-error" : ""}
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>
          
          <div className="input-group">
            <label htmlFor="password">პაროლი *</label>
            <input 
              id="password"
              name="password" 
              required 
              type="password" 
              placeholder="მინ. 6 სიმბოლო"
              onChange={handleChange}
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          
          {/* <div className="toggle">
            <label htmlFor="isSeller">შემქმნელი</label>
            <label className="switch">
              <input id="isSeller" type="checkbox" onChange={handleSeller} />
              <span className="slider round"></span>
            </label>
          </div> */}
          
          <div className="input-group">
            <label htmlFor="phone">ტელეფონის ნომერი</label>
            <input
              id="phone"
              name="phone"
              type="text"
              placeholder="მაგ: 5xx xx xx xx"
              onChange={handleChange}
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="desc">დამატებითი ინფორმაცია</label>
            <textarea
              id="desc"
              placeholder="მოგვიყევით თქვენს შესახებ..."
              name="desc"
              rows="5"
              onChange={handleChange}
            ></textarea>
          </div>
          
          {/* ზოგადი შეცდომის შეტყობინება */}
          {submitError && <div className="submit-error">{submitError}</div>}
          
          <button type="submit">რეგისტრაცია</button>
          
          {/* დამატებითი ბმული შესვლისკენ */}
          <div className="login-prompt">
            უკვე გაქვთ ანგარიში? <Link to="/login">შესვლა</Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Register;
