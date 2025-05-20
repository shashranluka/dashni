import React from "react";
import "./Home.scss";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">
      {/* <div className="features flex-column"> */}
        <Link className="link" to="/words">
          <div className="feature">სიტყვები</div>
        </Link>
    </div>
  );
}

export default Home;
