import React from "react";
import "./Home.scss";
import { Link } from "react-router-dom";
import InfoButton from "../../components/infoButton/InfoButton";
import { generateInfoData } from "../../data/infoData";

function Home() {
  console.log(generateInfoData)
  return (
    <div className="home">
      {/* ინფორმაციის ღილაკის კომპონენტი */}
      <InfoButton infoData={generateInfoData} />
      
      {/* არსებული კონტენტი */}
      <Link className="link" to="/words">
        <div className="feature">სიტყვები</div>
      </Link>
      <Link className="link" to="/sentences">
        <div className="feature">წინადადებები</div>
      </Link>
    </div>
  );
}

export default Home;
