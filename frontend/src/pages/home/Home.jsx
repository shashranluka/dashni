import React from 'react';
import { Link } from 'react-router-dom';
import './Home.scss';

function Home() {
  return (
    <div className="home">
      <h1>მთავარი გვერდი</h1>
      <p>კეთილი იყოს თქვენი მობრძანება Dashni-ში!</p>

      <div className="home-links">
        <Link to="/tale-from-ada" className="home-link-card">
          ადას მიერ მოყოლილი ზღაპარი
        </Link>
      </div>
    </div>
  );
}

export default Home;
