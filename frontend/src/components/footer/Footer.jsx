import React from "react";
import { Link } from "react-router-dom";
import "./Footer.scss";

function Footer() {
  return (
    <div className="footer">
      <div className="">
        {/* <div className="top">
          <div className="item">
            <h2>Categories</h2>
            <span>Graphics & Design</span>
            <span>Digital Marketing</span>
            <span>Writing & Translation</span>
            <span>Video & Animation</span>
            <span>Music & Audio</span>
            <span>Programming & Tech</span>
            <span>Data</span>
            <span>Business</span>
            <span>Lifestyle</span>
            <span>Photography</span>
            <span>Sitemap</span>
          </div>
          <div className="item">
            <h2>About</h2>
            <span>Press & News</span>
            <span>Partnerships</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Intellectual Property Claims</span>
            <span>Investor Relations</span>
            <span>Contact Sales</span>
          </div>
          <div className="item">
            <h2>Support</h2>
            <span>Help & Support</span>
            <span>Trust & Safety</span>
            <span>Selling on Fiverr</span>
            <span>Buying on Fiverr</span>
          </div>
          <div className="item">
            <h2>Community</h2>
            <span>Customer Success Stories</span>
            <span>Community hub</span>
            <span>Forum</span>
            <span>Events</span>
            <span>Blog</span>
            <span>Influencers</span>
            <span>Affiliates</span>
            <span>Podcast</span>
            <span>Invite a Friend</span>
            <span>Become a Seller</span>
            <span>Community Standards</span>
          </div>
          <div className="item">
            <h2>More From Fiverr</h2>
            <span>Fiverr Business</span>
            <span>Fiverr Pro</span>
            <span>Fiverr Logo Maker</span>
            <span>Fiverr Guides</span>
            <span>Get Inspired</span>
            <span>Fiverr Select</span>
            <span>ClearVoice</span>
            <span>Fiverr Workspace</span>
            <span>Learn</span>
            <span>Working Not Working</span>
          </div>
        </div>
        <hr /> */}
        <div className="">
          <div className="top">
            <h2>დაშნი</h2>
            <div className="social">
              {/* <img src="/img/twitter.png" alt="" /> */}
              {/* <div className="">
                <Link to="https://www.facebook.com/lukaziskara/">
                  <img src="/img/facebook.png" alt="" />
                </Link>
              </div> */}
              <div className="">
                <Link to="https://www.facebook.com/">
                  <img src="/img/facebook.png" alt="" />
                </Link>
              </div>
              <div className="">
                <Link to="https://github.com/shashranluka/dashni">
                  <img src="/img/Black-Github-Logo-PNG-Photo.png" alt="" />
                </Link>
              </div>
              {/* <img src="/img/twitter.png" alt="" />
              <img src="/img/linkedin.png" alt="" />
              <img src="/img/pinterest.png" alt="" />
              <img src="/img/instagram.png" alt="" /> */}
            </div>
            {/* <div className="link">
              <img src="/img/language.png" alt="" />
              <span>English</span>
            </div>
            <div className="link">
              <img src="/img/coin.png" alt="" />
              <span>USD</span>
            </div>
            <img src="/img/accessibility.png" alt="" /> */}
          </div>
        </div>
        <div className="intelectual-property">
          {/* <div className="">ინტელექტუალური საკუთრების უფლებაზე</div> */}
          <Link to="/intelectual-property">
          ინტელექტუალური საკუთრების უფლებაზე
          </Link>
          {/* <span></span> */}
          {/* <span>ინტელექტუალური საკუთრება საკუთრების უფლების შეზღუდვაა</span>
          <br></br>
          <span>ყველა საავტორო უფლების თავზეც გავიარე</span> */}
        </div>
      </div>
    </div>
  );
}

export default Footer;
