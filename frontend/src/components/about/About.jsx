import { useState, useRef } from "react";
import PropTypes from "prop-types";
import "./About.scss"; // ჩავანაცვლეთ CSS მოდულის იმპორტი

export default function About({ desc, compact }) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const buttonRef = useRef(null);

  const toggleAbout = () => setIsAboutOpen((prev) => !prev);

  return (
    <section className={compact ? "about compact" : "about"}>
      <button
        ref={buttonRef}
        className="aboutToggle"
        onClick={toggleAbout}
        aria-expanded={isAboutOpen}
      >
        აღწერა
      </button>

      {isAboutOpen && (
        <div className="aboutModal">
          <div className="aboutContent">
            <h2 className="aboutHeader">
              {desc.h2}
              <button
                className="closeButton"
                onClick={toggleAbout}
                aria-label="დახურვა"
              >
                ✕
              </button>
            </h2>
            <p className="aboutParagraph">{desc.p}</p>
          </div>
        </div>
      )}
    </section>
  );
}

About.propTypes = {
  desc: PropTypes.shape({
    h2: PropTypes.string.isRequired,
    p: PropTypes.string.isRequired,
  }).isRequired,
  compact: PropTypes.bool
};

About.defaultProps = {
  compact: false
};