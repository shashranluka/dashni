// import React from "react";
// import { Link } from "react-router-dom";
import "./Footer.scss";

function Footer() {
  return (
    <div className="footer">
      <div className="">
        <div className="">
          <div className="top">
            {/* <h2>დაშნი</h2> */}
            <div className="social">
              <div className="">
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="/img/facebook.png" alt="Facebook" />
                </a>
              </div>
              <div className="">
                <a
                  href="https://github.com/shashranluka/dashni"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/img/Black-Github-Logo-PNG-Photo.png"
                    alt="GitHub"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="intelectual-property">
          {/* შიდა ბმული - Link გამოიყენეთ */}
          {/* <Link to="/intelectual-property">
          ინტელექტუალური საკუთრების უფლებაზე
          </Link> */}

          {/* ან თუ ახალ ტაბში გინდათ გახსნა: */}
          {/* <a href="/intelectual-property" target="_blank" rel="noopener noreferrer">
          ინტელექტუალური საკუთრების უფლებაზე
          </a> */}
        </div>
      </div>
    </div>
  );
}

export default Footer;
